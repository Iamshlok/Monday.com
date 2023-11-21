import moment from 'moment';

const extractCalendarEvents = (groupedItems) => {
  // Extract events from groupedItems and format them for the calendar
  const events = [];

  for (const groupId in groupedItems) {
    const group = groupedItems[groupId];
    group.items.forEach((item) => {
      // Extract relevant data and format for events
      const dateValue = item.column_values.find(col => col.title === 'Date').text;
      const hoursSpentValue = item.column_values.find(col => col.title === 'Hours Spent').text;

      if (dateValue && hoursSpentValue) {
        const event = {
          start: moment(dateValue).toDate(), // Corrected to use dateValue directly
          end: moment(dateValue).add(1, 'hour').toDate(),
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
