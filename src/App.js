import React, { useState } from 'react';
import './App.css';
import Form from './Form';
import ApiCall from './getValues';
//import TableCreation from './TableCreation';
import MyCalendar from './MyCalendar'; // Import the MyCalendar component
//import LoginButton from './LoginForm';
import extractCalendarEvents from './CalendarEvents';

const App = () => {
  const [selectedData, setSelectedData] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]); // State for calendar events

  // Function to update the selected data
  const populateForm = (selectedData) => {
    setSelectedData(selectedData);
  };

  return (
    <div className="App">
      <div>
        <Form title="Your Form Title" populateForm={populateForm} />
      </div>
      <div className="calendar-container">
        <MyCalendar events={calendarEvents} /> {/* Use the MyCalendar component */}
      </div>
      <div>
        <ApiCall
          render={(groupedItems, workspace, boardName) => {
            // Extract calendar events and update the state
            const events = extractCalendarEvents(groupedItems);
            setCalendarEvents(events);

            // Render the TableCreation component
            // return (
            //   <TableCreation
            //     groupedItems={groupedItems}
            //     boardName={boardName}
            //     workspace={workspace}
            //     populateForm={populateForm}
            //   />
            // );
          }}
        />
      </div>
    </div>
  );
};

export default App;
