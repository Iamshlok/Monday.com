let columnsData = null; // Variable to store the fetched columns

export async function fetchColumns() {
  if (columnsData === null) {
    // Fetch columns only if they haven't been fetched yet
    const query = '{boards(ids: 5488627974) {name workspace {id name} columns {id title type settings_str}}}';

    const response = await fetch("https://api.monday.com/v2", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5MTk3MzkwMCwiYWFpIjoxMSwidWlkIjo1MDc0MDc5NiwiaWFkIjoiMjAyMy0xMC0yNlQxMTozOToxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTg2ODA3NDQsInJnbiI6InVzZTEifQ.YqNGkoV6ioF5pgYl_F9t32cOSUxaX_ETL_iPmpEjBOk' // Replace with your API key
      },
      body: JSON.stringify({
        'query': query
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    const responseData = data.data;
    const boards = responseData.boards;
    if (boards.length > 0) {
      columnsData = boards[0].columns;
    } else {
      columnsData = [];
    }
  }

  return columnsData;
}

export async function fetchBoardAndGroupId() {
    try {
      // Make an API call to fetch the boardId and groupId from Monday.com
      const response = await fetch("https://api.monday.com/v2", {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5MTk3MzkwMCwiYWFpIjoxMSwidWlkIjo1MDc0MDc5NiwiaWFkIjoiMjAyMy0xMC0yNlQxMTozOToxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTg2ODA3NDQsInJnbiI6InVzZTEifQ.YqNGkoV6ioF5pgYl_F9t32cOSUxaX_ETL_iPmpEjBOk', // Replace with your API key
        },
        body: JSON.stringify({
          'query': `
            query {
              boards(ids: 5488627974) {
                id
                groups {
                  id
                  title
                }
              }
            }
          `,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch board and group data');
      }
  
      const data = await response.json();
      const responseData = data.data;
      const boardId = responseData.boards[0].id;
      const groupId = responseData.boards[0].groups[0].id; // You may need to adjust this to get the correct group
  
      return { boardId, groupId };
    } catch (error) {
      throw new Error('Error fetching board and group data: ' + error.message);
    }
  }