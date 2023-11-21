// api.js
export async function fetchUserName(userId) {
    const response = await fetch(`https://api.monday.com/v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5MTk3MzkwMCwiYWFpIjoxMSwidWlkIjo1MDc0MDc5NiwiaWFkIjoiMjAyMy0xMC0yNlQxMTozOToxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTg2ODA3NDQsInJnbiI6InVzZTEifQ.YqNGkoV6ioF5pgYl_F9t32cOSUxaX_ETL_iPmpEjBOk',
      },
      body: JSON.stringify({
        query: `{
          users(ids: ${userId}) {
            name
          }
        }`,
      }),
    });
  
    if (response.ok) {
      const data = await response.json();
      return data.data.users[0].name;
    } else {
      return '';
    }
  }
  