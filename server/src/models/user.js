const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    tokenExpiryDate: {
        type: Date,
    },
   
    webhookChannelId: {
        type: String,
        sparse: true,  
    },
    webhookResourceId: {
        type: String,
    },
    webhookExpiration: {
        type: Date,
    },
    lastSyncTime: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

userSchema.index({ webhookChannelId: 1 });

module.exports = mongoose.model('User', userSchema);