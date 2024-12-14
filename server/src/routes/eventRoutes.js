
const express = require('express');
const  eventController  = require('../controllers/eventController');
const router = express.Router();


// const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', eventController.createCalendarEvent);
router.get('/get-events/:email', eventController.getEvents)


module.exports = router;
