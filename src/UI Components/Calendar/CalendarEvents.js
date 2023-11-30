import moment from 'moment';

const extractCalendarEvents = (groupedItems) => {
  const events = [];

  for (const groupId in groupedItems) {
    const group = groupedItems[groupId];
    group.items.forEach((item) => {
      const dateValue = item.column_values.find((col) => col.title === 'Date').text;
      const hoursSpentValue = item.column_values.find((col) => col.title === 'Hours Spent').text;
      const startTime = item.column_values.find((col) => col.title === 'Start Time').text;
      const endTime = item.column_values.find((col) => col.title === 'End Time').text;
      // const status = item.column_values.find((col) => col.title === 'Status').text.toLowerCase();
      const isAllDay = item.column_values.find((col) => col.title === 'IsAllDay').text.toLowerCase() === 'v';

      if (dateValue && hoursSpentValue) {
        let eventStart, eventEnd;

        if (isAllDay) {
          // Set start and end times for the entire day
          eventStart = moment(dateValue).startOf('day').toDate();
          eventEnd = moment(dateValue).endOf('day').toDate();
        } else {
          // Set start and end times using provided values
          eventStart = moment(`${dateValue} ${startTime}`, 'YYYY-MM-DD hh:mm A').toDate();
          eventEnd = moment(`${dateValue} ${endTime}`, 'YYYY-MM-DD hh:mm A').toDate();
        }

        const event = {
          start: eventStart,
          end: eventEnd,
          title: `${hoursSpentValue} hours`,
          allDay: isAllDay,
          // ... other event properties
        };

        events.push(event);
      }
    });
  }

  return events;
};

export default extractCalendarEvents;
