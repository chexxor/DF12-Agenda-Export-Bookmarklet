window.speakerStringFromSpeakerArray=function(a){var b="";var c=[];for(var d=0;d<a.length;d++){var e=a[d];var f=e.firstName+" "+e.lastName;c.push(" "+f)}b=c.join(",");return b};window.gcalDateFromSfDate=function(a){var b="";if(a.indexOf("AM")!=-1)b=a.replace("AM"," AM");else if(a.indexOf("PM")!=-1)b=a.replace("PM"," PM");return b};window.sessionCsvFromSessionDetails=function(a){var b="";var c=[];var d='"'+a.name+'"';var e=a.day;var f=window.gcalDateFromSfDate(a.startTime);var g=a.day;var h=a.endTime;var i="False";var j='"'+a.shortDescription+" \n\nSpeakers:\n"+window.speakerStringFromSpeakerArray(a.speakers)+'"';var k='"'+a.room.location+'"';var l="False";c.push(d);c.push(e);c.push(f);c.push(g);c.push(h);c.push(i);c.push(j);c.push(k);c.push(l);b=c.join(",");return b};window.showTextInCloudPanel=function(a){$Cloud.destroyPanel();var b=a.replace(/\r\n/g,"<br>");$("#loadingMask").show().one("click",$Cloud.destroyPanel);var c='<div class="panelHeaderBar fixedBar"><div class="bLeft"></div><div class="bRight"><span class="uiButton submit back">Close</span></div><div class="bBody"><h3 class="flush truncate"> Agenda CSV for Google Calendar </h3></div></div>';var d='<div id="panelScroller2" class="forceScroller"><div id="contentSections" class="padGrid fontSizeSmall"><div class="detailsSection detailsSection0">Copy everything below this line and save it into a new text file on your computer. Use Google Calendar to import this file.</div><div class="detailsSection detailsSection0"><div class="detailsAccordionSection padGrid"><div id="activityDescription" class="alternate fontSizeSmall">DISPLAY_CONTENT_HERE</div></div></div></div></div>';var e='<div id="detailView" style="overflow-y: auto;><div id="detailViewContent" style="opacity: 1;">WRAPPED_ELEMENTS</div></div>';var f=e.replace("WRAPPED_ELEMENTS",c+d);var g=f.replace("DISPLAY_CONTENT_HERE",b);var h=g;$("#panels").append(h);if(!$("#panelScroller2").hasClass("uiScroller")){$Cloud.fixDetailsHeight()}else{$Cloud.refreshScrollers("panelScroller2")}};window.exportAgenda=function(){window.agendaCsvString="";var a="Subject,Start Date,Start Time,End Date,End Time,All Day Event,Description,Location,Private\r\n";window.agendaCsvString+=a;$Cloud.getData({type:"get",method:"getAllEnrollmentsForAllDays",viewHandler:function(a,b){var c=a;for(var d=0;d<c.length;d++){var e=c[d];var f=e.timeslots;for(var g=0;g<f.length;g++){var h=f[g];var i=h.items.length>0;if(i==true){var j=h.items[0];var k=window.sessionCsvFromSessionDetails(j);window.agendaCsvString+=k+"\r\n"}}}window.showTextInCloudPanel(window.agendaCsvString)}})};window.exportAgenda()
