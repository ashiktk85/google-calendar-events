const axios = require('axios');
const User = require('../models/user');
const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5173'
);

const googleAuth = async (req, res) => {
    try {
        const { code } = req.body;
        console.log(req.body, "auth code");

        
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        
        const userInfo = await google.oauth2('v2').userinfo.get({
            auth: oauth2Client,
        });

        const { id, name, email } = userInfo.data;
        const { access_token, refresh_token, expiry_date } = tokens;

        
        let user = await User.findOne({ googleId: id });

        if (user) {
            
            user.accessToken = access_token;
            user.refreshToken = refresh_token || user.refreshToken;
            user.tokenExpiryDate = expiry_date;

            await user.save(); 
            console.log('User updated successfully:', user);
            return res.status(200).json(user); 
        } else {
            
            user = new User({
                googleId: id,
                name,
                email,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiryDate: expiry_date,
            });

            await user.save(); 
            console.log('User created successfully:', user);
            return res.status(201).json(user); 
        }

    } catch (error) {
        console.error('Error during Google Authentication:', error.message);
        res.status(500).json({ message: 'Google Authentication failed' });
    }
};

module.exports = googleAuth;
