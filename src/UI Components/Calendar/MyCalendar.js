import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css'; // Import your existing styles
import Form from '../Form/Form'; // Import the Form component
import { fetchItemData } from '../Form/eventUpdateForm';
import mondaySdk from 'monday-sdk-js';

const localizer = momentLocalizer(moment);

const monday = mondaySdk();
const MyCalendar = ({ events, setSelectedEvent, setShowPopup, showPopup, selectedEvent }) => {
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [editMode, setEditMode] = useState(false); // New state for edit mode

  const handleEventClick = (event, e) => {
    if (event.status && event.status.toLowerCase() === 'approved' && editMode) {
      monday.execute("notice", {
        message: "You cannot edit/update approved time entries",
        type: "error", // or "error" (red), or "info" (blue)
        timeout: 10000,
      });
    } else if (editMode) {
      fetchItemData(event.resource)
        .then((itemData) => {
          setSelectedEvent(itemData);
          setShowPopup(true);
        })
        .catch((error) => {
          console.error('Error fetching item data:', error);
        });
    } else {
      setView('day');
      setSelectedDate(moment(event.start));
    }
  };



  const handleDateClick = (date, view) => {
    if (view === 'month') {
      setView('day');
      setSelectedDate(moment(date));
    }
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    let backgroundColor = '#FFB534'; // Default color

    switch (event.status?.toLowerCase()) {
      case 'in approval':
        backgroundColor = '#F7C04A';
        break;
      case 'approved':
        backgroundColor = '#65B741';
        break;
      case 'rejected':
        backgroundColor = '#FF6464';
        break;
      default:
        backgroundColor = '#FFB534'; // Default color
    }

    return {
      style: {
        backgroundColor,
      },
    };
  };



  const handleDrillDown = (date, view) => {
    if (view === 'day') {
      setView('day');
      setSelectedDate(moment(date));
    }
  };
  return (
    <div className="calendar-container">
      <div className='heading'>
        <h1>Calendar</h1>
        <button onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
        </button>
      </div>
      <div>
        {editMode ? (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="month"
            views={['month', 'week', 'day', 'agenda']}
            selectable={true}
            onView={(newView) => setView(newView)}
            onSelectEvent={handleEventClick}
            onSelectSlot={handleDateClick}
            view={view}
            resourceAccessor="resource"
            date={selectedDate}
            onDrillDown={handleDrillDown}
            onNavigate={(date, view) => {
              setView(view);
              setSelectedDate(date);
            }}
            eventPropGetter={eventStyleGetter}
            style={{ height: 600, width: 750 }}
          />// Render the Form component in edit mode
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="month"
            views={['month', 'week', 'day', 'agenda']}
            selectable={true}
            onView={(newView) => setView(newView)}
            onSelectEvent={handleEventClick}
            onSelectSlot={handleDateClick}
            resourceAccessor="resource"
            view={view}
            date={selectedDate}
            onDrillDown={handleDrillDown}
            onNavigate={(date, view) => {
              setView(view);
              setSelectedDate(date);
            }}
            eventPropGetter={eventStyleGetter}
            style={{ height: 600, width: 750 }}
          />
        )}
      </div>


      <div className="legend">
        <div className="legend-item" style={{ backgroundColor: '#F7C04A', marginRight: '5px' }}></div>
        <span>In Approval </span>
        <div className="legend-item" style={{ backgroundColor: '#65B741', marginLeft: '5px' }}></div>
        <span>Approved </span>
        <div className="legend-item" style={{ backgroundColor: '#FF6464', marginLeft: '5px' }}></div>
        <span>Rejected </span>
      </div>
    </div>
  );
};

export default MyCalendar;