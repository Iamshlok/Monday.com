// PopupForm.js
import React, { useState, useEffect } from 'react';
import "./PopupForm.css";

const PopupForm = ({ isOpen, onClose, eventData }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
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
    setFormData(initialData);
  }, [eventData]);

  const handleInputChange = (e, columnId) => {
    const { value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData((prevData) => ({
      ...prevData,
      [columnId]: inputValue,
    }));
  };

  const handleUpdate = async () => {
    try {
      // Perform the updateItem mutation with formData
      // await updateItem(eventData.id, formData);
      onClose(); // Close the popup after a successful update
    } catch (error) {
      console.error('Error updating item:', error);
      // Handle error as needed
    }
  };

  const excludedColumns = ['subitems', 'text6', 'text66'];

  return (
    <div className={`popup-form ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="form-container">
          <h2>Edit Event</h2>
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
                      return (
                        <div key={id} className="form-input">
                          <label>{title}</label>
                          <select
                            value={inputValue}
                            onChange={(e) => handleInputChange(e, id)}
                          >
                            {Object.entries(labels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    } else {
                      return (
                        <div key={id} className="form-input">
                          <label>{title}</label>
                          {type === 'checkbox' ? (
                            <input
                              type="checkbox"
                              checked={inputValue === 'v'}
                              onChange={(e) => handleInputChange(e, id)}
                            />
                          ) : type === 'hour' ? (
                            <input
                              type="time"
                              value={inputValue}
                              onChange={(e) => handleInputChange(e, id)}
                            />
                          ) : (
                            <input
                              type={type}
                              value={inputValue}
                              onChange={(e) => handleInputChange(e, id)}
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
