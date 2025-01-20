import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import API_BASE_URL from '../Config/Config';

const EditRequestModal = ({ show, handleClose, trainingId, dailyScheduleId }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setStatusMessage("");

    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!token || !user) {
      setStatusMessage("Unauthorized. Please log in.");
      setLoading(false);
      return;
    }

    const requestData = {
      token,
      user,
      userRequests: {
        trainingId,
        dailyScheduledId: dailyScheduleId,
        reason,
      },
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/trainer/editRequest`, requestData);
      if (response.data.status === "success") {
        setStatusMessage("Request submitted successfully!");
        handleClose();
      } else {
        setStatusMessage(response.data.message || "Failed to submit request.");
      }
    } catch (error) {
      console.error("Error submitting edit request:", error);
      setStatusMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Schedule Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="reason">
          <Form.Label>Reason for Edit</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for the edit"
          />
        </Form.Group>
        {statusMessage && <div className="status-message mt-3">{statusMessage}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading || !reason}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditRequestModal;
