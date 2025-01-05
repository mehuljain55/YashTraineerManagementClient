import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Form } from 'react-bootstrap';
import API_BASE_URL from "../Config/Config"; // Make sure to replace with actual config path

const DailySchedule = ({ trainingId, startDate, endDate }) => {
  const [dailySchedules, setDailySchedules] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);  // Keep track of the current week in pagination
  const [totalWeeks, setTotalWeeks] = useState(0); // Total weeks for pagination
  const [weekSchedules, setWeekSchedules] = useState([]);
  const [description, setDescription] = useState({});
  const [statusResponse, setStatusResponse] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDailySchedule();
  }, [trainingId, startDate, endDate]);

  const fetchDailySchedule = () => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (user && token) {
      axios.post(`${API_BASE_URL}/training/viewDailySchedule`, {
        token,
        user,
        trainingId,
        startDate,
        endDate,
      })
      .then((response) => {
        const fetchedSchedules = response.data.payload || [];
        setDailySchedules(fetchedSchedules);
        setTotalWeeks(fetchedSchedules.length);
        setWeekSchedules(fetchedSchedules[currentWeek] || []); // Ensure it's an array
      })
      .catch((error) => {
        console.error("Error fetching daily schedule:", error);
        setDailySchedules([]);
      });
    } else {
      console.error("User or Token not found in session storage");
      setDailySchedules([]);
    }
  };

  const handleDescriptionChange = (e, weekId, day) => {
    const { value } = e.target;
    setDescription((prev) => ({
      ...prev,
      [weekId]: {
        ...prev[weekId],
        [day]: value,
      },
    }));
  };

  const handlePagination = (direction) => {
    let newWeek = currentWeek + direction;
    if (newWeek < 0) newWeek = 0;
    if (newWeek >= totalWeeks) newWeek = totalWeeks - 1;
    setCurrentWeek(newWeek);
    setWeekSchedules(dailySchedules[newWeek] || []); // Ensure it's an array
  };

  const handleSubmit = () => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    const dataToSubmit = [];
    Object.keys(description).forEach((weekId) => {
      Object.keys(description[weekId]).forEach((day) => {
        const schedule = {
          trainingId,
          weekId,
          day,
          description: description[weekId][day],
        };
        dataToSubmit.push(schedule);
      });
    });

    if (user && token) {
      axios.post(`${API_BASE_URL}/submitDailySchedule`, {
        token,
        user,
        schedules: dataToSubmit,
      })
      .then((response) => {
        setStatusResponse('success');
        setMessage('Schedules updated successfully!');
        fetchDailySchedule(); // Refresh data
      })
      .catch((error) => {
        setStatusResponse('failed');
        setMessage('Error updating schedules.');
        console.error("Error submitting daily schedule:", error);
      });
    } else {
      setStatusResponse('unauthorized');
      setMessage('Unauthorized access.');
    }
  };

  return (
    <div>
      {statusResponse && (
        <div className={`status-response ${statusResponse}`}>
          <span>{message}</span>
        </div>
      )}

      <h3>Daily Schedule for Training ID: {trainingId}</h3>

      <div className="pagination-buttons">
        <Button onClick={() => handlePagination(-1)} disabled={currentWeek === 0}>
          Previous Week
        </Button>
        <Button onClick={() => handlePagination(1)} disabled={currentWeek === totalWeeks - 1}>
          Next Week
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Training ID</th>
            <th>Date</th>
            <th>Day</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(weekSchedules) && weekSchedules.length > 0 ? (
            weekSchedules.map((schedule, index) => (
              <tr key={index}>
                <td>{trainingId}</td>
                <td>{new Date(schedule.date).toLocaleDateString()}</td>
                <td>{schedule.day}</td>
                <td>
                  <Form.Control
                    type="text"
                    value={description[schedule.weekId]?.[schedule.day] || ""}
                    onChange={(e) => handleDescriptionChange(e, schedule.weekId, schedule.day)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No schedules available for this week.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Button variant="primary" onClick={handleSubmit}>
        Submit All Descriptions
      </Button>
    </div>
  );
};

export default DailySchedule;
