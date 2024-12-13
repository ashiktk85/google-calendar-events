const { google } = require('googleapis');
const CalendarEvent = require('../models/events')
const User = require('../models/user');
const fetchEventsFromGoogle = require('../utils/fetchEventsFromGoogle');
const oauth2Client = require('../utils/googleAuth');

// const createCalendarEvent = async (req, res) => {
//     try {
//         const { email, values } = req.body;
//         const user = await User.findOne({ email });
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         oauth2Client.setCredentials({ refresh_token: user.refreshToken });
//         const calendar = google.calendar('v3');

//         const eventResponse = await calendar.events.insert({
//             auth: oauth2Client,
//             calendarId: 'primary',
//             requestBody: {
//                 summary: values.name,
//                 start: { dateTime: values.startDateTime, timeZone: 'America/Los_Angeles' },
//                 end: { dateTime: values.endDateTime, timeZone: 'America/Los_Angeles' },
//             },
//         });

//         const newEvent = new CalendarEvent({
//             email,
//             googleEventId: eventResponse.data.id,
//             name: values.name,
//             startDateTime: values.startDateTime,
//             endDateTime: values.endDateTime,
//         });
//         await newEvent.save();

//         res.status(201).json(newEvent);
//     } catch (error) {
//         console.error('Error creating event:', error.message);
//         res.status(500).json({ message: 'Event creation failed' });
//     }
// };

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
                    dateTime: new Date(new Date(`${values.date}T${values.time}:00`).getTime() + 60 * 60 * 1000), // 1 hour after start
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
        const events = await CalendarEvent.find({ email });
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error.message);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

const pollGoogleEvents = async () => {
    const users = await User.find({});
    for (const user of users) {
        oauth2Client.setCredentials({ refresh_token: user.refreshToken });
    
        const googleEvents = await fetchEventsFromGoogle(oauth2Client);

        for (const event of googleEvents) {

            if (!event.summary) {
  
                continue;
            }

       
            const existingEvent = await CalendarEvent.findOne({ googleEventId: event.googleEventId });
            if (!existingEvent) {

                await CalendarEvent.create({
                    googleEventId: event.googleEventId,
                    name: event.summary, 
                    startTime: event.startTime,
                    endTime: event.endTime,
                    email: user.email,
                });
            } else {

                await CalendarEvent.updateOne(
                    { googleEventId: event.googleEventId },
                    { googleEventId: event.googleEventId, name: event.summary, startTime: event.startTime, endTime: event.endTime, email: user.email }
                );
            }
        }
    }
};



module.exports = { createCalendarEvent, getEvents, pollGoogleEvents };
