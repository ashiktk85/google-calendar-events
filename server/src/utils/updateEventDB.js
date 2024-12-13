async function updateEventInDatabase(event) {
    await Event.updateOne(
        { email: event.organizer.email, eventId: event.id },
        { $set: { name: event.summary, date: event.start.dateTime, time: event.start.dateTime.split('T')[1] } }
    );
}

module.exports =updateEventInDatabase;