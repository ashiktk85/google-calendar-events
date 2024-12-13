const axios = require('axios');
const User = require('../models/user');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const Event = require('../models/events');
const crypto = require('crypto');
const { default: fetchEventFromGoogle } = require('../utils/fetchEventFromGoogle');
const { default: verifyGoogleNotification } = require('../utils/verifyGoogleNotification');
const saveNewEvent = require('../utils/saveEvent');
const updateEventInDatabase = require('../utils/updateEventDB');
const deleteEventFromDatabase = require('../utils/deleteEventDB');
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5173'
);

const createCalendarEvent = async (req, res) => {
    try {
        const { email, values } = req.body;

        const user = await User.findOne({ email });
        
        oauth2Client.setCredentials({ refresh_token: user?.refreshToken });

        const calendar = google.calendar('v3');
        const response = await calendar.events.insert({
            auth: oauth2Client,
            calendarId: "primary",
            requestBody: {
                summary: values.name,
                colorId: '9',
                start: {
                    dateTime: new Date(`${values.date}T${values.time}:00`),
                    timeZone: 'America/Los_Angeles',
                },
                end: {
                    dateTime: new Date(new Date(`${values.date}T${values.time}:00`).getTime() + 60 * 60 * 1000), // 1 hour after start
                    timeZone: 'America/Los_Angeles',
                },
            },
        });

        const event = new Event({
            email: email,
            name: values.name,
            date: values.date,
            time: values.time,
        });

        await event.save();
        console.log("Created event in calendar and database.");

        res.status(201).json(true);
    } catch (error) {
        console.error('Error during creating calendar:', error.message);
        res.status(500).json({ message: 'Event creation failed' });
    }
};

const getEvents = async (req, res) => {
    try {
        const { email } = req.params;
        const events = await Event.find({ email });
        res.status(200).json(events);
    } catch (error) {
        console.error('Error during getting events:', error.message);
        res.status(500).json({ message: 'Getting events failed' });
    }
};


const googleCalendarWebhook = async (req, res) => {
    const { headers, body } = req;
    if (!verifyGoogleNotification(headers, body)) {
        return res.status(400).send('Invalid webhook notification');
    }
    const eventData = body;

    try {
        const { email, eventId, status } = eventData;

        if (status === 'updated') {
            const event = await fetchEventFromGoogle(eventId, email);
            await updateEventInDatabase(event);
        } else if (status === 'created') {
            const event = await fetchEventFromGoogle(eventId, email);
            await saveNewEvent(event);
        } else if (status === 'deleted') {
            await deleteEventFromDatabase(eventId, email);
        }

        res.status(200).send('Event change processed');
    } catch (error) {
        console.error('Error processing calendar event notification:', error);
        res.status(500).send('Error processing event notification');
    }
};


module.exports = { createCalendarEvent, getEvents, googleCalendarWebhook };
