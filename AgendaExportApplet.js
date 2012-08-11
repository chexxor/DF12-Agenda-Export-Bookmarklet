
window.speakerStringFromSpeakerArray = function(speakerArray) {

	var speakerString = '';

	//speakerArray looks like this:
	//[Object { firstName="Alex", id="a0A3000000SXCFBEA5", lastName="Berg"}, Object {...}]

	var speakerNameArray = [];

	for (var i = 0; i < speakerArray.length; i++) {
		var speakerObj = speakerArray[i];
		var speakerName = speakerObj.firstName + ' ' + speakerObj.lastName;
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
	//speakers:[Object { firstName="Alex", id="a0A3000000SXCFBEA5", lastName="Berg"}]
	//startTime:"12:00PM", userBookmarked:false, userCanRegister:true, userCanRemove:true, userIsRegistered:true
	//}

	var sessionCsvArray = [];

	var subject = '"' + sessionDetailObj.name + '"';
	var startDate = sessionDetailObj.day;
	var startTime = window.gcalDateFromSfDate(sessionDetailObj.startTime);
	var endDate = sessionDetailObj.day;
	var endTime = sessionDetailObj.endTime;
	var isAllDayEvent = 'False';
	var description = '"' + sessionDetailObj.shortDescription + ' \n\nSpeakers:\n' + window.speakerStringFromSpeakerArray(sessionDetailObj.speakers) + '"';//Value can contain commas if wrapped in quotes like this.
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
	console.log('post-render');
	$Cloud.destroyPanel();

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
	var detailViewComplete = detailView.replace('DISPLAY_CONTENT_HERE', contentToShow);

	var htmlForPanel = detailViewComplete;
	//console.log('htmlForPanel: ', htmlForPanel);
	//$('#panels').append(contentToShow);
	$('#panels').append(htmlForPanel);

	//$('#contentSections').hide().html(htmlForPanel).fadeIn();
	if (!$('#panelScroller2').hasClass('uiScroller')) {
		$Cloud.fixDetailsHeight();
	} else {
		$Cloud.refreshScrollers('panelScroller2');
	}

	//Post-render
	console.log('post-render');
	//$Cloud.handlePanelScroll();

}


window.exportAgenda = function() {

	window.agendaCsvString = '';
	var agendaCsvHeader = 'Subject,Start Date,Start Time,End Date,End Time,All Day Event,Description,Location,Private\n';
	window.agendaCsvString += agendaCsvHeader;
	//console.log('window.agendaCsvString: ' + window.agendaCsvString);

	$Cloud.getData({
		type: 'get',
		method: 'getAllEnrollmentsForAllDays',
		viewHandler: function(response, opts) {
			//console.log('response: ', response);
			//console.log('opts: ', opts);
			var agendaDayArray = response;
			//response should be an array, like this:
			//[Object { dateOfDay="09/18/2012", timeslots=[24]}, Object { dateOfDay="09/19/2012", timeslots=[24]}...]
			for (var i = 0; i < agendaDayArray.length; i++) {
				var agendaDay = agendaDayArray[i];
				//console.log(agendaDay);
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
						//console.log('sessionDetailCsvString: ', sessionDetailCsvString);
						window.agendaCsvString += sessionDetailCsvString + '\n';
						
					}
				}
			}

			//console.log('completed sessionCsv: ', window.agendaCsvString);
			//alert(window.agendaCsvString);
			window.showTextInCloudPanel(window.agendaCsvString);

		}
	});


}

window.exportAgenda();
