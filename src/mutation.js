export async function createItem(boardId, groupId, columnData) {
  // Filter out columns with null values
  const filteredColumnData = columnData.filter(({ value }) => value !== null && value !== '');

  // Construct the mutation query dynamically
  const itemName = filteredColumnData.find(column => column.id === 'name').value;

  const columnValues = filteredColumnData
    .map(({ id, value, type }) => {
      if (type === 'board-relation' && typeof value === 'object' && value !== null) {
        return `\\\"${id}\\\":{\\\"linkedPulseId\\\":\\\"${value.selectedItemId}\\\"}`;
      } else {
        return `\\\"${id}\\\": \\\"${value}\\\"`;
      }
    })
    .join(', ');

  const query = `mutation {
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
  const response = await fetch("https://api.monday.com/v2", {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5MTk3MzkwMCwiYWFpIjoxMSwidWlkIjo1MDc0MDc5NiwiaWFkIjoiMjAyMy0xMC0yNlQxMTozOToxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTg2ODA3NDQsInJnbiI6InVzZTEifQ.YqNGkoV6ioF5pgYl_F9t32cOSUxaX_ETL_iPmpEjBOk', // Replace with your API key
    },
    body: JSON.stringify({
      'query': query,
    }),
  });

  if (!response.ok) {
    const responseData = await response.json();
    console.log(responseData);
    throw new Error('Failed to create item');
  }

  const data = await response.json();
  return data.data;
}
