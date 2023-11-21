import React, { Component } from 'react';

class ApiCall extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupedItems: {},
      workspace: '',
      boardName: '',
    };
  }

  componentDidMount() {
    // Perform the API call to fetch data from Monday.com
    fetch("https://api.monday.com/v2", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5MTk3MzkwMCwiYWFpIjoxMSwidWlkIjo1MDc0MDc5NiwiaWFkIjoiMjAyMy0xMC0yNlQxMTozOToxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTg2ODA3NDQsInJnbiI6InVzZTEifQ.YqNGkoV6ioF5pgYl_F9t32cOSUxaX_ETL_iPmpEjBOk', 
      },
      body: JSON.stringify({
        'query': '{boards (ids:5488627974) {name workspace {id name} items{id name group{id title} column_values{id title text value type}}}}', 
      })
    })
      .then((res) => res.json())
      .then((data) => {
        const boards = data.data.boards;
        const groupedItems = {};
        const workspace = boards[0].workspace;
        const boardName = boards[0].name;
        console.log(workspace);
        console.log(boardName);

        const workspaceName = workspace.name;

        boards.forEach((board) => {
          board.items.forEach((item) => {
            const groupId = item.group.id;
            if (!groupedItems[groupId]) {
              groupedItems[groupId] = {
                title: item.group.title,
                items: [],
              };
            }
            groupedItems[groupId].items.push(item);
          });
        });

        this.setState({ groupedItems, workspace: workspaceName, boardName });
        console.log(groupedItems);
      })
      .catch((error) => {
        console.error('Error fetching data from Monday.com:', error);
      });
  }

  render() {
    return this.props.render(this.state.groupedItems, this.state.workspace, this.state.boardName);
  }
}

export default ApiCall;
