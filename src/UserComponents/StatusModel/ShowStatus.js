import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import './ShowStatus.css'; // Optional custom CSS for styling

const ShowStatus = ({ statusResponse, message, onClose }) => {
  let icon = <FaInfoCircle />;
  let variant = 'info';

  switch (statusResponse) {
    case 'success':
      icon = <FaCheckCircle />;
      variant = 'success';
      break;
    case 'failed':
      icon = <FaTimesCircle />;
      variant = 'danger';
      break;
    case 'unauthorized':
      icon = <FaExclamationTriangle />;
      variant = 'warning';
      break;
    case 'not_found':
      icon = <FaExclamationTriangle />;
      variant = 'danger';
      break;
    case 'not_available':
      icon = <FaExclamationTriangle />;
      variant = 'warning';
      break;
    case 'authorized':
      icon = <FaCheckCircle />;
      variant = 'success';
      break;
    case 'available':
      icon = <FaCheckCircle />;
      variant = 'success';
      break;
    default:
      icon = <FaInfoCircle />;
      variant = 'info';
  }

  return (
    <Alert variant={variant} className="status-alert">
      <div className="status-icon">
        {icon}
      </div>
      <div className="status-message">
        <strong>{statusResponse.toUpperCase()}!</strong> {message}
      </div>
      <Button variant="link" onClick={onClose} className="close-button">
        Close
      </Button>
    </Alert>
  );
};

export default ShowStatus;
