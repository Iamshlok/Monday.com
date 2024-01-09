import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk();

export async function createItem(boardId, groupId, columnData) {
  // Filter out columns with null values
  const filteredColumnData = columnData.filter(({ value }) => value !== null && value !== '' && value.selectedItemId !== '' && value.selectedItemId !== false);

  // Construct the mutation query dynamically
  const itemName = filteredColumnData.find(column => column.id === 'name').value;

  const columnValues = filteredColumnData
    .map(({ id, value, type }) => {
      if (type === 'board-relation' && typeof value === 'object' && value !== null) {
        return `\\\"${id}\\\":{\\\"linkedPulseIds\\\":[{\\\"linkedPulseId\\\":${value.selectedItemId}}]}`;
      } else if (type === 'hour') {
        const [hourStr, minuteStr] = value.split(':');
        const formattedHour = parseInt(hourStr, 10);
        const formattedMinute = parseInt(minuteStr, 10);

        if (!isNaN(formattedHour) && !isNaN(formattedMinute)) {
          return `\\\"${id}\\\":{\\\"hour\\\":${formattedHour},\\\"minute\\\":${formattedMinute}}`;
        } else {
          // Handle the case where the conversion fails
          console.error(`Invalid hour type value: ${value}`);
          return '';
        }
      } else if (type === 'boolean') {
        const booleanValue = value ? 'true' : 'false';
      return `\\\"${id}\\\":{\\\"checked\\\":\\\"${booleanValue}\\\"}`;
      } else {
        return `\\\"${id}\\\": \\\"${value}\\\"`;
      }
    })
    .join(', ');

  const mutationQuery = `mutation {
      create_item (
        board_id: ${boardId},
        group_id: "${groupId}",
        item_name: "${itemName.replace(/"/g, '\\"')}",
        column_values: "{${columnValues}}"
      ) {
        id
      }
    }`;

  // Make the API request with the dynamic query
  try {
    const response = await monday.api(mutationQuery);

    return response.data;
  } catch (error) {
    console.error('Failed to create item:', error);
    throw new Error('Failed to create item');
  }
}
