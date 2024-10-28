// routes/authRoutes.js
const express = require('express');
const googleAuth = require('../controllers/authContoller')
const router = express.Router();

router.post('/google', googleAuth);

module.exports = router;
