
/********* Start BlobBuilder.js definition ***/

var BlobBuilder = BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder || (function(view) {
"use strict";
var
	  get_class = function(object) {
		return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
	}
	, FakeBlobBuilder = function(){
		this.data = [];
	}
	, FakeBlob = function(data, type, encoding) {
		this.data = data;
		this.size = data.length;
		this.type = type;
		this.encoding = encoding;
	}
	, FBB_proto = FakeBlobBuilder.prototype
	, FB_proto = FakeBlob.prototype
	, FileReaderSync = view.FileReaderSync
	, FileException = function(type) {
		this.code = this[this.name = type];
	}
	, file_ex_codes = (
		  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
		+ "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
	).split(" ")
	, file_ex_code = file_ex_codes.length
	, realURL = view.URL || view.webkitURL || view
	, real_create_object_URL = realURL.createObjectURL
	, real_revoke_object_URL = realURL.revokeObjectURL
	, URL = realURL
	, btoa = view.btoa
	, atob = view.atob
	, can_apply_typed_arrays = false
	, can_apply_typed_arrays_test = function(pass) {
		can_apply_typed_arrays = !pass;
	}

	, ArrayBuffer = view.ArrayBuffer
	, Uint8Array = view.Uint8Array
;
FakeBlobBuilder.fake = FB_proto.fake = true;
while (file_ex_code--) {
	FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
}
try {
	if (Uint8Array) {
		can_apply_typed_arrays_test.apply(0, new Uint8Array(1));
	}
} catch (ex) {}
if (!realURL.createObjectURL) {
	URL = view.URL = {};
}
URL.createObjectURL = function(blob) {
	var
		  type = blob.type
		, data_URI_header
	;
	if (type === null) {
		type = "application/octet-stream";
	}
	if (blob instanceof FakeBlob) {
		data_URI_header = "data:" + type;
		if (blob.encoding === "base64") {
			return data_URI_header + ";base64," + blob.data;
		} else if (blob.encoding === "URI") {
			return data_URI_header + "," + decodeURIComponent(blob.data);
		} if (btoa) {
			return data_URI_header + ";base64," + btoa(blob.data);
		} else {
			return data_URI_header + "," + encodeURIComponent(blob.data);
		}
	} else if (real_create_object_url) {
		return real_create_object_url.call(realURL, blob);
	}
};
URL.revokeObjectURL = function(object_url) {
	if (object_url.substring(0, 5) !== "data:" && real_revoke_object_url) {
		real_revoke_object_url.call(realURL, object_url);
	}
};
FBB_proto.append = function(data/*, endings*/) {
	var bb = this.data;
	// decode data to a binary string
	if (Uint8Array && data instanceof ArrayBuffer) {
		if (can_apply_typed_arrays) {
			bb.push(String.fromCharCode.apply(String, new Uint8Array(data)));
		} else {
			var
				  str = ""
				, buf = new Uint8Array(data)
				, i = 0
				, buf_len = buf.length
			;
			for (; i < buf_len; i++) {
				str += String.fromCharCode(buf[i]);
			}
		}
	} else if (get_class(data) === "Blob" || get_class(data) === "File") {
		if (FileReaderSync) {
			var fr = new FileReaderSync;
			bb.push(fr.readAsBinaryString(data));
		} else {
			// async FileReader won't work as BlobBuilder is sync
			throw new FileException("NOT_READABLE_ERR");
		}
	} else if (data instanceof FakeBlob) {
		if (data.encoding === "base64" && atob) {
			bb.push(atob(data.data));
		} else if (data.encoding === "URI") {
			bb.push(decodeURIComponent(data.data));
		} else if (data.encoding === "raw") {
			bb.push(data.data);
		}
	} else {
		if (typeof data !== "string") {
			data += ""; // convert unsupported types to strings
		}
		// decode UTF-16 to binary string
		bb.push(unescape(encodeURIComponent(data)));
	}
};
FBB_proto.getBlob = function(type) {
	if (!arguments.length) {
		type = null;
	}
	return new FakeBlob(this.data.join(""), type, "raw");
};
FBB_proto.toString = function() {
	return "[object BlobBuilder]";
};
FB_proto.slice = function(start, end, type) {
	var args = arguments.length;
	if (args < 3) {
		type = null;
	}
	return new FakeBlob(
		  this.data.slice(start, args > 1 ? end : this.data.length)
		, type
		, this.encoding
	);
};
FB_proto.toString = function() {
	return "[object Blob]";
};
return FakeBlobBuilder;
}(self));

/********* End BlobBuilder.js definition ***/

/********* Start FileSaver.js definition ***/

var saveAs = saveAs || (function(view) {
	"use strict";
	var
		  doc = view.document
		  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, URL = view.URL || view.webkitURL || view
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = doc.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, view, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			return node.dispatchEvent(event); // false if event was cancelled
		}
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function (ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		, deletion_queue = []
		, process_deletion_queue = function() {
			var i = deletion_queue.length;
			while (i--) {
				var file = deletion_queue[i];
				if (typeof file === "string") { // file is an object URL
					URL.revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			}
			deletion_queue.length = 0; // clear queue
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, FileSaver = function(blob, name) {
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, get_object_url = function() {
					var object_url = get_URL().createObjectURL(blob);
					deletion_queue.push(object_url);
					return object_url;
				}
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_object_url(blob);
					}
					target_view.location.href = object_url;
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_object_url(blob);
				save_link.href = object_url;
				save_link.download = name;
				if (click(save_link)) {
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					return;
				}
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			} else {
				target_view = view.open();
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									deletion_queue.push(file);
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name) {
			return new FileSaver(blob, name);
		}
	;
	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	view.addEventListener("unload", process_deletion_queue, false);
	return saveAs;
}(self));

/******************** End FileSaver.js definition ***/


window.speakerStringFromSpeakerArray = function(speakerArray) {

	var speakerString = '';

	//speakerArray looks like this:
	//[Object { firstName="Alex", id="a0A3000000SXCFBEA5", lastName="Berg"}, Object {...}]

	var speakerNameArray = [];

	for (var i = 0; i < speakerArray.length; i++) {
		var speakerObj = speakerArray[i];
		var speakerName = speakerObj.name;
		speakerNameArray.push(' ' + speakerName);
	}

	speakerString = speakerNameArray.join(',');
	//console.log('speakerString: ', speakerString);

	return speakerString;

}

window.gcalDateFromSfDate = function(sfDate) {

	var gcalDate = '';

	if (sfDate.indexOf('AM') != -1)
		gcalDate = sfDate.replace('AM', ' AM');
	else if (sfDate.indexOf('PM') != -1)
		gcalDate = sfDate.replace('PM', ' PM');

	return gcalDate;

}

window.sessionCsvFromSessionDetails = function(sessionDetailObj) {

	var sessionCsvString = '';

	//sessionDetailObj should look like this:
	//{
	//code: "http://goo.gl/wAki9", day:"09/19/2012", endTime:"01:00PM", id:"a093000000VhYKSAA3",
	//industryTags:[], itemType:"Dreamforce", level:"Intermediate", name:"Creating and Using Visualforce Mobile Components",
	//openCapacity:258, productTags:[], roleTags:[],
	//room:Object { id="a1930000001YZbdAAG", location="Moscone Center West", mapUrl="https://secure.sfdcstat.../maps/7_Camp_M_West.png", more...},
	//shortDescription:"Tablets and smartphones...ent to fill your needs.",
	//speakers:[Object { Account="Sundog", name="Alex Berg", id="a0A3000000SXCFBEA5" }]
	//startTime:"12:00PM", userBookmarked:false, userCanRegister:true, userCanRemove:true, userIsRegistered:true
	//}

	var sessionCsvArray = [];

	var subject = '"' + sessionDetailObj.name + '"';
	var startDate = sessionDetailObj.day;
	var startTime = window.gcalDateFromSfDate(sessionDetailObj.startTime);
	var endDate = sessionDetailObj.day;
	var endTime = sessionDetailObj.endTime;
	var isAllDayEvent = 'False';
	var description = '"' + sessionDetailObj.shortDescription + ' \r\n\nSpeakers:\n' + window.speakerStringFromSpeakerArray(sessionDetailObj.speakers) + '"';//Value can contain commas if wrapped in quotes like this.
	var location = '"' + sessionDetailObj.room.location + '"';
	var isPrivate = 'False';

	sessionCsvArray.push(subject);
	sessionCsvArray.push(startDate);
	sessionCsvArray.push(startTime);
	sessionCsvArray.push(endDate);
	sessionCsvArray.push(endTime);
	sessionCsvArray.push(isAllDayEvent);
	sessionCsvArray.push(description);
	sessionCsvArray.push(location);
	sessionCsvArray.push(isPrivate);

	sessionCsvString = sessionCsvArray.join(',');

	return sessionCsvString;

}

window.showTextInCloudPanel = function(contentToShow) {

	//Pre-render
	$Cloud.destroyPanel();

	var htmlToShow = contentToShow.replace(/\r\n/g, "<br>");


	//Render panel
	$('#loadingMask').show().one('click', $Cloud.destroyPanel);

	//Add header to templ.
	//Header and scroller are siblings
	var panelHeaderbarHtml = '<div class="panelHeaderBar fixedBar"><div class="bLeft"></div><div class="bRight"><span class="uiButton submit back">Close</span></div><div class="bBody"><h3 class="flush truncate"> Agenda CSV for Google Calendar </h3></div></div>';
	var panelScrollerHtml = '<div id="panelScroller2" class="forceScroller"><div id="contentSections" class="padGrid fontSizeSmall"><div class="detailsSection detailsSection0">Copy everything below this line and save it into a new text file on your computer. Use Google Calendar to import this file.</div><div class="detailsSection detailsSection0"><div class="detailsAccordionSection padGrid"><div id="activityDescription" class="alternate fontSizeSmall">DISPLAY_CONTENT_HERE</div></div></div></div></div>';
	//These wrap the header and content
	var detailViewWrapperHtml = '<div id="detailView" style="overflow-y: auto;><div id="detailViewContent" style="opacity: 1;">WRAPPED_ELEMENTS</div></div>';

	//Build template from its elements.
	var detailView = detailViewWrapperHtml.replace('WRAPPED_ELEMENTS', panelHeaderbarHtml + panelScrollerHtml);
	var detailViewComplete = detailView.replace('DISPLAY_CONTENT_HERE', htmlToShow);

	var htmlForPanel = detailViewComplete;
	//$('#panels').append(contentToShow);
	$('#panels').append(htmlForPanel);

	//$('#contentSections').hide().html(htmlForPanel).fadeIn();
	if (!$('#panelScroller2').hasClass('uiScroller')) {
		$Cloud.fixDetailsHeight();
	} else {
		$Cloud.refreshScrollers('panelScroller2');
	}

	//Post-render
	//$Cloud.handlePanelScroll();

}


window.exportGoogleCsvAgenda = function() {

	window.agendaCsvString = '';
	var agendaCsvHeader = 'Subject,Start Date,Start Time,End Date,End Time,All Day Event,Description,Location,Private\r\n';
	window.agendaCsvString += agendaCsvHeader;

	$Cloud.getData({
		type: 'get',
		method: 'getAllEnrollmentsForAllDays',
		viewHandler: function(response, opts) {
			var agendaDayArray = response;
			//response should be an array, like this:
			//[Object { dateOfDay="09/18/2012", timeslots=[24]}, Object { dateOfDay="09/19/2012", timeslots=[24]}...]
			for (var i = 0; i < agendaDayArray.length; i++) {
				var agendaDay = agendaDayArray[i];
				var timeSlotArray = agendaDay.timeslots;
				//timeSlotArray looks like this:
				//[Object { items=[0], timeOfDay="0:00"}, Object { items=[0], timeOfDay="1:00"}...]
				for (var j = 0; j < timeSlotArray.length; j++) {
					var timeSlot = timeSlotArray[j]
					var hasSessionInTimeSlot = (timeSlot.items.length > 0);
					if (hasSessionInTimeSlot == true) {
						var sessionDetailObj = timeSlot.items[0];
						//console.log('sessionDetailObj: ', sessionDetailObj);
						var sessionDetailCsvString = window.sessionCsvFromSessionDetails(sessionDetailObj);
						window.agendaCsvString += sessionDetailCsvString + '\r\n';
						
					}
				}
			}

			window.showTextInCloudPanel(window.agendaCsvString);
			//Call FileSaver.js method: 'saveAs'
			var bb = new BlobBuilder;
			bb.append(window.agendaCsvString);
			saveAs(bb.getBlob("text/plain;charset=utf-8"), "AgendaGoogleCsvExport.csv");

		}
	});


}

window.exportGoogleCsvAgenda();
