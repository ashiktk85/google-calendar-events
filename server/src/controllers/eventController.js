const { google } = require('googleapis');
const CalendarEvent = require('../models/events')
const User = require('../models/user');
const fetchEventsFromGoogle = require('../utils/fetchEventsFromGoogle');
const oauth2Client = require('../utils/googleAuth');

function generateUniqueCode() {
    const timestamp = Date.now(); 
    const randomNum = Math.floor(Math.random() * 1000000); 
    return `${timestamp}-${randomNum}`; 
}

const createCalendarEvent = async (req, res) => {
    try {
        const { email, values } = req.body;
        const existingEvent = await CalendarEvent.findOne({
            email,
            name: values.name,
            date: values.date,
            time: values.time,
        });

        if (existingEvent) {
            return res.status(400).json({ message: 'Event already exists' });
        }

        const user = await User.findOne({ email });
        if (!user?.refreshToken) {
            return res.status(400).json({ message: 'No refresh token found for the user' });
        }

        oauth2Client.setCredentials({ refresh_token: user.refreshToken });

        const calendar = google.calendar('v3');
        const response = await calendar.events.insert({
            auth: oauth2Client,
            calendarId: 'primary',
            requestBody: {
                summary: values.name,
                colorId: '9',
                start: {
                    dateTime: new Date(`${values.date}T${values.time}:00`),
                    timeZone: 'America/Los_Angeles',
                },
                end: {
                    dateTime: new Date(new Date(`${values.date}T${values.time}:00`).getTime() + 60 * 60 * 1000),
                    timeZone: 'America/Los_Angeles',
                },
            },
        });

        const googleEventId = response.data.id;
        const event = new CalendarEvent({
            email,
            name: values.name,
            date: values.date,
            time: values.time,
            startTime: new Date(`${values.date}T${values.time}:00`).toISOString(),
            endTime: new Date(new Date(`${values.date}T${values.time}:00`).getTime() + 60 * 60 * 1000).toISOString(),
            googleEventId,
            lastSynced: new Date(),
        });

        await event.save();
        console.log("Created event in calendar and database with Google ID:", googleEventId);

        res.status(201).json(true);
    } catch (error) {
        console.error('Error during creating calendar:', error.message);
        res.status(500).json({ message: 'Event creation failed' });
    }
};

const getEvents = async (req, res) => {
    try {
        const { email } = req.params;
        const events = await CalendarEvent.find({ email }).sort({ startTime: 1 });
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error.message);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

const watchGoogleCalendarEvents = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user?.refreshToken) {
            return res.status(400).json({ message: 'No refresh token found for the user' });
        }

        oauth2Client.setCredentials({ refresh_token: user.refreshToken });
        const calendar = google.calendar('v3');

     
        console.log('User Data:', user);

       
        if (user.webhookChannelId) {
            return res.status(200).json({
                success: true,
                message: 'Webhook already set up.',
                channelId: user.webhookChannelId,
                resourceId: user.webhookResourceId,
                expiration: user.webhookExpiration,
            });
        }

        const webhookId = generateUniqueCode();
        const expirationTime = new Date();
        expirationTime.setDate(expirationTime.getDate() + 7);

        const response = await calendar.events.watch({
            auth: oauth2Client,
            calendarId: 'primary',
            requestBody: {
                id: webhookId,
                type: 'web_hook',
                address: process.env.WEBHOOK_URL || "https://your-domain.com/webhook",
                expiration: expirationTime.getTime().toString(),
            },
        });


        console.log('Webhook Created Successfully:', response.data);

        user.webhookChannelId = response.data.id;
        user.webhookResourceId = response.data.resourceId;
        user.webhookExpiration = new Date(parseInt(response.data.expiration));
        await user.save();

        res.status(200).json({
            success: true,
            channelId: response.data.id,
            resourceId: response.data.resourceId,
            expiration: response.data.expiration,
        });
    } catch (error) {
        console.error('Error during webhook setup:', error.message);
        res.status(500).json({ message: 'Error during webhook setup' });
    }
};



const handleWebhookNotification = async (req, res) => {
    try {
    
        console.log('Webhook Headers:', req.headers);
        console.log('Webhook Body:', req.body);


        const channelId = req.headers['x-goog-channel-id'];
        const resourceId = req.headers['x-goog-resource-id'];
        const resourceState = req.headers['x-goog-resource-state'];

        if (!channelId || !resourceId) {
            console.log('Missing required webhook headers:', {
                channelId,
                resourceId,
                headers: req.headers
            });
            return res.status(400).json({
                message: 'Missing required webhook headers'
            });
        }

        const user = await User.findOne({ webhookChannelId: channelId });
        console.log('Found User for Webhook Channel ID:', user);

        if (!user) {
            console.log(`No user found for webhook channel: ${channelId}`);
            return res.status(404).json({
                message: 'No user found for this webhook channel ID'
            });
        }
        if (resourceState === 'exists') {
       
            oauth2Client.setCredentials({ refresh_token: user.refreshToken });

            const events = await fetchEventsFromGoogle(oauth2Client);
    
            for (const event of events) {
                await CalendarEvent.findOneAndUpdate(
                    { googleEventId: event.id, email: user.email },
                    {
                        name: event.summary,
                        startTime: event.start.dateTime,
                        endTime: event.end.dateTime,
                        lastSynced: new Date()
                    },
                    { upsert: true }
                );
            }

            console.log(`Successfully processed calendar update for user: ${user.email}`);
        }

        return res.status(200).json({
            success: true,
            message: 'Notification processed'
        });

    } catch (error) {
        console.error('Error processing webhook notification:', error);
   
        return res.status(200).json({
            success: false,
            message: 'Error processing notification'
        });
    }
};


const stopWatchingCalendar = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user?.webhookChannelId || !user?.webhookResourceId) {
            return false;
        }

        const calendar = google.calendar('v3');
        await calendar.channels.stop({
            auth: oauth2Client,
            requestBody: {
                id: user.webhookChannelId,
                resourceId: user.webhookResourceId
            }
        });

        user.webhookChannelId = null;
        user.webhookResourceId = null;
        user.webhookExpiration = null;
        await user.save();

        return true;
    } catch (error) {
        console.error('Error stopping calendar watch:', error);
        return false;
    }
};

module.exports = {
    createCalendarEvent,
    getEvents,
    watchGoogleCalendarEvents,
    handleWebhookNotification,
    stopWatchingCalendar
};