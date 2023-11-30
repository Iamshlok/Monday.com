import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

const localizer = momentLocalizer(moment);

const MyCalendar = ({ events }) => {

  return (
    <div className="calendar">
      <div><h1>Calendar</h1></div>
      <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={['month', 'week', 'day', 'agenda']}
        selectable={true}
        style={{ height: 500, width: 800}}
      />
      </div>
    </div>
  );
};

export default MyCalendar;
