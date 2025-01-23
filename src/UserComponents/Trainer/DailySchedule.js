import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Form } from 'react-bootstrap';
import API_BASE_URL from "../Config/Config"; 
import './DailySchedule.css';
import EditRequestModal from './EditRequestModal';

const DailySchedule = ({ trainingId }) => {
  const [dailySchedules, setDailySchedules] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0); 
  const [totalWeeks, setTotalWeeks] = useState(0); 
  const [statusResponse, setStatusResponse] = useState(null);
  const [message, setMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDailyScheduleId, setSelectedDailyScheduleId] = useState(null);
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    fetchDailySchedule();
  }, [trainingId]);

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

        const groupedSchedules = fetchedSchedules.reduce((acc, schedule) => {
          const { weekScheduleId } = schedule;
          if (!acc[weekScheduleId]) {
            acc[weekScheduleId] = [];
          }
          acc[weekScheduleId].push(schedule);
          return acc;
        }, {});

        for (const weekId in groupedSchedules) {
          groupedSchedules[weekId].sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        const weeksArray = Object.entries(groupedSchedules).map(([weekScheduleId, schedules]) => ({
          weekScheduleId,
          schedules
        }));

        weeksArray.sort((a, b) => new Date(a.schedules[0].date) - new Date(b.schedules[0].date));

        setDailySchedules(weeksArray);
        setTotalWeeks(weeksArray.length); 
        setActiveWeekByDate(weeksArray);
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

  const isTextFieldDisabled = (schedule) => {
    if (schedule.trainerAttendance === "LEAVE") {
      return true;
    }
  
    if (schedule.modfiyStatus === "enabled") {
    
      return false; 
    }
  
    const today = new Date().toISOString().split("T")[0];
    if (new Date(schedule.date).toISOString().split("T")[0] === today) {
      return false; 
    }
  
    return true;
  };
  
  
  
  const getPlaceholderText = (schedule) => {
    if (schedule.trainerAttendance === "LEAVE") return "Trainer on leave";
  
    const today = new Date().toISOString().split("T")[0];
    if (
      !(schedule.modfiyStatus === "enabled" || new Date(schedule.date).toISOString().split("T")[0] === today)
    ) {
      return "Contact admin to enable";
    }
  
    return "Enter description";
  };

  const handleOpenEditModal = (sno) => {
    setSelectedDailyScheduleId(sno);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedDailyScheduleId(null);
  };


  const handleExportTrainingWeekWise = async () => {
    try {
      if (!dailySchedules[currentWeek] || dailySchedules[currentWeek].schedules.length === 0) {
        alert("Nothing to export for the current week.");
        return;
      }

      console.log(dailySchedules[currentWeek]);
  
      const dailyScheduleList = dailySchedules[currentWeek].schedules.map((schedule) => ({
        sno: schedule.sno,
        weeklySchedule: { id: schedule.weekScheduleId }, 
        day: schedule.day,
        emailId: schedule.emailId,
        trainingId: schedule.trainingId,
        type: schedule.type, 
        date: schedule.date,
        weekScheduleId: schedule.weekScheduleId, 
        trainerAttendance: schedule.trainerAttendance, 
      }));
  
      const exportModel = {
        token,
        user,
        dailyScheduleList,
      };
  
      const response = await axios.post(
        `${API_BASE_URL}/export/dailyScheduleSingleWeek`,
        exportModel,
        { responseType: "blob" }
      );
  
      const filename = user.name + " weekly schedule list.xlsx";

      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Failed to export the current week schedule. Please try again.");
      }
    } catch (error) {
      console.error("Error exporting current week schedule:", error);
      alert("An error occurred while exporting the current week schedule.");
    }
  };
  
  
  const setActiveWeekByDate = (weeksArray) => {
    const today = new Date().toISOString().split("T")[0];
    const activeWeekIndex = weeksArray.findIndex((week) =>
      week.schedules.some((schedule) => schedule.date === today)
    );
    setCurrentWeek(activeWeekIndex !== -1 ? activeWeekIndex : 0);
  };

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

  const handlePagination = (direction) => {
    let newWeek = currentWeek + direction;
    if (newWeek < 0) newWeek = 0;
    if (newWeek >= totalWeeks) newWeek = totalWeeks - 1;
    setCurrentWeek(newWeek);
  };

  const handleWeekClick = (weekIndex) => {
    setCurrentWeek(weekIndex);
  };

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
        setStatusResponse(response.data.status);
        setMessage(response.data.message);
        fetchDailySchedule(); 
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
  const currentWeekId = dailySchedules[currentWeek]?.weekScheduleId || '';
  
  return (
    <div className="daily-schedule-container">
    {statusResponse && (
      <div className={`status-response ${statusResponse}`}>
        <span>{message}</span>
      </div>
    )}

    <div className="week-id-display">
      Week ID: {currentWeekId}
    </div>

    <Table striped bordered hover className="schedule-table">
  <thead>
    <tr>
      <th>S.No</th>
      <th>Date</th>
      <th>Day</th>
      <th>Trainer Attendance</th>
      <th>Description</th>
      <th>Action</th>
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
    value={schedule.trainerAttendance || "NOT_UPDATED"}
    onChange={(e) => handleAttendanceChange(e, schedule.sno)}
  >
    <option value="NOT_UPDATED">Not Updated</option>
    <option value="PRESENT">PRESENT</option>
    <option value="LEAVE">LEAVE</option>
  </Form.Select>
</td>
<td>
  <Form.Control
    type="text"
    value={schedule.description || ""}
    onChange={(e) => {
      // Automatically set attendance to PRESENT if NOT_UPDATED
      if (schedule.trainerAttendance === "NOT_UPDATED") {
        handleAttendanceChange({ target: { value: "PRESENT" } }, schedule.sno);
      }
      // Handle description change
      handleDescriptionChange(e, schedule.sno);
    }}
    disabled={isTextFieldDisabled(schedule)}
    placeholder={getPlaceholderText(schedule)}
  />
</td>



          <td>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenEditModal(schedule.sno)}
            >
              Request Edit
            </Button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="6" className="text-center">
          No schedules available for this week.
        </td>
      </tr>
    )}
  </tbody>
</Table>

    <EditRequestModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        trainingId={trainingId}
        dailyScheduleId={selectedDailyScheduleId}
      />

    <div className="pagination-buttons">
      <Button
        variant="outline-primary"
        className="prev-week"
        onClick={() => handlePagination(-1)}
        disabled={currentWeek === 0}
      >
        Previous Week
      </Button>

      <div className="week-buttons">
        {Array.from({ length: totalWeeks }).map((_, index) => (
          <Button
            key={index}
            onClick={() => handleWeekClick(index)}
            variant={index === currentWeek ? "primary" : "outline-primary"}
          >
            {index + 1}
          </Button>
        ))}
      </div>

      <Button
        variant="outline-primary"
        className="next-week"
        onClick={() => handlePagination(1)}
        disabled={currentWeek >= totalWeeks - 1}
      >
        Next Week
      </Button>
    </div>

    <Button variant="primary" className="update-button" onClick={handleSubmit}>
      Update
    </Button>

    <Button variant="primary" className="export-button" onClick={handleExportTrainingWeekWise}>
      Export
    </Button>
  </div>
  );
}  
export default DailySchedule;
