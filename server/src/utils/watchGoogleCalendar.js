const watchGoogleCalendar = async (user) => {
    try {
        oauth2Client.setCredentials({ refresh_token: user?.refreshToken });

        const calendar = google.calendar('v3');
        const watchResponse = await calendar.events.watch({
            auth: oauth2Client,
            calendarId: 'primary',
            requestBody: {
                id: 'unique-channel-id',
                type: 'webhook',
                address: 'http://localhost:3000/google-calendar-webhook', 
                params: {
                    ttl: 3600, 
                },
            },
        });

        console.log('Subscribed to Google Calendar changes:', watchResponse.data);
        
    } catch (error) {
        console.error('Error setting up Google Calendar watch:', error);
    }
};

module.exports = watchGoogleCalendar;