// App.js
import React, { useState } from 'react';
import './App.css';
import Form from './UI Components/Form/Form.js';
import ApiCall from './API Call/getValues.js';
import MyCalendar from './UI Components/Calendar/MyCalendar';
import extractCalendarEvents from './UI Components/Calendar/CalendarEvents';
import { board, isViewonly } from './API Call/mondaysdk.js';
import PopupForm from './UI Components/Calendar/PopupForm.js';

const App = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegularForm, setShowRegularForm] = useState(true);

  if (isViewonly) {
    return (
      <div className="App">
        <div>
          <h2>You are a View only user, you don't have access to the current board view.</h2>
        </div>
      </div>
    );
  }

  const handlePopupClose = () => {
    setShowPopup(false);
    setShowRegularForm(true);
  };

  return (
    <div className="App">
      <div className="FormContainer">
        {showPopup ? (
          <PopupForm
            className="popup-form"
            isOpen={showPopup}
            onClose={handlePopupClose}
            eventData={selectedEvent}
          />
        ) : (
          showRegularForm && <Form setShowRegularForm={setShowRegularForm} />
        )}
      </div>

      <div className="CalendarContainer">
        <MyCalendar
          events={calendarEvents}
          showPopup={showPopup}
          setSelectedEvent={setSelectedEvent}
          setShowPopup={setShowPopup}
          selectedEvent={selectedEvent}
        />
      </div>

      <div>
        <ApiCall
          board={board}
          render={(groupedItems) => {
            const events = extractCalendarEvents(groupedItems);
            setCalendarEvents(events);
          }}
        />
      </div>
    </div>
  );
};

export default App;