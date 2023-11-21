import React, { Component } from 'react';

class PopupMessage extends Component {
  render() {
    const { message, type, onClose } = this.props;
    const isSuccess = type === 'success';

    return (
      <div className={`popup-message ${isSuccess ? 'success' : 'error'}`}>
        {isSuccess ? <div className="success-icon">&#10004;</div> : <div className="error-icon">&#10006;</div>}
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    );
  }
}

export default PopupMessage;
