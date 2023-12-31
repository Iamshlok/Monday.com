import React, { Component } from 'react';
import './Form.css';
import { fetchColumns, fetchBoardAndGroupId } from '../../API Call/getids';
import { createItem } from '../../API Call/mutation';
import PopupMessage from '../../Features/PopupMessage';

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
      edit: false, // Set edit to true or false based on your requirement
      ...props,
    };
  }

  ///////////////////////////////////////////App Handlers///////////////////////////////////////

  handlePopupClose = () => {
    this.setState({
      showPopup: false,
      popupMessage: '',
    });
  };

  handleBoardRelationChange = (e, column) => {
    const selectedItemId = e.target.value;
    const selectedBoardItems = this.state[column.id].items;
    const selectedItem = selectedBoardItems.find(item => item.id === selectedItemId);
  
    // Log the selectedItem to verify its structure
    
  
    // Populate Manager field based on the selected board-relation option
    const managerValue = selectedItem ? selectedItem.manager : ''; // Update to 'text' from 'person'
    console.log('Selected Item:', managerValue);
    this.setState((prevState) => ({
      ...prevState,
      [column.id]: {
        selectedItemId,
        selectedItem,
        items: prevState[column.id].items,
      },
      // Use a separate update for Manager field
      managerFieldId: managerValue,
    }));
  };
  

  handleCheckboxChange = (e, column) => {
    const { checked } = e.target;
    this.setState({
      [column.id]: checked,
    });
  };

  handleInputChange = (e, column) => {
    const { value } = e.target;
    this.setState((prevState) => ({
      ...prevState,
      [column.id]: value,
    }));
  }

  resetFormState() {
    const { columns } = this.state;
    const initialValues = {};
    columns.forEach((column) => {
      initialValues[column.id] = null;
    });

    this.setState({ successMessage: '', errorMessage: '', ...initialValues });
  }
  
  handleHourChange = (e, column) => {
    const { value } = e.target;
    this.setState((prevState) => ({
      ...prevState,
      [column.id]: value,
    }));
  }

  async componentDidMount() {
    try {
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
      });

      this.setState({ columns, boardId, groupId, ...initialValues });
    } catch (error) {
      console.error('Error Fetching data.', error);
    }
  }

  /////////////////////////////////////Fetching Projects/////////////////////////////////////
  async fetchBoardItems(boardId) {
    try {
      const response = await fetch(`https://api.monday.com/v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI5MTk3MzkwMCwiYWFpIjoxMSwidWlkIjo1MDc0MDc5NiwiaWFkIjoiMjAyMy0xMC0yNlQxMTozOToxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTg2ODA3NDQsInJnbiI6InVzZTEifQ.YqNGkoV6ioF5pgYl_F9t32cOSUxaX_ETL_iPmpEjBOk', // Replace with your Monday.com API key
        },
        body: JSON.stringify({
          query: `
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
                }
              }
            }
          `,
        }),
      });

      const data = await response.json();
      console.log(data);
      if (data.data && data.data.boards && data.data.boards.length > 0) {
        return data.data.boards[0].items.map(item => {
          const managerColumn = item.column_values.find(column => column.title === 'Manager');
          return {
            id: item.id,
            name: item.name,
            group: item.group,
            manager: managerColumn ? managerColumn.text : '',
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
    
    // Define the list of mandatory fields
    const mandatoryFields = ["Name", "Date", "Hours Spent", "Project"];
  
    const { boardId, groupId, columns, ...values } = this.state;
  
    // Check if all mandatory fields are filled
    const missingFields = mandatoryFields.filter(field => !values[field]);
  
    if (missingFields.length > 0) {
      // Display error message if any mandatory field is missing
      this.setState({
        errorMessage: `Please fill in the following mandatory fields: ${missingFields.join(", ")}`,
        successMessage: '',
        showPopup: true,
        popupMessage: `Please fill in the following mandatory fields: ${missingFields.join(", ")}`,
        popupType: 'error',
      });
      return;
    }
  
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
          successMessage: 'Item created successfully',
          errorMessage: '',
          showPopup: true,
          popupMessage: 'Item created successfully',
          popupType: 'success',
        });
        this.resetFormState();
        setTimeout(() => {
          this.setState({ successMessage: '' });
        }, 3000);
      } else {
        this.setState({
          errorMessage: 'Error creating item',
          successMessage: '',
          showPopup: true,
          popupMessage: 'Error creating item',
          popupType: 'error',
        });
      }
    } catch (error) {
      console.error('Error creating item:', error);
      this.setState({
        errorMessage: 'Error creating item',
        successMessage: '',
        showPopup: true,
        popupMessage: 'Error creating item',
        popupType: 'error',
      });
    }
  };
  

  /////////////////////////////////////////App Render/////////////////////////////////////////////
  render() {
    const { columns, successMessage, errorMessage, showPopup, popupMessage, popupType, edit } = this.state;

    // Filter out columns 
    const filteredColumns = columns.filter(column => column.title !== "Subitems" && column.title !== "Person");
    // Inside the render method
    return (
      <div className="form-container">
        <h1>Time Entry Form</h1>
        <form onSubmit={this.handleSubmit}>
          <div className="form-row">
            {filteredColumns.map((column, index) => (
              <div key={column.id} className="form-input">
                <label>{column.title}</label>
                {column.title === "Manager" ? (
                  <input
                  type={column.type === 'text'}
                  name={column.id}  // Make sure the name attribute matches the column.id
                  value={this.state.managerFieldId || ''}  // Use managerFieldId instead of managerFieldName
                  readOnly
                />
                ) : column.type === 'board-relation' ? (
                  <select
                    name={column.title}
                    value={this.state[column.id] ? this.state[column.id].selectedItemId : ''}
                    onChange={(e) => this.handleBoardRelationChange(e, column)}
                  >
                    <option value="">Select an option</option>
                    {this.state[column.id] && this.state[column.id].items.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                ) : column.type === 'color' ? (
                  <span>In Approval</span>
                  // <select
                  //   name={column.title}
                  //   value={this.state[column.id] || ''}
                  //   onChange={(e) => this.handleInputChange(e, column)}
                  // >
                  //   {column.settings_str ? (
                  //     Object.keys(JSON.parse(column.settings_str).labels).map((labelKey) => (
                  //       <option
                  //         key={labelKey}
                  //         value={labelKey}  
                  //       >
                  //         {JSON.parse(column.settings_str).labels[labelKey]}
                  //       </option>
                  //     ))
                  //   ) : null}
                  // </select>
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
                      name={column.title}
                      checked={this.state[column.id] || false}  // Set the checked attribute based on the state
                      onChange={(e) => this.handleCheckboxChange(e, column)}
                    />
                  </div>
                ) : (
                  <input
                    type={column.type === 'color' ? 'text' : column.type}
                    name={column.title}
                    value={this.state[column.id] || ''}
                    onChange={(e) => this.handleInputChange(e, column)}
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
