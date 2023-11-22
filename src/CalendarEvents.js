import moment from 'moment';

const extractCalendarEvents = (groupedItems) => {
  // Extract events from groupedItems and format them for the calendar
  const events = [];

  for (const groupId in groupedItems) {
    const group = groupedItems[groupId];
    group.items.forEach((item) => {
      // Extract relevant data and format for events
      const dateValue = item.column_values.find((col) => col.title === 'Date').text;
      const hoursSpentValue = item.column_values.find((col) => col.title === 'Hours Spent').text;
      const startTime = item.column_values.find((col) => col.title === 'Start Time').text;
      const endTime = item.column_values.find((col) => col.title === 'End Time').text;

      if (dateValue && hoursSpentValue && startTime && endTime) {
        const event = {
          start: moment(`${dateValue} ${startTime}`, 'YYYY-MM-DD hh:mm A').toDate(),
          end: moment(`${dateValue} ${endTime}`, 'YYYY-MM-DD hh:mm A').toDate(),
          title: `${hoursSpentValue} hours`, // Display only the hours spent
          // ... other event properties
        };
        events.push(event);
      }
    });
  }

  return events;
};

export default extractCalendarEvents;
