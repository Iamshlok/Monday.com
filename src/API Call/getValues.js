import React, { Component } from 'react';
import { apiKey, mondayboardid } from '../ManageAuthAndBoard/keyandboardid';

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
        'Authorization': apiKey, 
      },
      body: JSON.stringify({
        'query': `{boards(ids:${mondayboardid}) {name workspace {id name} items{id name group{id title} column_values{id title text value type}}}}`,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const boards = data.data.boards;
        const groupedItems = {};
        const workspace = boards[0].workspace;
        const boardName = boards[0].name;

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
