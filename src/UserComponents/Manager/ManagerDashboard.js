import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import axios from 'axios';
import API_BASE_URL from "../Config/Config";
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import ShowStatus from "../StatusModel/ShowStatus"
import './ViewTraining.css'; // Optional custom CSS for styling


const ManagerDashboard = () => {
  const [trainings, setTrainings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTraining, setNewTraining] = useState({
    noOfParticipant: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [statusResponse, setStatusResponse] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch training data
  useEffect(() => {
    axios.get(`${API_BASE_URL}/trainer/trainings`)
      .then((response) => {
        setTrainings(response.data);
      })
      .catch((error) => {
        console.error('Error fetching training data:', error);
      });
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTraining((prevTraining) => ({
      ...prevTraining,
      [name]: value
    }));
  };

  // Retrieve User and Token from sessionStorage
  const getUserFromSession = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    return user ? user : null;
  };

  const getTokenFromSession = () => {
    return sessionStorage.getItem('token');
  };

  // Handle adding new training
  const handleAddTraining = () => {
    const user = getUserFromSession();
    const token = getTokenFromSession();

    if (user && token) {
      axios.post(`${API_BASE_URL}/trainer/addNewTraining`, {
        user: { emailId: user.emailId, token: token },
        training: newTraining
      })
      .then((response) => {
        setTrainings([...trainings, response.data]);
        setStatusResponse('success');
        setMessage('Training created successfully!');
        setShowModal(false);
      })
      .catch((error) => {
        setStatusResponse('failed');
        setMessage('Error creating training.');
        console.error('Error adding training:', error);
      });
    } else {
      setStatusResponse('unauthorized');
      setMessage('Unauthorized access.');
      console.error('User or Token not found in session storage');
    }
  };

  return (
    <div>
      {statusResponse && <ShowStatus statusResponse={statusResponse} message={message} onClose={() => setStatusResponse(null)} />}

      <Button
        variant="primary"
        className="create-training-button"  
        onClick={() => setShowModal(true)}
      >
        Create Training
      </Button>

      <h3>Training List</h3>
      <Table striped bordered hover className="training-table">  
        <thead>
          <tr>
            <th>Training ID</th>
            <th>No of Participants</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>
        <tbody>
          {trainings.map((training) => (
            <tr key={training.trainingId}>
              <td>{training.trainingId}</td>
              <td>{training.noOfParticipant}</td>
              <td>{training.description}</td>
              <td>{new Date(training.startDate).toLocaleDateString()}</td>
              <td>{new Date(training.endDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Add New Training</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form>
            <Form.Group controlId="formNoOfParticipants">
              <Form.Label>No of Participants</Form.Label>
              <Form.Control
                type="number"
                name="noOfParticipant"
                value={newTraining.noOfParticipant}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={newTraining.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formStartDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={newTraining.startDate}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formEndDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={newTraining.endDate}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddTraining}>
            Save Training
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
