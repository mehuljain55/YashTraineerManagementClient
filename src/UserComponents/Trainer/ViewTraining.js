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
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newTraining, setNewTraining] = useState({
    description: '',
    trainingName: '',
    startDate: '',
    endDate: '',
    noOfParticipant: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusResponse, setStatusResponse] = useState(null);
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

  const handleExportTrainingList = async () => {
    try {
      if (trainings.length === 0) {
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


  const handleExportTraining = async (trainingId) => {
    try {
      

      const exportModel = {
        token,
        user,
        trainingId,
      };

      const response = await axios.post(`${API_BASE_URL}/export/dailyScheduleAllWeek`, exportModel, {
        responseType: "blob",
      });

      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const filename="Training detail list_TrainingId_"+trainingId+".xlsx";

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
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


  const handleAddTraining = async () => {
    if (user && token) {
      if (!selectedFile) {
        alert("Please upload a reference file.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const payload = {
        token,
        user,
        training: newTraining,
      };

      formData.append(
        "training",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      try {
        const response = await axios.post(
          `${API_BASE_URL}/training/addNewTraining`,
          formData
        );

        alert(response.data.message);
        fetchTrainings();
        setShowCreateModal(false);
        setNewTraining({
          trainingName: "",
          description: "",
          startDate: "",
          endDate: "",
          noOfParticipant: "",
        });
        setSelectedFile(null);
      } catch (error) {
        console.error("Error adding training:", error);
        alert("Failed to add training. Please try again.");
      }
    } else {
      alert("Unauthorized access.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-danger";  // Red
      case "PLANNED":
        return "bg-info";    // Sky Blue
      case "INPROGRESS":
        return "bg-warning"; // Yellow
      case "COMPLETED":
        return "bg-success"; // Green
      default:
        return "";
    }
  };

  const handleViewTraining = (training) => {
    setSelectedTraining(training);
    setShowModal(true);
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

        <Dropdown onSelect={setSelectedStatus}>
          <Dropdown.Toggle
            variant="success"
            id="dropdown-basic"
            className={getStatusClass(selectedStatus)}
            style={{ borderColor: 'transparent' }}
          >
            {selectedStatus}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item eventKey="PENDING">Pending</Dropdown.Item>
            <Dropdown.Item eventKey="PLANNED">Planned</Dropdown.Item>
            <Dropdown.Item eventKey="INPROGRESS">In Progress</Dropdown.Item>
            <Dropdown.Item eventKey="COMPLETED">Completed</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Button variant="success" onClick={() => setShowCreateModal(true)}>
        Add Training
      </Button>

      <Table striped bordered hover className="training-table">
        <thead>
          <tr>
            <th>Training Name</th>
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
                <td>{training.trainingName}</td>
                <td>{training.noOfParticipant}</td>
                <td>{training.description}</td>
                <td>{new Date(training.startDate).toLocaleDateString()}</td>
                <td>{new Date(training.endDate).toLocaleDateString()}</td>
                <td>
  {training.status === "PENDING" ? (
    <Dropdown id="dropdown-basic">
      <Dropdown.Toggle
        variant="info"
        className={`text-white ${getStatusClass(training.status)}`}  // Add text-white and dynamic color class
        style={{ borderColor: 'transparent' }}
      >
        {training.status}
      </Dropdown.Toggle>
    </Dropdown>
  ) : (
    <Dropdown
      onSelect={(newStatus) => handleStatusChange(training.trainingId, newStatus)}
      id="dropdown-basic"
    >
      <Dropdown.Toggle
        variant="info"
        className={`text-white ${getStatusClass(training.status)}`}  // Add text-white and dynamic color class
        style={{ borderColor: 'transparent' }}
      >
        {training.status}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item eventKey="PLANNED">Planned</Dropdown.Item>
        <Dropdown.Item eventKey="INPROGRESS">In Progress</Dropdown.Item>
        <Dropdown.Item eventKey="COMPLETED">Completed</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )}
</td>

<td>
  {training.status === "PENDING" ? (
    <span style={{ backgroundColor: "red", padding: 5, marginTop: "5px", color: "white" }}>
      Approval Pending
    </span>
  ) : (
    <div style={{ display: "flex", gap: "10px" }}>
      <Button className="view-training-btn" onClick={() => handleViewTraining(training)}>
        View
      </Button>
      <Button className="export-training-btn" onClick={() => handleExportTraining(training.trainingId)}>
        Export
      </Button>
    </div>
  )}
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
      
      <div style={{ display: "flex", gap: "10px" }}>
  {selectedStatus !== "PENDING" && (
    <Button
      variant="primary"
      onClick={handleUpdateTrainings}
      disabled={Object.keys(updatedTrainings).length === 0}
    >
      Update Trainings
    </Button>
  )}
  <Button variant="primary" onClick={handleExportTrainingList}>
    Export
  </Button>
</div>


      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Training Schedule for {selectedTraining ? selectedTraining.trainingId : ""}</Modal.Title>
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

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Training</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="trainingName">
              <Form.Label>Training Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="BG4-BU5-Java-Upsacling-(Angular)-Jan-2025"
                value={newTraining.trainingName}
                onChange={(e) =>
                  setNewTraining({ ...newTraining, trainingName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="noOfParticipant">
              <Form.Label>No of Participants</Form.Label>
              <Form.Control
                type="number"
                value={newTraining.noOfParticipant}
                onChange={(e) =>
                  setNewTraining({ ...newTraining, noOfParticipant: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTraining.description}
                onChange={(e) =>
                  setNewTraining({ ...newTraining, description: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="startDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={newTraining.startDate}
                onChange={(e) =>
                  setNewTraining({ ...newTraining, startDate: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="endDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={newTraining.endDate}
                onChange={(e) =>
                  setNewTraining({ ...newTraining, endDate: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="file">
              <Form.Label>Upload Training Plan</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddTraining}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewTraining;