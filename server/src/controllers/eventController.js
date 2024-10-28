const axios = require('axios');
const User = require('../models/user');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const user = require('../models/user');
dotenv.config();
const Event = require('../models/events')

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5173'
);

const createCalendarEvent = async (req, res) => {
    try {
        const {email ,values} = req.body

        const user = await User.findOne({email})
        // console.log(user);
        
        oauth2Client.setCredentials({refresh_token : user?.refreshToken})

        const calendar = google.calendar('v3')
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
                dateTime: new Date(new Date(`${values.date}T${values.time}:00`).getTime() + 60 * 60 * 1000), // End time 1 hour after start
                timeZone: 'America/Los_Angeles',
              },
            },
          });

          const update =  new Event({
            email : email,
            name : values.name,
            date : values.date,
            time : values.time
          })

         await  update.save()
         console.log("created");
         
          
       res.status(201).json(true)
    } catch (error) {
        console.error('Error during creating calendar:', error.message);
        res.status(500).json({ message: 'Event creation failed' });
    }
}


const getEvents = async (req ,res) => {
   try {
    const {email } = req.params
    const events = await Event.find({email})
    console.log(events);
    
    res.status(200).json(events)
   } catch (error) {
    console.error('Error during getting events:', error.message);
    res.status(500).json({ message: 'Getting events failed' });
   }
}

module.exports = {createCalendarEvent, getEvents};