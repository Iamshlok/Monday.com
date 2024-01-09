//getValues.js
import React, { useEffect, useState } from 'react';
import mondaySdk from "monday-sdk-js";
import { board, initializeMondaySdk } from './mondaysdk.js';

const monday = mondaySdk();

const ApiCall = ({ render }) => {
  const [groupedItems, setGroupedItems] = useState([]);
  const [workspace, setWorkspace] = useState('');
  const [boardName, setBoardName] = useState('');

  useEffect(() => {
    // Fetch data from the Monday.com board
    async function fetchData() {
      try {
        await initializeMondaySdk();
        const response = await monday.api(
          `query {
            boards(ids: ${board}) {
              name 
              workspace {
                id 
                name
              } 
              items{
                id 
                name 
                group{
                  id 
                  title
                } 
                column_values{
                  id 
                  title 
                  text 
                  value 
                  type
                }
              }
            }
          }`
        );

        const boardData = response.data.boards[0]; // Access the first board in the response

        const workspaceName = boardData.workspace.name;
        const boardName = boardData.name;

        // Process the data to create groupedItems
        const groupedItems = processGroupedItems(boardData.items);

        setGroupedItems(groupedItems);
        setWorkspace(workspaceName);
        setBoardName(boardName);
      } catch (error) {
        console.error('Error fetching data from Monday.com:', error);
      }
    }

    fetchData();
  }, []); // Empty dependency array to run the effect only once

  // Render the child components
  return render(groupedItems);
};

// Function to process data and create groupedItems
const processGroupedItems = (items) => {
  const groupedItems = {};

  items.forEach((item) => {
    const groupId = item.group.id;
    if (!groupedItems[groupId]) {
      groupedItems[groupId] = {
        title: item.group.title,
        items: [],
      };
    }
    groupedItems[groupId].items.push(item);
  });

  return groupedItems;
};

export default ApiCall;