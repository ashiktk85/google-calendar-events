async function fetchEventFromGoogle(eventId, email) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:5173' 
    );

    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const calendar = google.calendar('v3');
    try {
        const response = await calendar.events.get({
            auth: oauth2Client,
            calendarId: 'primary',
            eventId: eventId,
        });
        return response.data; 
    } catch (error) {
        console.error('Error fetching event from Google:', error);
        throw error;
    }
}

module.exports =  fetchEventFromGoogle;