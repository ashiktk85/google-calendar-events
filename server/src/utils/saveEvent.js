async function saveNewEvent(event) {
    const newEvent = new Event({
        email: event.organizer.email,
        name: event.summary,
        date: event.start.dateTime,
        time: event.start.dateTime.split('T')[1], 
    });
    await newEvent.save();
}

module.exports = saveNewEvent;