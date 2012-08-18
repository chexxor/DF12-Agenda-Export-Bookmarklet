
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

window.zeroFill = function( number, width )
{
	width -= number.toString().length;
	if ( width > 0 )
	{
		return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
	}
	return number + ""; // always return a string
}

window.icalDateTimeFromSfDateAndTime = function(sfDate, sfTime) {
	
	var icalDateTime = '';
	
	//Parameters should look like this:
	//sfDate:"09/19/2012"
	//sfTime:"01:00PM",
	
	//ical date should look like this:
	//DTSTART:19970714T170000Z = July 14th, 1997 5pm
	
	var sfDateComponents = sfDate.split('/');
	var sfDateYear = sfDateComponents[2];
	var sfDateMonth = sfDateComponents[0];
	var sfDateDate = sfDateComponents[1];
	var isAfternoon = false;
	if (sfTime.indexOf('AM') != -1) {
		sfTime = sfTime.replace('AM', '');
	}
	if (sfTime.indexOf('PM') != -1) {
		sfTime = sfTime.replace('PM', '');
		isAfternoon = true;
	}
	var sfTimeComponents = sfTime.split(':');
	var sfTimeHour = sfTimeComponents[0];
	if (isAfternoon) {
		if (+sfTimeHour < 12)//Account for afternoon. Except if 12pm noon.
			sfTimeHour = +sfTimeHour + 12;
	}
	var sfTimeMinute = sfTimeComponents[1];
	var jsDateTime = new Date(sfDateYear, sfDateMonth, sfDateDate, sfTimeHour, sfTimeMinute);
	//console.log('jsDateTime: ', jsDateTime);
	
	icalDateTime += jsDateTime.getFullYear();
	icalDateTime += window.zeroFill(jsDateTime.getMonth() +'', 2);
	icalDateTime += window.zeroFill(jsDateTime.getDate() + '', 2);
	icalDateTime += 'T' + window.zeroFill(jsDateTime.getHours() + '', 2);
	icalDateTime += window.zeroFill(jsDateTime.getMinutes() + '', 2);
	icalDateTime += window.zeroFill(jsDateTime.getSeconds() + '', 2);
	//icalDateTime += 'Z';//'Z' marks this time string as UTC. Can't use UTC if we specify time zone.
	
	return icalDateTime;
	
}

window.icalDateTimeNow = function() {
	
	var icalDateTimeNow = '';
	//The format is like this for UTC time.
	//DTSTAMP:19970714T170000Z
	
	var currentDateTime = new Date();
	
	icalDateTimeNow += currentDateTime.getFullYear() + '';
	icalDateTimeNow += window.zeroFill(currentDateTime.getMonth() + '', 2);
	icalDateTimeNow += window.zeroFill(currentDateTime.getDate() + '', 2);
	icalDateTimeNow += 'T' + window.zeroFill(currentDateTime.getHours() + '', 2);
	icalDateTimeNow += window.zeroFill(currentDateTime.getMinutes() + '', 2);
	icalDateTimeNow += window.zeroFill(currentDateTime.getSeconds() + '', 2);
	//icalDateTimeNow += 'Z';//'Z' marks this time string as UTC. Can't use UTC if we specify time zone.
	
	return icalDateTimeNow;
	
}

window.buildTimezoneComponentString = function() {
	
	var timezoneComponentString = '';
	
	timezoneComponentString += 'BEGIN:VTIMEZONE\r\n';
	timezoneComponentString += 'TZID:US-Pacific\r\n';
	timezoneComponentString += 'BEGIN:STANDARD\r\n';
	timezoneComponentString += 'TZOFFSETFROM:-0700\r\n';
	timezoneComponentString += 'TZOFFSETTO:-0800\r\n';
	timezoneComponentString += 'DTSTART:19671029T020000\r\n';
	timezoneComponentString += 'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10\r\n';
	timezoneComponentString += 'TZNAME:PST\r\n';
	timezoneComponentString += 'END:STANDARD\r\n';
	timezoneComponentString += 'BEGIN:DAYLIGHT\r\n';
	timezoneComponentString += 'TZOFFSETFROM:-0800\r\n';
	timezoneComponentString += 'TZOFFSETTO:-0700\r\n';
	timezoneComponentString += 'DTSTART:19870405T020000\r\n';
	timezoneComponentString += 'RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=4\r\n';
	timezoneComponentString += 'TZNAME:PDT\r\n';
	timezoneComponentString += 'END:DAYLIGHT\r\n';
	timezoneComponentString += 'END:VTIMEZONE\r\n';

	return timezoneComponentString;
}

window.encodeSpecialChars = function(stringToEncode) {
	
	var encodedString = stringToEncode.replace(/,/g, '\\,');
	encodedString = encodedString.replace(/;/g, '\\;');
	
	return encodedString;
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

window.sessionVeventStringFromSessionDetails = function(sessionDetailObj) {
	
	var sessionVeventString = '';

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
	
	var sessionVeventRowArray = [];
	
	/*
	BEGIN:VEVENT
	UID:uid1@example.com
	DTSTAMP:19970714T170000Z
	ORGANIZER;CN=John Doe:MAILTO:john.doe@example.com
	DTSTART:19970714T170000Z
	DTEND:19970715T035959Z
	SUMMARY:Bastille Day Party
	END:VEVENT
	*/
    
    var startEventRow = 'BEGIN:VEVENT';
	sessionVeventRowArray.push(startEventRow);
	//var uidRow = 'UID:' + sessionDetailObj.id;//Google Calendar keeps history of these ids, won't allow re-import after delete.
	//sessionVeventRowArray.push(uidRow);
	var dtstampRow = 'DTSTAMP:' + window.icalDateTimeNow();
	sessionVeventRowArray.push(dtstampRow);
	if (sessionDetailObj.speakers) {
		var organizerRow = 'ORGANIZER:CN=' + window.speakerStringFromSpeakerArray(sessionDetailObj.speakers);
		sessionVeventRowArray.push(organizerRow);
	}
	var dtStartRow = 'DTSTART;TZID=US-Pacific:' + window.icalDateTimeFromSfDateAndTime(sessionDetailObj.day, sessionDetailObj.startTime);
	sessionVeventRowArray.push(dtStartRow);
	var dtEndRow = 'DTEND;TZID=US-Pacific:' + window.icalDateTimeFromSfDateAndTime(sessionDetailObj.day, sessionDetailObj.endTime);
	sessionVeventRowArray.push(dtEndRow);
	if (sessionDetailObj.name) {
		var summaryRow = 'SUMMARY:' + window.encodeSpecialChars(sessionDetailObj.name);
		sessionVeventRowArray.push(summaryRow);
	}
	if (sessionDetailObj.shortDescription) {
		var descriptionRow = 'DESCRIPTION:' + window.encodeSpecialChars(sessionDetailObj.shortDescription) + ' \n\nSpeakers:\n' + window.encodeSpecialChars(window.speakerStringFromSpeakerArray(sessionDetailObj.speakers));
		sessionVeventRowArray.push(descriptionRow);
	}
	if (sessionDetailObj.room && sessionDetailObj.room.location) {
		var locationRow = 'LOCATION:' + window.encodeSpecialChars(sessionDetailObj.room.location);
		sessionVeventRowArray.push(locationRow);
	}
	if (sessionDetailObj.code) {
		var urlRow = 'URL:' + sessionDetailObj.code;
		sessionVeventRowArray.push(urlRow);
	}
	var endEventRow = 'END:VEVENT';
	sessionVeventRowArray.push(endEventRow);
	
	sessionVeventString = sessionVeventRowArray.join('\r\n');
	
	return sessionVeventString;
	
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


window.exportAgenda = function() {

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
						var sessionDetailCsvString = window.sessionCsvFromSessionDetails(sessionDetailObj);
						window.agendaCsvString += sessionDetailCsvString + '\r\n';
						
					}
				}
			}

			//alert(window.agendaCsvString);
			window.showTextInCloudPanel(window.agendaCsvString);

		}
	});


}

window.exportAgendaIcal = function() {

	window.agendaIcalString = '';
	
	//Create template for ical format. Later, we will construct a list of events
	//  to stick into the template, to replace the '[TOKEN_ICAL_BODY]' token.
	var TOKEN_ICAL_BODY = '[TOKEN_ICAL_BODY]';
	var TOKEN_ICAL_BODY_REGEX = /\[TOKEN\_ICAL\_BODY\]/;
	var icalTemplate = 'BEGIN:VCALENDAR\r\n';
	icalTemplate += 'VERSION:2.0 \r\n';
	icalTemplate += 'PRODID:-//https://github.com/chexxor/DF12-Agenda-Export-Bookmarklet v1.0//EN\r\n';
	var timezoneComponentString = window.buildTimezoneComponentString();
	icalTemplate += timezoneComponentString;
	icalTemplate += TOKEN_ICAL_BODY + '\r\n';
	icalTemplate += 'END:VCALENDAR\r\n';
	

	$Cloud.getData({
		type: 'get',
		method: 'getAllEnrollmentsForAllDays',
		viewHandler: function(response, opts) {
			var agendaDayArray = response;
			var sessionVeventArray = [];
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
						var sessionDetailVeventString = window.sessionVeventStringFromSessionDetails(sessionDetailObj);
						sessionVeventArray.push(sessionDetailVeventString);
					}
				}
			}
			
			var sessionVeventListString = sessionVeventArray.join('\r\n');
			
			window.agendaIcalString = icalTemplate.replace(TOKEN_ICAL_BODY_REGEX, sessionVeventListString);

			//alert(window.agendaCsvString);
			window.showTextInCloudPanel(window.agendaIcalString);

		}
	});


}

//window.exportAgenda();
window.exportAgendaIcal();
