import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const MyCalendar = ({ events }) => {
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({});

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({
      start,
      end,
      title: '',
      isAllDay: false,
      color: '#3182CE', // Set your desired color
    });
    setShowEventForm(true);
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleEventFormSubmit = () => {
    // Add the new event to your events array or send it to your backend
    // You can also add validation logic before adding the event
    // For simplicity, I'm assuming the form is valid
    events.push(newEvent);
    setShowEventForm(false);
  };

  const handleEventFormClose = () => {
    setShowEventForm(false);
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={['month', 'week', 'day', 'agenda']}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        style={{ height: 500 }}
      />
      {showEventForm && (
        <div>
          <div>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={newEvent.title}
              onChange={handleEventFormChange}
            />
          </div>
          <div>
            <label>Start Time:</label>
            <input
              type="datetime-local"
              name="start"
              value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
              onChange={handleEventFormChange}
            />
          </div>
          <div>
            <label>End Time:</label>
            <input
              type="datetime-local"
              name="end"
              value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
              onChange={handleEventFormChange}
            />
          </div>
          <button onClick={handleEventFormSubmit}>Add Event</button>
          <button onClick={handleEventFormClose}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
