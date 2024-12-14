const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const cors = require('cors');
const { watchGoogleCalendarEvents, handleWebhookNotification } = require('./controllers/eventController');
const { google } = require('googleapis');
const oauth2Client = require('./utils/googleAuth');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);


app.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook Headers:', req.headers);
    console.log('Webhook Body:', req.body);

    await handleWebhookNotification(req.headers, req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(200).send('OK'); 
  }
});


app.get('/webhook', (req, res) => {
  const challenge = req.query['hub.challenge'];
  if (challenge) {
    console.log('Received verification challenge:', challenge);
    return res.send(challenge);
  }
  res.status(400).send('No challenge parameter found');
});


app.post('/setup-webhook', async (req, res) => {
  try {
    const result = await watchGoogleCalendarEvents(req, res);
    console.log('Webhook setup result:', result);
  } catch (error) {
    console.error('Error setting up webhook:', error);
    res.status(500).json({ error: 'Failed to setup webhook' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));