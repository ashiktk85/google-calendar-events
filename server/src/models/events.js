const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    googleEventId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    },
    time: { 
        type: String,  
        required: true 
    },
    startTime: { 
        type: Date, 
        required: true 
    },
    endTime: { 
        type: Date, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    lastSynced: {
        type: Date,
        default: Date.now
    },
    syncStatus: {
        type: String,
        enum: ['synced', 'pending', 'error'],
        default: 'synced'
    }
}, { 
    timestamps: true,
  
    indexes: [
        { email: 1, startTime: 1 },
        { googleEventId: 1 },
        { email: 1, date: 1, time: 1 }
    ]
});


calendarEventSchema.index({ 
    email: 1, 
    name: 1, 
    date: 1, 
    time: 1 
}, { 
    unique: true 
});

module.exports = mongoose.model('Event', calendarEventSchema);