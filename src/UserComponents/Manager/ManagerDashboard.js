import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import axios from 'axios';
import API_BASE_URL from "../Config/Config";



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

 
  useEffect(() => {
    axios.get(`${API_BASE_URL}/trainer/trainings`)
      .then((response) => {
        setTrainings(response.data);
      })
      .catch((error) => {
        console.error('Error fetching training data:', error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTraining((prevTraining) => ({
      ...prevTraining,
      [name]: value
    }));
  };

  const getUserFromSession = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    return user ? user : null;
  };

  const getTokenFromSession = () => {
    return sessionStorage.getItem('token');
  };

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
     <h1>Manager Dashboard</h1>
    </div>
  );
};

export default ManagerDashboard;
