async function deleteEventFromDatabase(eventId, email) {
    await Event.deleteOne({ eventId, email });
}

module.exports = deleteEventFromDatabase;