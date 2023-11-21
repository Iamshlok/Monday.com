export async function createItem(boardId, groupId, itemData) {
  // Construct the mutation query dynamically
  const columnValues = Object.keys(itemData);
  const col = Object(itemData);
    if(columnValues.type === "board-relation"){
    columnValues.map((columnId) => `\\\"${columnId}\\\":{\\\"linkedPulseId\\\":\\\"${itemData[columnId]}\\\"}`)
  }else{
    columnValues.map((columnId) => `\\\"${columnId}\\\": \\\"${itemData[columnId]}\\\"`)
    .join(', ');
  }

    

    

  const query = `mutation {
    create_item (
      board_id: ${boardId},
      group_id: "${groupId}",
      item_name: "${itemData.name}",
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
