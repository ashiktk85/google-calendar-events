const { google } = require('googleapis');
const fetchEventsFromGoogle = async (oauth2Client) => {
    const calendar = google.calendar('v3');
    
    try {

        const response = await calendar.events.list({
            auth: oauth2Client,
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10, 
            singleEvents: true,  
            orderBy: 'startTime',
        });
        
        const events = response.data.items;


        return events.map(event => ({
            googleEventId: event.id,
            summary: event.summary,
            startTime: event.start.dateTime || event.start.date, 
            endTime: event.end.dateTime || event.end.date,
        }));
    } catch (error) {
        console.error('Error fetching events from Google Calendar:', error);
        return [];
    }
};


module.exports = fetchEventsFromGoogle;
