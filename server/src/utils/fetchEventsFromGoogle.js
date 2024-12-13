const { google } = require('googleapis');
const fetchEventsFromGoogle = async (oauth2Client) => {
    const calendar = google.calendar('v3');
    
    try {
        // Fetch events from the user's Google Calendar
        const response = await calendar.events.list({
            auth: oauth2Client,
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),  // Fetch events from now onward
            maxResults: 10, // You can adjust the number of events returned
            singleEvents: true,  // Ensure recurring events are expanded
            orderBy: 'startTime',
        });
        
        const events = response.data.items;

        // Map over the events to return relevant fields, including googleEventId and summary
        return events.map(event => ({
            googleEventId: event.id,
            summary: event.summary,
            startTime: event.start.dateTime || event.start.date,  // Ensure a valid start time
            endTime: event.end.dateTime || event.end.date,
        }));
    } catch (error) {
        console.error('Error fetching events from Google Calendar:', error);
        return [];
    }
};


module.exports = fetchEventsFromGoogle;
