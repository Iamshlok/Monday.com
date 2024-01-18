import React, { Component } from 'react';
import './Form.css';
import { fetchColumns, fetchBoardAndGroupId, fetchCurrentUser } from '../../API Call/mondaysdk';
import { createItem } from '../../API Call/mutation';
import PopupMessage from '../../Features/PopupMessage';
import { initializeMondaySdk, curUserID, curUserName } from '../../API Call/mondaysdk';
import mondaySdk from 'monday-sdk-js';
import Select from 'react-select';

const monday = mondaySdk();
class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      boardId: null,
      groupId: null,
      successMessage: '',
      errorMessage: '',
      showPopup: false,
      popupMessage: '',
      popupType: 'success',
      totalHours: '',
      edit: false, // Set edit to true or false based on your requirement
      nameFieldId: '', // Add nameFieldId to the initial state
      subitemsField: [],
      boardRelationSelections: {},
      text6: null,
      text66: null,
      ...props,
    };

    // Initialize board-relation columns
    const boardRelationColumns = this.state.columns.filter((column) => column.type === 'board-relation');
    for (const boardRelationColumn of boardRelationColumns) {
      this.state[boardRelationColumn.id] = {
        selectedItemId: '', // Initialize selectedItemId
        selectedItem: null, // Initialize selectedItem
        items: [],
      };
    }
  }

  ///////////////////////////////////////////App Handlers///////////////////////////////////////

  handlePopupClose = () => {
    this.setState({
      showPopup: false,
      popupMessage: '',
    });
  };

  handleBoardRelationChange = async (e, column) => {
    const selectedItemId = e.target.value;
    const selectedBoardItems = this.state[column.id].items;
    const selectedItem = selectedBoardItems.find((item) => item.id === selectedItemId);

    // Log the selectedItem to verify its structure

    // Populate Manager and Subitems fields based on the selected board-relation option
    const managerValue = selectedItem ? selectedItem.manager : '';
    const subitems = selectedItem ? selectedItem.subitems : [];


    this.setState((prevState) => ({
      ...prevState,
      [column.id]: {
        selectedItemId,
        selectedItem,
        items: prevState[column.id].items,
      },
      // Use a separate update for Manager and Subitems fields
      managerFieldId: managerValue,
      // Reset the name field when a new project is selected
      subitemsField: subitems,
      // Update state for the "Selected Project" column (text6)
    }));
  };


  handleCheckboxChange = (e, column) => {
    const { checked } = e.target;
    this.setState({
      [column.id]: checked,
    });
  };

  handleInputChange = (selectedOption, column) => {
    // Assuming that the selectedOption contains the ID as value
    const selectedId = selectedOption ? selectedOption.value : null;
    const selectedOptionName = selectedOption ? selectedOption.label : null;
    // Update state for the "Name" column
    this.setState((prevState) => ({
      ...prevState,
      [column.id]: selectedOptionName,
    }));
  
    // Update state for the "Selected Task" column (text66)
  }
  

  handleTextInputChange = (e, column) => {
    const { value } = e.target;
  
    this.setState((prevState) => ({
      ...prevState,
      [column.id]: value,
    }));
  }


  resetFormState() {
    const { columns } = this.state;
    const initialValues = {};

    // Only reset non-board-relation columns
    columns.forEach((column) => {
      if (column.type !== 'board-relation') {
        initialValues[column.id] = null;
      }
    });

    this.setState({ successMessage: '', errorMessage: '', ...initialValues });
  }

  handleHourChange = (e, column) => {
    const { value } = e.target;

    if (column.title === 'Hours Spent') {
      this.setState({
        totalHours: value,
      });
    } else {
      this.setState((prevState) => ({
        ...prevState,
        [column.id]: value,
      }));
    }
  };



  async componentDidMount() {
    try {
      if (!this.state.columns.length) { // Check if columns are already fetched
        await initializeMondaySdk(); // Call initializeMondaySdk here
        const uservalue = await fetchCurrentUser();
        const columns = await fetchColumns();
        const { boardId, groupId } = await fetchBoardAndGroupId();
        const initialValues = {};
        const boardRelationColumns = columns.filter((column) => column.type === 'board-relation');

        // Fetch and populate data for board-relation columns
        for (const boardRelationColumn of boardRelationColumns) {
          const { boardIds } = JSON.parse(boardRelationColumn.settings_str);
          const boardItems = await this.fetchBoardItems(boardIds[0]);

          initialValues[boardRelationColumn.id] = {
            selectedItemId: '', // Initialize selectedItemId
            selectedItem: null, // Initialize selectedItem
            items: boardItems,
          };
        }

        // Initialize other columns
        columns.forEach((column) => {
          if (column.type !== 'board-relation') {
            initialValues[column.id] = null;
          }

          if (column.type === 'date') {
            initialValues[column.id] = new Date().toISOString().split('T')[0];
          }
        });



        this.setState({ columns, boardId, groupId, ...initialValues });
      }
    } catch (error) {
      console.error('Error Fetching data in Form.js:', error);
    }
  }



  /////////////////////////////////////Fetching Projects/////////////////////////////////////
  async fetchBoardItems(boardId) {
    try {

      const response1 = await monday.api(`
      query {
        boards(ids: ${boardId}) {
          items {
            id
            name
            group {
              id
              title
            }
            column_values {
              id
              title
              text
            }
            subitems {
              id
              name
            }
          }
        }
      }
    `);

      const data = response1;
      if (data.data && data.data.boards && data.data.boards.length > 0) {
        return data.data.boards[0].items.map(item => {
          const managerColumn = item.column_values.find(column => column.title === 'Manager');
          return {
            id: item.id,
            name: item.name,
            group: item.group,
            manager: managerColumn ? managerColumn.text : '',
            subitems: item.subitems || [],
          };
        }).filter(item => item.group.title === 'On Going Projects');
      }

      return [];
    } catch (error) {
      console.error('Error fetching board items:', error);
      return [];
    }
  }


  ////////////////////////////////////////////////////Submit Handler////////////////////////////////////////////////////
  handleSubmit = async (e) => {
    e.preventDefault();
    const { boardId, groupId, columns, ...values } = this.state;
    // Exclude "Manager" column from the submission
    const columnValues = columns
      .filter(column => column.title !== "Manager")
      .map(column => ({
        id: column.id,
        value: values[column.id],
        type: column.type,
      }));

    try {
      const newItem = await createItem(boardId, groupId, columnValues);

      if (newItem) {
        this.setState({
          showPopup: true,
          popupMessage: 'Item created successfully',
          popupType: 'success',
        });
        this.resetFormState();
        setTimeout(() => {
          this.setState({ successMessage: '' });
        }, 3000);
        monday.execute("notice", {
          message: "Time entry created successfully.",
          type: "success", // or "error" (red), or "info" (blue)
          timeout: 10000,
        });
      } else {
        this.setState({
          showPopup: true,
          popupMessage: 'Error creating item',
          popupType: 'error',
        });
      }
    } catch (error) {
      console.error('Error creating item:', error);
      this.setState({
        showPopup: true,
        popupMessage: 'Error creating item',
        popupType: 'error',
      });
      monday.execute("notice", {
        message: "Error creating time entry!!",
        type: "error", // or "error" (red), or "info" (blue)
        timeout: 10000,
      });
    }
  };


  /////////////////////////////////////////App Render/////////////////////////////////////////////
  render() {
    const { columns, successMessage, errorMessage, showPopup, popupMessage, popupType } = this.state;

    // Filter out columns 
    const filteredColumns = columns.filter(column => column.title !== "Subitems" && column.title !== "Person" && column.title !== "Status" && column.id !== "text6" && column.id !== "text66" && column.title !== "Selected Project" && column.title !=="Selected Task");
    const headerFilter = columns.filter(column => column.title === "Person" || column.title === "Status")
    // Specify the desired column order
    const desiredColumnOrder = ["Project", "Manager", "Name", "Start Date", "End Date", "Hours Spent", "All Day Task", "Start Time", "End Time"];

    // Create a map to efficiently look up column indices by title
    const columnIndexMap = {};
    columns.forEach((column, index) => {
      columnIndexMap[column.title] = index;
    });

    // Sort filtered columns based on the desired order
    const sortedColumns = [...filteredColumns].sort((a, b) => {
      const indexA = columnIndexMap[a.title];
      const indexB = columnIndexMap[b.title];
      return desiredColumnOrder.indexOf(a.title) - desiredColumnOrder.indexOf(b.title);
    });

    // Inside the render method
    return (

      <div className="form-container">
        <h2>Time Entry Form (User view)</h2>
        <h4>
          {headerFilter.map((column, index) => (
            <span key={column.id}>
              {column.title === 'Person'
                ? `Person: ${curUserName}`
                : `${column.title}: ${column.type === 'color' ? 'In Approval' : this.state[column.id] || 'N/A'}`}
              {index < headerFilter.length - 1 && ' | '} {/* Add a space if it's not the last column */}
            </span>
          ))}
        </h4>

        <form onSubmit={this.handleSubmit}>
          <div className="form-row">
            {sortedColumns.map((column, index) => (
              <div key={column.id} className="form-input">
                <label>{column.type === 'name' ? 'Task' : column.title}</label>
                {column.type === "name" ? (
                  <Select
                  name={column.id}
                  value={this.state[column.id] ? { value: this.state[column.id], label: this.state[column.id] } : null}
                  onChange={(selectedOption) => this.handleInputChange(selectedOption, column)}
                  options={[
                    { value: '', label: 'Select a name' }, // Default option
                    ...this.state.subitemsField.map((subitem) => ({ value: subitem.id, label: subitem.name }))
                  ]}
                  placeholder="Select a name"
                  isSearchable={false}
                />
                
                ) : column.title === "Manager" ? (
                  <input
                    type={column.type === 'text'}
                    name={column.id}  // Make sure the name attribute matches the column.id
                    value={this.state.managerFieldId || ''}  // Use managerFieldId instead of managerFieldName
                    readOnly
                  />
                ) : column.type === 'board-relation' ? (
                  <Select
                    name={column.title}
                    value={this.state[column.id] ? { value: this.state[column.id].selectedItemId, label: this.state[column.id].selectedItem ? this.state[column.id].selectedItem.name : '' } : null}
                    onChange={(selectedOption) => this.handleBoardRelationChange({ target: { value: selectedOption.value } }, column)}
                    options={[
                      { value: '', label: 'Select an option' }, // Default option
                      ...(this.state[column.id] ? this.state[column.id].items.map((item) => ({ value: item.id, label: item.name })) : [])
                    ]}
                    placeholder="Select an option"
                    isSearchable={false}
                  />
                ) : column.type === 'hour' ? (
                  <div>
                    <input
                      type="time"
                      name={column.title}
                      value={this.state[column.id] || ''}  // Set the checked attribute based on the state
                      onChange={(e) => this.handleHourChange(e, column)}
                    />
                  </div>
                ) : column.type === 'boolean' ? (
                  <div>
                    <input
                      type="checkbox"
                      id="yourCheckboxId"
                      name={column.title}
                      checked={this.state[column.id] || false}  // Set the checked attribute based on the state
                      onChange={(e) => this.handleCheckboxChange(e, column)}
                    />
                  </div>
                ) : column.title === 'Hours Spent' ? (
                  <div>
                    <input
                      type={column.type === 'hour' ? 'text' : column.type}
                      name={column.title}
                      value={this.state[column.id] || ''}
                      onChange={(e) => this.handleTextInputChange(e, column)}
                    />

                  </div>
                ) : (
                  <input
                    type={column.type === 'color' ? 'text' : column.type}
                    name={column.title}
                    value={this.state[column.id] || ''}
                    onChange={(e) => this.handleTextInputChange(e, column)}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="form-submit">
            <button type="submit">Submit</button>
          </div>
        </form>
        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {showPopup && (
          <PopupMessage message={popupMessage} type={popupType} onClose={this.handlePopupClose} />
        )}
      </div>
    );
  }
}

export default Form;