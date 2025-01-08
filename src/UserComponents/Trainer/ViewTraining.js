import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import API_BASE_URL from "../Config/Config";
import ShowStatus from "../StatusModel/ShowStatus";
import DailySchedule from './DailySchedule';  
import './ViewTraining.css';

const ViewTraining = () => {
  const [trainings, setTrainings] = useState([]);
  const [updatedTrainings, setUpdatedTrainings] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("PLANNED");
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [statusResponse, setStatusResponse] = useState(null);
  const [newTraining, setNewTraining] = useState({
    description: '',
    startDate: '',
    endDate: '',
    noOfParticipant: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState('');
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));


  useEffect(() => {
    fetchTrainings();
  }, [selectedStatus]);

  const fetchTrainings = () => {
 
    if (user && token) {
      axios.post(`${API_BASE_URL}/training/viewTrainingListByEmailAndStatus`, {
        token,
        user,
        trainingStatus: selectedStatus
      })
      .then((response) => {
        const trainingList = Array.isArray(response.data.payload) ? response.data.payload : [];
        setTrainings(trainingList);
      })
      .catch((error) => {
        console.error("Error fetching training data:", error);
        setTrainings([]);
      });
    } else {
      console.error("User or Token not found in session storage");
      setTrainings([]);
    }
  };

  const handleStatusChange = (trainingId, newStatus) => {
    setUpdatedTrainings((prev) => ({
      ...prev,
      [trainingId]: newStatus
    }));

    setTrainings((prev) => 
      prev.map((training) => 
        training.trainingId === trainingId 
          ? { ...training, status: newStatus } 
          : training
      )
    );
  };

  const handleUpdateTrainings = () => {
 
    const updatedTrainingList = Object.entries(updatedTrainings).map(([id, status]) => ({
      trainingId: id,
      status
    }));

    if (user && token) {
      axios.post(`${API_BASE_URL}/training/updateTrainingStatus`, {
        token,
        user,
        trainingList: updatedTrainingList
      })
      .then(() => {
        setStatusResponse('success');
        setMessage('Training statuses updated successfully.');
        setUpdatedTrainings({});
        fetchTrainings();
      })
      .catch((error) => {
        setStatusResponse('failed');
        setMessage('Error updating training statuses.');
        console.error("Error updating training statuses:", error);
      });
    } else {
      setStatusResponse('unauthorized');
      setMessage('Unauthorized access.');
    }
  };

  const handleExportTraining = async () => {
    try {
     
      if (trainings.length === 0) 
      {
         alert("Nothing to export");
         return;
      }

      const exportModel = {
        token,
        user,
        trainingList: trainings,
      };

      const response = await axios.post(`${API_BASE_URL}/export/trainingList`, exportModel, {
        responseType: "blob", 
      });

  
      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "training_data.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Failed to export training list. Please try again.");
      }
    } catch (error) {
      console.error("Error exporting training list:", error);
      alert("An error occurred while exporting the training list.");
    }
  };

  const handleViewTraining = (training) => {
    setSelectedTraining(training);
    setShowModal(true);
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
        setShowCreateModal(false);  
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

  return (
    <div>
      {statusResponse && (
        <ShowStatus
          statusResponse={statusResponse}
          message={message}
          onClose={() => setStatusResponse(null)}
        />
      )}

<Button variant="success" onClick={() => setShowCreateModal(true)}>
        Add Training
      </Button>

      <div className="d-flex justify-content-between align-items-center">
        <h3>Training List</h3>
        <Dropdown onSelect={setSelectedStatus}>
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
                <td>
                  <Dropdown onSelect={(status) => handleStatusChange(training.trainingId, status)}>
                    <Dropdown.Toggle variant="info" id="dropdown-basic">
                      {training.status}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item eventKey="PLANNED">Planned</Dropdown.Item>
                      <Dropdown.Item eventKey="INPROGRESS">In Progress</Dropdown.Item>
                      <Dropdown.Item eventKey="COMPLETED">Completed</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
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
        onClick={handleUpdateTrainings}
        disabled={Object.keys(updatedTrainings).length === 0}>
        Update Trainings
      </Button>

      <Button
        variant="primary"
        onClick={handleExportTraining}
        >
        Export
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Training Schedule for {selectedTraining ? selectedTraining.trainingId : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Training</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
                value={newTraining.description}
                onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Number of Participants</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter number of participants"
                value={newTraining.noOfParticipant}
                onChange={(e) => setNewTraining({ ...newTraining, noOfParticipant: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={newTraining.startDate}
                onChange={(e) => setNewTraining({ ...newTraining, startDate: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={newTraining.endDate}
                onChange={(e) => setNewTraining({ ...newTraining, endDate: e.target.value })}
              />
            </Form.Group>
           
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddTraining}>
            Add Training
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewTraining;
