import React, { Component } from 'react';
import './TableCreation.css';

class TableCreation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItems: new Set(),
      selectedData: null,
    };
  }

  extractValue = (col) => {
    if (!col.value) return '';

    try {
      const parsedValue = JSON.parse(col.value);
      if (parsedValue) {
        if (col.type === 'duration') {
          return parsedValue.ended_at || '';
        } else if (col.type === 'date') {
          return parsedValue.date || '';
        } else if (col.type === 'numeric') {
          return parsedValue || '';
        } else if (col.type === 'color') {
          return parsedValue.index !== undefined ? parsedValue.index : '';
        } else if (col.type === 'multiple-person') {
          return Array.isArray(parsedValue.personsAndTeams)
            ? parsedValue.personsAndTeams
                .filter((item) => item.kind === 'person')
                .map((item) => item.id)
                .join(', ')
            : '';
        } else if (col.type === 'board-relation' || col.type === 'lookup' || col.type === 'subtasks') {
          const linkedPulseIds = parsedValue.linkedPulseIds;
          if (Array.isArray(linkedPulseIds) && linkedPulseIds.length > 0) {
            const linkedIds = linkedPulseIds.map((link) => link.linkedPulseId).join(', ');
            return linkedIds;
          } else {
            return '';
          }
        } else if (col.type === 'timerange') {
          const parsedValue = JSON.parse(col.value);
          if (parsedValue && parsedValue.to && parsedValue.from) {
            const fromDate = parsedValue.from;
            const toDate = parsedValue.to;
            return `From: ${fromDate} To: ${toDate}` || '';
          }
        }
      }
    } catch (error) {
      console.error('JSON parsing error:', error);
      return col.value;
    }

    return col.value;
  };

  handleCheckboxChange = (itemId) => {
    const { selectedItems } = this.state;
    if (selectedItems.has(itemId)) {
      selectedItems.delete(itemId);
      this.setState({ selectedItems, selectedData: null });
      this.props.populateForm(null); // Pass null to clear the form
    } else {
      selectedItems.add(itemId);
      const selectedData = this.getSelectedData(itemId);
      this.setState({ selectedItems, selectedData });
      this.props.populateForm(selectedData); // Pass the selected data to the form
    }
  };

  getSelectedData(itemId) {
    const selectedData = this.props.groupedItems[itemId];
    return selectedData;
  }

  populateForm = (selectedData) => {
    this.formRef.current.populateForm(selectedData);
  }

  render() {
    const { groupedItems, boardName } = this.props;
    const { selectedItems } = this.state;

    return (
      <div>
        <h1>Board Name: {boardName}</h1>
        {Object.keys(groupedItems).length === 0 ? (
          <p>Loading data...</p>
        ) : (
          <div>
            {Object.keys(groupedItems).map((groupId) => {
              const group = groupedItems[groupId];
              return (
                <div key={groupId}>
                  <h2>Group: {group.title}</h2>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Item Name</th>
                        {group.items[0].column_values.map((col) => (
                          <th key={col.id}>{col.title}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="checkbox"
                              onChange={() => this.handleCheckboxChange(item.id)}
                              checked={selectedItems.has(item.id)}
                            />
                          </td>
                          <td>{item.name}</td>
                          {item.column_values.map((col) => (
                            <td key={col.id}>{this.extractValue(col)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default TableCreation;
