import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import API_BASE_URL from "../Config/Config";
import ShowStatus from "../StatusModel/ShowStatus";
import DailySchedule from './DailySchedule';  // Import the DailyScheduleContainer
import './ViewTraining.css';

const ViewTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("PLANNED");
  const [newTraining, setNewTraining] = useState({
    noOfParticipant: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [statusResponse, setStatusResponse] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedTraining, setSelectedTraining] = useState(null);  // Track selected training for viewing

  useEffect(() => {
    fetchTrainings();  // Fetch trainings initially with the default status
  }, [selectedStatus]);  // Fetch data when selectedStatus changes

  const fetchTrainings = () => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (user && token) {
      // Send selected status directly as a string to backend
      axios.post(`${API_BASE_URL}/training/viewTrainingListByEmailAndStatus`, {
        token: token,  // Send token directly
        user: user,  // Send user data directly
        trainingStatus: selectedStatus,  // Send selected status as a string
      })
      .then((response) => {
        console.log("API Response:", response.data);
        const trainingList = Array.isArray(response.data.payload) ? response.data.payload : [];
        setTrainings(trainingList);
        console.log(trainings);
      })
      .catch((error) => {
        console.error("Error fetching training data:", error);
        setTrainings([]);  // Handle error by resetting trainings
      });
    } else {
      console.error("User or Token not found in session storage");
      setTrainings([]);  // Handle missing user or token
    }
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);  // Update the selected status on dropdown select
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTraining((prevTraining) => ({
      ...prevTraining,
      [name]: value,
    }));
  };

  const handleAddTraining = () => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (user && token) {
      axios.post(`${API_BASE_URL}/training/addNewTraining`, {
        token: token,  
        user: user,  
        training: newTraining, 
      })
      .then((response) => {
       fetchTrainings();
       setShowModal(false);
      })
      .catch((error) => {
        setStatusResponse('failed');
        setMessage('Error creating training.');
        console.error("Error adding training:", error);
      });
    } else {
      setStatusResponse('unauthorized');
      setMessage('Unauthorized access.');
      console.error("User or Token not found in session storage");
    }
  };

  // Handle "View" button click
  const handleViewTraining = (training) => {
    setSelectedTraining(training);
    setShowModal(true);  // Show the modal with the DailyScheduleContainer
  };

  return (
    <div>
      {statusResponse && (
        <ShowStatus
          statusResponse={statusResponse}
          message={message}
          onClose={() => setStatusResponse(null)}
        />
      )}

      <div className="d-flex justify-content-between align-items-center">
        <h3>Training List</h3>
        <Dropdown onSelect={handleStatusSelect}>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {selectedStatus}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="PLANNED">Planned</Dropdown.Item>
            <Dropdown.Item eventKey="INPROGRESS">In Progress</Dropdown.Item>
            <Dropdown.Item eventKey="COMPLETED">Completed</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover className="training-table">
        <thead>
          <tr>
            <th>Training ID</th>
            <th>No of Participants</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(trainings) && trainings.length > 0 ? (
            trainings.map((training) => (
              <tr key={training.trainingId}>
                <td>{training.trainingId}</td>
                <td>{training.noOfParticipant}</td>
                <td>{training.description}</td>
                <td>{new Date(training.startDate).toLocaleDateString()}</td>
                <td>{new Date(training.endDate).toLocaleDateString()}</td>
                <td>{training.status}</td>
                <td>
                  <Button className='view-taining-btn' onClick={() => handleViewTraining(training)}>
                    View
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No trainings available.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Button
        variant="primary"
        className="create-training-button"
        onClick={() => setShowModal(true)}
      >
        Create Training
      </Button>

      {/* Modal for View Training with Daily Schedule */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Training Schedule for {selectedTraining ? selectedTraining.trainingId : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Pass necessary props to DailyScheduleContainer */}
          {selectedTraining && (
            <DailySchedule 
              trainingId={selectedTraining.trainingId}
              startDate={selectedTraining.startDate}
              endDate={selectedTraining.endDate}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default ViewTraining;
