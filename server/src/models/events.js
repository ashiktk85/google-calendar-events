// models/CalendarEvent.js
const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', calendarEventSchema);
