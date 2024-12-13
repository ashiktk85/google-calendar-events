function verifyGoogleNotification(headers, body) {
    const channelId = headers['x-goog-channel-id'];
    const channelToken = headers['x-goog-channel-token'];
    const expectedToken = process.env.GOOGLE_CHANNEL_SECRET; 

    const signature = headers['x-goog-channel-signature'];

   
    return crypto.createHmac('sha256', expectedToken).update(body).digest('hex') === signature;
}

module.exports =  verifyGoogleNotification;
