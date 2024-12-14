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
console.log(userInfo);

        const { id, name, email,picture } = userInfo.data;
        // console.log(id, name, email,picture, "kdjd");
        
        const { access_token, refresh_token, expiry_date } = tokens;

        
        let user = await User.findOne({ googleId: id });

        if (user) {
            
            user.accessToken = access_token;
            user.refreshToken = refresh_token || user.refreshToken;
            user.tokenExpiryDate = expiry_date;

            await user.save(); 
            const userData = {
                googleId: id,
                name,
                email ,
                picture : picture,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiryDate: expiry_date,
            }
            // console.log('User updated successfully:', userData);
            return res.status(200).json(userData); 
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
            const userData = {
                googleId: id,
                name,
                email ,
                picture : picture,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiryDate: expiry_date,
            }
            // console.log('User created successfully:', userData);
            return res.status(201).json(userData); 
        }

    } catch (error) {
        console.error('Error during Google Authentication:', error.message);
        res.status(500).json({ message: 'Google Authentication failed' });
    }
};

module.exports = googleAuth;
