What This Is
============

Export your DF12 Session Agenda in a Google Calendar-compatible CSV format.



How To Use
==========


##Installation

Two methods of installing.

###For iCal export (most calendars):

- Create a new bookmark in your browser (many ways to do it). Use the following values:
    - Name = Agenda Export Applet
    - Location = javascript:(function(){%20%20%20_my_script=document.createElement('SCRIPT');%20%20%20_my_script.type='text/javascript';%20%20%20_my_script.src='https://raw.github.com/chexxor/DF12-Agenda-Export-Bookmarklet/master/AgendaIcalExportApplet_min.js?';%20%20%20document.getElementsByTagName('head')[0].appendChild(_my_script);%20})();

###For CSV export (only Google Calendar):

_Note: This CSV file does not record the timezone of the event, so you have to change your calendar's timezone before importing._
- Create a new bookmark in your browser (many ways to do it). Use the following values:
    - Name = Agenda Export Applet
    - Location = javascript:(function(){%20%20%20_my_script=document.createElement('SCRIPT');%20%20%20_my_script.type='text/javascript';%20%20%20_my_script.src='https://raw.github.com/chexxor/DF12-Agenda-Export-Bookmarklet/master/AgendaGoogleCsvExportApplet_min.js?';%20%20%20document.getElementsByTagName('head')[0].appendChild(_my_script);%20})();


![Add the bookmark](https://raw.github.com/chexxor/DF12-Agenda-Export-Bookmarklet/master/images/AddBookmark.png "Add Bookmark")

- *(Dang, I can't make the bookmarklet link pass through GitHub markdown. Maybe because of the Javascript 'href'. Anyone know how?)*

*Note: If you don't want to use the bookmarklet, copy the source code into a Javascript debugger, such as Firebug, and execute it anonymously on the page below.*


##Getting Export File
1. Once you have the bookmarklet, log in to the Dreamforce 2012 web app, and navigate to the Calendar View page. Here's the link to which I refer: [https://dreamevent.my.salesforce.com/apex/CalendarView](https://dreamevent.my.salesforce.com/apex/CalendarView).
![Go to CalendarView page](https://raw.github.com/chexxor/DF12-Agenda-Export-Bookmarklet/master/images/CalendarView.png "Go to CalendarView page")

2. On the Calendar View page, activate the bookmarklet. A loading icon should appear while the app loads your enrolled events. When it receives the response and processes the results, your browser will automatically save the export file.
![Activate the bookmark on the CalendarView page](https://raw.github.com/chexxor/DF12-Agenda-Export-Bookmarklet/master/images/BookmarkInBar.png "Activate the Bookmark")


##Importing into Google Calendar
Once you have the export file from the Dreamforce app, we can import it into Google Calendar. The instructions are also [here](http://support.google.com/calendar/bin/answer.py?hl=en&answer=37118), but I'll detail the steps on this page also.

1. Open Google Calendar.

2. Click the down-arrow next to **Other calendars**

3. Select **Import calendar**

![Click 'Import calendars'](https://raw.github.com/chexxor/DF12-Agenda-Export-Bookmarklet/master/images/SelectImport.png "Select 'Import calenders'")

4. Click **Choose file** and find the file that contains your events, then click **Open**.

5. Select the Google Calendar where you'd like to import events, then click **Import**.

![Select Export File](https://raw.github.com/chexxor/DF12-Agenda-Export-Bookmarklet/master/images/SelectExportFile.png "Select AgendaGoogleCsvExport.csv or AgendaIcalExport.ical and click 'Import'")

*Note: Importing the same file more than once may create duplicate events. Therefore, you might want to create a new calendar (method varies by application) in which to import your Dreamforce 2012 events. This makes it easy to delete events and re-import them later.*


##Problems?

I created this to scratch my own itch. I thought other people might have the same itch, so I took time to package it up a bit. I don't know what difficulties other people might encounter, so let me know if you have any problems.

If you need help, use the "Issues" tab on this GitHub page to report it. Maybe there is someone else who is having the same problem. :)

Alternatively, fork this repo, fix/improve it yourself, and submit a pull request.

Thanks for stopping by!



