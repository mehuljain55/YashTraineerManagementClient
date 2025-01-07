import React, { useState, useEffect } from 'react';
import { Button, Table, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import API_BASE_URL from '../Config/Config';

const ViewTrainerSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')));

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetchSchedule(today, today);
  }, []);

  const fetchSchedule = (start, end) => {
    setLoading(true);
    setErrorMessage('');
    axios
      .post(`${API_BASE_URL}/trainer/viewTrainerScheduleDateRange`, {
        token: token,
        user: user,
        startDate: start,
        endDate: end,
      })
      .then((response) => {
        if (response.data.status === 'success') {
          setSchedule(response.data.payload || []);
        } else {
          setErrorMessage(response.data.message || 'Failed to fetch schedule.');
        }
      })
      .catch((error) => {
        setErrorMessage('An error occurred while fetching the schedule.');
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearch = () => {
    if (!startDate || !endDate) {
      setErrorMessage('Please select both start and end dates.');
      return;
    }
    fetchSchedule(startDate, endDate);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Trainer Daily Schedule</h3>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="me-2"
          />
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button variant="primary" onClick={handleSearch} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
        </Button>
      </div>

      {errorMessage && <p className="text-danger">{errorMessage}</p>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Day</th>
            <th>Email</th>
            <th>Training ID</th>
            <th>Type</th>
            <th>Date</th>
            <th>Description</th>
            <th>Attendance</th>
          </tr>
        </thead>
        <tbody>
          {schedule.length > 0 ? (
            schedule.map((item, index) => (
              <tr key={item.sno}>
                <td>{index + 1}</td>
                <td>{item.day}</td>
                <td>{item.emailId}</td>
                <td>{item.trainingId}</td>
                <td>{item.type}</td>
                <td>{formatDate(item.date)}</td>
                <td>{item.description}</td>
                <td>{item.trainerAttendance}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No schedule available for the selected date range.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ViewTrainerSchedule;
