import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import API_BASE_URL from "../Config/Config";
import ShowStatus from "../StatusModel/ShowStatus";
import DailySchedule from '../Trainer/DailySchedule';
import './ViewTrainingManager.css';

const UserRequest = () => {
  const [userRequests, setUserRequest] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [statusResponse, setStatusResponse] = useState(null);
  const [message, setMessage] = useState('');
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    fetchRequest();
  }, [selectedStatus]);

  const fetchRequest = () => {
    if (user && token) {
      axios.post(`${API_BASE_URL}/manager/userRequestList`, {
        token,
        user,
        status: selectedStatus
      })
      .then((response) => {
        const userRequestList = Array.isArray(response.data.payload) ? response.data.payload : [];
        setUserRequest(userRequestList);
        console.log(userRequests);
      })
      .catch((error) => {
        console.error("Error fetching training data:", error);
        setUserRequest([]);
      });
    } else {
      console.error("User or Token not found in session storage");
      setUserRequest([]);
    }
  };

  

  

  

 
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning"; // Yellow
        
      case "approved":
        return "bg-success"; // Green

        case "rejected":
          return "bg-danger";  // Red
      
      default:
        return "";
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

<div className="d-flex justify-content-between align-items-center">
        <h3>User Edit Request List</h3>



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
            <Dropdown.Item eventKey="pending">Pending</Dropdown.Item>
            <Dropdown.Item eventKey="approved">Approved</Dropdown.Item>
            <Dropdown.Item eventKey="rejected">Rejected</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

     

      <Table striped bordered hover className="training-table">
        <thead>
          <tr>
            <th>Email Id</th>
            <th>Training Name</th>
            <th>Date</th>
      
            <th>Reason</th>
            <th>Status</th>
          
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(userRequests) && userRequests.length > 0 ? (
            userRequests.map((userRequest) => (
              <tr key={userRequest.requestId}>
                <td>{userRequest.emailId}</td>
                <td>{userRequest.trainingName}</td>
              
                <td>{new Date(userRequest.date).toLocaleDateString()}</td>
                <td>{userRequest.reason}</td>
                <td>{userRequest.status}</td>



                <td>
  {userRequest.status === "pending" && (
    <>
      <Button className="view-taining-btn">Approve</Button>
      <Button className="view-taining-btn">Reject</Button>
    </>
  )}
  {userRequest.status === "approved" && (
    <>
      <Button className="view-taining-btn">Reject</Button>
    </>
  )}
</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No Request available.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      
     
      
    </div>
  );
};

export default UserRequest;