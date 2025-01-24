import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Modal, Button, Dropdown } from 'react-bootstrap';
import API_BASE_URL from "../Config/Config";
import './UserApprovalList.css';

const UserApprovalList = () => {
  
  const [userApprovalRequestList, setUserApprovalRequestList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userData = JSON.parse(sessionStorage.getItem('user'));
  const token = sessionStorage.getItem('token');


  const handleUpdateRequest = async (emailId,status) => {
    
    try {

      const userApprovalRequest = {
        token,
        user: userData,
        emailId: emailId,
        status: status

      };

     
      const response = await axios.post(`${API_BASE_URL}/manager/updateUserStatus`, userApprovalRequest, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      fetchUserApprovalRequests();

      if (response.data.status === 'success') {
        alert('User approved');

      } else {
        alert('Unable to approve user');
      }
    } catch (err) {
      alert('Error approving user');
    }
  };

  


  const fetchUserApprovalRequests = async () => {
    setUserApprovalRequestList([]);
    setLoading(true);
    setError(null);
    const user = JSON.parse(sessionStorage.getItem('user'));
    const token = sessionStorage.getItem('token');

    if (!user || !token) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const userApprovalRequest = {
      token: token,
      user: user,
    }


    try {
      const response = await axios.post(`${API_BASE_URL}/manager/userApprovalList`, userApprovalRequest);

      if (response.data.status === 'success') {
          setUserApprovalRequestList(response.data.payload);
      }else if (response.data.status === 'not_found') {
        setError('No Request pending');
    }
       else {
        console.log("user");
        console.log(response.data);
        setError('Failed to fetch appoval requests');
      }
    } catch (err) {
      setError('Error fetching appoval requests');
    }
    setLoading(false);
  };

  

  useEffect(() => {
    fetchUserApprovalRequests();
  }, []);

  return (
    <div className="container mt-5">
      <h2>User Approval Requests</h2>
      
      
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {loading ? (
        <div className="spinner-border text-primary mt-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>Email ID</th>
            
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
             
                {userData.role !== 'super_admin' && ( 
                     <th>Action</th>
                  )}  
             
            </tr>
          </thead>
          <tbody>
            {userApprovalRequestList.length > 0 ? (
              userApprovalRequestList.map((request) => (
                <tr key={request.emailId}>
                  <td>{request.emailId}</td>
                  <td>{request.name}</td>
                  <td>{request.role}</td>
                
                  <td>{request.status}</td>
                  
                  {userData.role !== 'super_admin' && ( 
                 <td>
                 <div className="button-group"> 
                    <Button variant="success" onClick={() => handleUpdateRequest(request.emailId,"active")}>Approve</Button> 
                    <Button variant="danger" onClick={() => handleUpdateRequest(request.emailId,"blocked")}>Block</Button> 
                    </div> 
                    </td>
                  )}  
                  
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center">
                  No approval requests found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default UserApprovalList;