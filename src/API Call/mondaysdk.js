import mondaySdk from "monday-sdk-js";
import React, { Component } from 'react';

const monday = mondaySdk();
let board;
let columnsData = null;
let curUserID;
let curUserName;
let isViewonly;
// fetch Board ID and Session Token
async function initializeMondaySdk() {
  try {
    const contextResponse = await monday.get("context");

    isViewonly = contextResponse.data.user.isViewOnly;
    board = contextResponse.data.boardId;
    await fetchColumns(board); // Pass board as an argument
    await fetchBoardAndGroupId(board); // Pass board as an argument
  } catch (error) {
    console.error("Error initializing Monday SDK:", error.message);
  }
}

initializeMondaySdk();

// Update fetchColumns to accept board as an argument
//Fetching Columns
export async function fetchColumns() {
  // Fetching Board ID
  if (columnsData === null) {
    try {
      const response = await monday.api(
        `query { boards(ids: ${board}) { name workspace { id name } columns { id title type settings_str } } }`
      );
      if (response.data && response.data.boards.length > 0) {
        const col = response;
        columnsData = col.data.boards[0].columns;
      }
    } catch (error) {
      throw new Error('Failed to fetch data: ' + error.message);
    }
  }

  return columnsData;
}

// Update fetchBoardAndGroupId to accept board as an argument
export async function fetchBoardAndGroupId() {
  try {
    // Make an API call to fetch the boardId and groupId from Monday.com
    const response = await monday.api(
      `query { boards(ids: ${board}) { id groups { id title } } }`
    );

    if (response.data && response.data.boards.length > 0) {
      const bg = response;
      const boardId = bg.data.boards[0].id;
      const groupId = bg.data.boards[0].groups[0].id;
      return { boardId, groupId };
    } else {
      throw new Error('Failed to fetch board and group data');
    }
  } catch (error) {
    throw new Error('Error fetching board and group data: ' + error.message);
  }
}


//Fetching Current User
export async function fetchCurrentUser() {
  try {
    const user = await monday.api(`query {
      me{
        id
        name
      }
    }
    `);
    const res = user.data.me;
    curUserID = res.id;
    curUserName = res.name;
  } catch (error) {
    throw new Error('Failed to fetch current User');
  }
}

export { board, curUserID, curUserName, isViewonly };
export { initializeMondaySdk };