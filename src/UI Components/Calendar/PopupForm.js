import React, { useState, useEffect } from 'react';
import mondaySdk from 'monday-sdk-js';
import "./PopupForm.css";
import Select from 'react-select';
import { board } from '../../API Call/mondaysdk';

const monday = mondaySdk();

const PopupForm = ({ isOpen, onClose, eventData }) => {
  const [formData, setFormData] = useState({});
  const [boardRelationOptions, setBoardRelationOptions] = useState([]);
  const [subitemOptions, setSubitemOptions] = useState([]);
  const [initialBoardRelationValue, setInitialBoardRelationValue] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const initialData = {};
      eventData.column_values.forEach((column) => {
        const { id, text, value } = column;
        initialData[id] = text || (value && JSON.parse(value).text) || '';
        if (column.type === 'hour' && value) {
          const { hour, minute } = JSON.parse(value);
          const formattedHour = `${hour < 10 ? '0' : ''}${hour}`;
          const formattedMinute = `${minute < 10 ? '0' : ''}${minute}`;
          initialData[id] = `${formattedHour}:${formattedMinute}`;
        }
      });

      // Include "Name" column inside the loop
      const nameColumn = eventData.name;
      initialData['name'] = nameColumn;

      const linkedPulseIdColumn = eventData.column_values.find(col => col.id === 'connect_boards');
      if (linkedPulseIdColumn) {
        const linkedPulseId = linkedPulseIdColumn.value;

        // Extract linked board ID from settings_str
        const settings = JSON.parse(linkedPulseIdColumn.column.settings_str);
        const linkedBoardIds = settings.boardIds;

        // Assuming there is only one linked board ID
        const linkedBoardId = linkedBoardIds[0];

        // Make an API call to fetch items from the linked board
        const linkedItemsResponse = await monday.api(`
          query {
            boards(ids: ${linkedBoardId}) {
              items_page {
                items {
                  id
                  name
                  group {
                    id
                    title
                  }
                  column_values {
                    id
                    text
                    type
                    value
                    column {
                      id
                      title
                    }
                  }
                  subitems {
                    id
                    name
                  }
                }
              }
            }
          }
          `, { apiVersion: '2023-10' });

        // Check if the linked items were successfully fetched
        if (linkedItemsResponse.data && linkedItemsResponse.data.boards) {
          const linkedItems = linkedItemsResponse.data.boards[0].items_page.items;
          console.log(linkedItems);
          // Update the options for the "board-relation" column
          const options = linkedItems.map(item => ({
            value: item.id,
            label: item.name,
          }));

          // Set the options for the state variable
          setBoardRelationOptions(options);

          const subitemOptions = linkedItems
            .flatMap(item => item.subitems.map(subitem => subitem.name))
            .map(subitemName => ({
              value: subitemName,
              label: subitemName,
            }));

          // Set the options for the state variable
          setSubitemOptions(subitemOptions);

          // Set the initial value of the "board-relation" column
          const linkedPulseIdColumn = eventData.column_values.find(col => col.id === 'connect_boards');
    if (linkedPulseIdColumn) {
      const linkedPulseIdValue = linkedPulseIdColumn.value;
      const linkedPulseIdObject = JSON.parse(linkedPulseIdValue);
      const linkedPulseId = linkedPulseIdObject.linkedPulseIds[0]?.linkedPulseId || null;

      const selectedOption = options.find(option => String(option.value) === String(linkedPulseId));
      setInitialBoardRelationValue(selectedOption || null);
    }
        }
      }


      setFormData(initialData);
    };

    fetchData();
  }, [eventData]);


  const handleInputChange = (selectedOption, columnId) => {
    // Handle the change in the selected option for the react-select component
    const inputValue = selectedOption ? selectedOption.value : '';
    setFormData((prevData) => ({
      ...prevData,
      [columnId]: inputValue,
    }));
  };

  const handleCheckboxChange = (e, columnId) => {
    const { checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [columnId]: checked,
    }));
  };

  const handleInputValueChange = (e, columnId) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [columnId]: value,
    }));

  };

  const handleHourChange = (e, columnId) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [columnId]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const columnUpdates = Object.entries(formData)
        .filter(([columnId, value]) => {
          // Exclude columns that haven't changed
          const currentValue = eventData.column_values.find(col => col.id === columnId)?.text || '';
          return value !== null && value !== undefined && value !== '' && value !== currentValue;
        })
        .map(([columnId, value]) => {
          if (columnId === 'numbers') {
            return `\\\"${columnId}\\\":${parseFloat(value) || 0}`;
          } else if (columnId === 'connect_boards' || columnId === 'mirror6') {
            return `\\\"${columnId}\\\":{\\\"linkedPulseIds\\\":[]}`;
          } else if (columnId === 'hour5' || columnId === 'hour0') {
            const [hourStr, minuteStr] = value.split(':');
            const formattedHour = parseInt(hourStr, 10);
            const formattedMinute = parseInt(minuteStr, 10);

            if (!isNaN(formattedHour) && !isNaN(formattedMinute)) {
              return `\\\"${columnId}\\\":{\\\"hour\\\":${formattedHour},\\\"minute\\\":${formattedMinute}}`;
            } else {
              // Handle the case where the conversion fails
              console.error(`Invalid hour type value: ${value}`);
              return '';
            }
          } else if (columnId === 'check') {
            const booleanValue = value === 'v' ? 'true' : 'false';
            return `\\\"${columnId}\\\":{\\\"checked\\\":\\\"${booleanValue}\\\"}`;
          } else {
            return `\\\"${columnId}\\\":\\\"${value}\\\"`;
          }
        })
        .join(', ');

      // Check if there are any valid column updates
      if (columnUpdates.length === 0) {
        console.warn('No valid column updates found.');
        return;
      }

      // Construct the GraphQL mutation query with variables
      const mutationQuery = `
        mutation {
          change_multiple_column_values (
            board_id: ${board},
            item_id: ${eventData.id},
            column_values: "{${columnUpdates}}"
          ) {
            id
          }
        }
      `;

      // Execute the mutation with variables
      const response = await monday.api(mutationQuery);

      // Check the response to ensure the update was successful
      if (response.data && response.data.change_multiple_column_values && response.data.change_multiple_column_values.id) {
        monday.execute("notice", {
          message: "Time entry updated successfully.",
          type: "success", // or "error" (red), or "info" (blue)
          timeout: 5000,
        });
        onClose(); // Close the popup after a successful update
      } else {
        // Handle the case where the update was not successful
        console.error('Error updating item:', response);
        monday.execute("notice", {
          message: "Error updating the time entry",
          type: "error", // or "error" (red), or "info" (blue)
          timeout: 5000,
        });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      monday.execute("notice", {
        message: "Error updating the time entry",
        type: "error", // or "error" (red), or "info" (blue)
        timeout: 5000,
      });
    }
  };


  const excludedColumns = ['subitems', 'text6', 'text66'];

  return (
    <div className={`popup-form ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="form-container">
          <h2>Edit Event</h2>
          {/* Render the "Name" column separately */}
          <div className="form-input">
            <label>Task</label>
            <Select
              value={subitemOptions.find(option => option.value === formData.name)}
              options={subitemOptions}
              onChange={(selectedOption) => setFormData(prevData => ({
                ...prevData,
                name: selectedOption.value,
              }))}
            />
          </div>
          <div className='form-row'>
            {eventData.column_values && (
              <>
                {eventData.column_values
                  .filter(column => !excludedColumns.includes(column.column.id))
                  .map((column) => {
                    const { id, title, type, settings_str } = column.column;
                    const inputValue = formData[id] || '';

                    if (type === 'status') {
                      const labels = JSON.parse(settings_str).labels;
                      const options = Object.entries(labels).map(([value, label]) => ({
                        value,
                        label,
                      }));
                      return (
                        <div key={id} className="form-input">
                          <label>{title}</label>
                          <Select
                            value={options.find(option => option.value === inputValue)}
                            options={options}
                            onChange={(selectedOption) => handleInputChange(selectedOption, id)}
                          />
                        </div>
                      );
                    } else if (type === 'board_relation' && title === 'Project') { // New condition for "board-relation" columns
                      return (
                        <div key={id} className="form-input">
                          <label>{title}</label>
                          <Select
                            value={initialBoardRelationValue}  // Use formData[id] directly as it already contains the selected option
                            options={boardRelationOptions}
                            onChange={(selectedOption) => handleInputChange(selectedOption, id)}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div key={id} className="form-input">
                          <label>{title}</label>
                          {type === 'checkbox' ? (
                            <input
                              type="checkbox"
                              checked={inputValue}
                              onChange={(e) => handleCheckboxChange(e, id)}
                            />
                          ) : type === 'hour' ? (
                            <input
                              type="time"
                              value={inputValue}
                              onChange={(e) => handleHourChange(e, id)}
                            />
                          ) : type === 'person' ? (
                            <input
                              type={type}
                              value={inputValue}
                              readOnly
                            />
                          ) : (
                            <input
                              type={type}
                              value={inputValue}
                              onChange={(e) => handleInputValueChange(e, id)}
                            />
                          )}
                        </div>
                      );
                    }
                  })}
              </>
            )}
          </div>
          <div className="form-submit">
            <button onClick={handleUpdate}>Update</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupForm;
