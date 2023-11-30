// App.js

import React, { useState } from 'react';
import './App.css';
import Form from './UI Components/Form/Form.js';
import ApiCall from './API Call/getValues';
import MyCalendar from './UI Components/Calendar/MyCalendar';
import extractCalendarEvents from './UI Components/Calendar/CalendarEvents';

const App = () => {
  const [selectedData, setSelectedData] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);

  const populateForm = (selectedData) => {
    setSelectedData(selectedData);
  };

  return (
    <div className="App">
      <div className="FormContainer">
        <Form title="Your Form Title" populateForm={populateForm} />
      </div>
      <div className="CalendarContainer">
        <MyCalendar events={calendarEvents} />
      </div>
      <div>
        <ApiCall
          render={(groupedItems, workspace, boardName) => {
            const events = extractCalendarEvents(groupedItems);
            setCalendarEvents(events);
          }}
        />
      </div>
    </div>
  );
};

export default App;
