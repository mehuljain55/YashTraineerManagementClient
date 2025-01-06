import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Form } from 'react-bootstrap';
import API_BASE_URL from "../Config/Config"; // Replace with actual config path

const DailySchedule = ({ trainingId }) => {
  const [dailySchedules, setDailySchedules] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0); // Keep track of the current week in pagination
  const [totalWeeks, setTotalWeeks] = useState(0); // Total weeks for pagination
  const [statusResponse, setStatusResponse] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDailySchedule();
  }, [trainingId]);

  // Fetch the daily schedule from the API
  const fetchDailySchedule = () => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (user && token) {
      axios.post(`${API_BASE_URL}/training/viewDailySchedule`, {
        token,
        user,
        trainingId,
      })
      .then((response) => {
        const fetchedSchedules = response.data.payload || [];

        // Group schedules by weekScheduleId
        const groupedSchedules = fetchedSchedules.reduce((acc, schedule) => {
          const { weekScheduleId } = schedule;
          if (!acc[weekScheduleId]) {
            acc[weekScheduleId] = [];
          }
          acc[weekScheduleId].push(schedule);
          return acc;
        }, {});

        // Sort schedules within each week by date
        for (const weekId in groupedSchedules) {
          groupedSchedules[weekId].sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        // Create an array of weeks, each containing its schedules
        const weeksArray = Object.entries(groupedSchedules).map(([weekScheduleId, schedules]) => ({
          weekScheduleId,
          schedules
        }));

        // Sort the weeks by the first entry's date (ascending order)
        weeksArray.sort((a, b) => new Date(a.schedules[0].date) - new Date(b.schedules[0].date));

        setDailySchedules(weeksArray);
        setTotalWeeks(weeksArray.length); // Set total weeks
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

  // Handle changes in the description field
  const handleDescriptionChange = (e, sno) => {
    const { value } = e.target;
    setDailySchedules(prevWeeks =>
      prevWeeks.map(week =>
        ({
          ...week,
          schedules: week.schedules.map(schedule =>
            schedule.sno === sno ? { ...schedule, description: value } : schedule
          )
        })
      )
    );
  };

  // Handle changes in the trainer attendance dropdown
  const handleAttendanceChange = (e, sno) => {
    const { value } = e.target;
    setDailySchedules(prevWeeks =>
      prevWeeks.map(week =>
        ({
          ...week,
          schedules: week.schedules.map(schedule =>
            schedule.sno === sno
              ? {
                  ...schedule,
                  trainerAttendance: value,
                  description: value === 'LEAVE' ? '' : schedule.description
                }
              : schedule
          )
        })
      )
    );
  };

  // Handle pagination
  const handlePagination = (direction) => {
    let newWeek = currentWeek + direction;
    if (newWeek < 0) newWeek = 0;
    if (newWeek >= totalWeeks) newWeek = totalWeeks - 1;
    setCurrentWeek(newWeek);
  };

  // Submit the updated schedule descriptions
  const handleSubmit = () => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    const dataToSubmit = dailySchedules.flatMap((week) =>
      week.schedules.map((schedule) => ({
        sno: schedule.sno,
        description: schedule.description || "",
        trainerAttendance: schedule.trainerAttendance || "PRESENT",
      }))
    );

    if (user && token) {
      axios.post(`${API_BASE_URL}/training/updateDailySchedule`, {
        token,
        user,
        dailyScheduleList: dataToSubmit,
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

  const weekSchedules = dailySchedules[currentWeek]?.schedules || [];

  return (
    <div>
      {statusResponse && (
        <div className={`status-response ${statusResponse}`}>
          <span>{message}</span>
        </div>
      )}

      <h3>Daily Schedule for Training ID: {trainingId}</h3>

      {/* Pagination buttons */}
      <div className="pagination-buttons">
        <Button onClick={() => handlePagination(-1)} disabled={currentWeek === 0}>
          Previous Week
        </Button>
        <span>Week {currentWeek + 1} of {totalWeeks}</span>
        <Button onClick={() => handlePagination(1)} disabled={currentWeek >= totalWeeks - 1}>
          Next Week
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Date</th>
            <th>Day</th>
            <th>Trainer Attendance</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {weekSchedules.length > 0 ? (
            weekSchedules.map((schedule, index) => (
              <tr key={index}>
                <td>{schedule.sno}</td>
                <td>{new Date(schedule.date).toLocaleDateString()}</td>
                <td>{schedule.day}</td>
                <td>
                  <Form.Select
                    value={schedule.trainerAttendance || "PRESENT"}
                    onChange={(e) => handleAttendanceChange(e, schedule.sno)}
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="LEAVE">LEAVE</option>
                  </Form.Select>
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={schedule.description || ""}
                    onChange={(e) => handleDescriptionChange(e, schedule.sno)}
                    disabled={schedule.trainerAttendance === "LEAVE"}
                    placeholder={schedule.trainerAttendance === "LEAVE" ? "Trainer on leave" : "Enter description"}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No schedules available for this week.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Submit button */}
      <Button variant="primary" onClick={handleSubmit}>
        Update
      </Button>
    </div>
  );
};

export default DailySchedule;
