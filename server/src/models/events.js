// models/CalendarEvent.js
const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  googleEventId: { type: String, required: true, unique: true },
  name: { type: String, required: true }, 
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  email: { type: String, required: true },
}, { timestamps: true });


module.exports = mongoose.model('Event', calendarEventSchema);
