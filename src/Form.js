import React, { Component } from 'react';
import './Form.css';
import { fetchColumns, fetchBoardAndGroupId } from './getids';
import { createItem } from './mutation';
import PopupMessage from './PopupMessage';

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
      ...props,
    };
  }

  handlePopupClose = () => {
    this.setState({
      showPopup: false,
      popupMessage: '',
    });
  };

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

  handleBoardRelationChange = (e, column) => {
    const selectedItemId = e.target.value;
    const selectedBoardItems = this.state[column.id].items;
    const selectedItem = selectedBoardItems.find(item => item.id === selectedItemId);

    this.setState((prevState) => ({
      ...prevState,
      [column.id]: {
        selectedItemId,
        selectedItem,
        items: prevState[column.id].items,
      },
    }));
  };

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
                }
              }
            }
          `,
        }),
      });

      const data = await response.json();

      if (data.data && data.data.boards && data.data.boards.length > 0) {
        return data.data.boards[0].items.filter(item => item.group.title === 'On Going Projects');
      }

      return [];
    } catch (error) {
      console.error('Error fetching board items:', error);
      return [];
    }
  }

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

  handleSubmit = async (e) => {
    e.preventDefault();
    const { boardId, groupId, columns, ...values } = this.state;
  
    const columnValues = {};
    columns.forEach((column) => {
      const columnId = column.id;
      if (values[columnId] !== undefined && values[columnId] !== null) {
        if (column.type === 'board-relation') {
          // Check if a value is selected for the board-relation column
          if (values[columnId].selectedItemId) {
            columnValues[columnId] = values[columnId].selectedItemId;
          } // Do not include the field if no value is selected
        } else {
          columnValues[columnId] = values[columnId];
        }
      }
    });
  
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
  }
    

  render() {
    const { columns, successMessage, errorMessage, showPopup, popupMessage, popupType } = this.state;

    return (
      <div className="form-container">
        <h1>Time Entry Form</h1>
        <form onSubmit={this.handleSubmit}>
          <div className="form-row">
            {columns.map((column, index) => (
              <div key={column.id} className="form-input">
                <label>{column.title}</label>
                {column.type === 'board-relation' ? (
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
                  <select
                    name={column.title}
                    value={this.state[column.id] || ''}
                    onChange={(e) => this.handleInputChange(e, column)}
                  >
                    <option value="">Select an option</option>
                    {column.settings_str ? (
                      Object.keys(JSON.parse(column.settings_str).labels).map((labelKey) => (
                        <option
                          key={labelKey}
                          value={labelKey}
                        >
                          {JSON.parse(column.settings_str).labels[labelKey]}
                        </option>
                      ))
                    ) : null}
                  </select>
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
