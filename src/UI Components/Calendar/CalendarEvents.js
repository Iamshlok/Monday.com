import moment from 'moment';
import { curUserID } from '../../API Call/mondaysdk';

const extractCalendarEvents = (groupedItems) => {
  const events = [];


  for (const groupId in groupedItems) {
    if (groupedItems.hasOwnProperty(groupId)) {
      const group = groupedItems[groupId];

      if (group.items && Array.isArray(group.items)) {
        group.items.forEach((item) => {
          // Find the 'person' column
          const assignedToColumn = item.column_values.find((col) => col.id === 'person');

          // Extract the 'id' from the 'personsAndTeams' field
          const assignedTo = assignedToColumn?.value;
          let personId;

          try {
            const assignedToObj = assignedTo ? JSON.parse(assignedTo) : null;
            personId = assignedToObj?.personsAndTeams?.[0]?.id;
          } catch (error) {
            console.error(`Error parsing JSON in 'person' column: ${error}`);
            // Handle the error, e.g., set personId to a default value or skip this item
          }

          if (personId === curUserID) {
            const itemId = item.id;
            const dateValue = item.column_values.find((col) => col.title === 'Start Date')?.text;
            const endDateValue = item.column_values.find((col) => col.title === 'End Date')?.text;
            const hoursSpentValue = item.column_values.find((col) => col.title === 'Hours Spent')?.text;
            const startTime = item.column_values.find((col) => col.title === 'Start Time')?.text;
            const endTime = item.column_values.find((col) => col.title === 'End Time')?.text;
            const isAllDay = item.column_values.find((col) => col.id === 'check')?.text.toLowerCase() === 'v';
            const status = item.column_values.find((col) => col.title === 'Status')?.text;
            const title = item.name;

            if (dateValue && hoursSpentValue) {
              let eventStart, eventEnd;

              if (isAllDay) {
                eventStart = moment(dateValue).startOf('day').toDate();
                eventEnd = moment(endDateValue).endOf('day').toDate();
              } else {
                eventStart = moment(`${dateValue} ${startTime}`, 'YYYY-MM-DD hh:mm A').toDate();
                eventEnd = moment(`${endDateValue} ${endTime}`, 'YYYY-MM-DD hh:mm A').toDate();
              }
              
              const event = {
                start: eventStart,
                end: eventEnd,
                title: `${hoursSpentValue} hours, ${title}`,
                allDay: isAllDay,
                status, // Include status in the event object
                resource: itemId,
              };

              events.push(event);
            }
          }
        });
      } else {
        console.error(`Items in group ${groupId} are not defined or not an array`);
      }
    }
  }

  return events;
};

export default extractCalendarEvents;