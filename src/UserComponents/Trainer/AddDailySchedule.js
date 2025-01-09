import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../Config/Config";
import { Table, Form, Button, Container, Row, Col } from "react-bootstrap";

const AddDailySchedule = () => {
  const [dailyScheduleList, setDailyScheduleList] = useState([
    { 
      date: "",
      description: "",
      trainerAttendance: "PRESENT",
    },
  ]);

  const handleRowChange = (e, index) => {
    const { name, value } = e.target;
    const updatedSchedules = [...dailyScheduleList];
    updatedSchedules[index][name] = value;
    setDailyScheduleList(updatedSchedules);
  };

  const addScheduleRow = () => {
    setDailyScheduleList((prevList) => [
      ...prevList,
      {
        date: "",
        description: "",
        trainerAttendance: "PRESENT",
      },
    ]);
  };

  const removeScheduleRow = (index) => {
    const updatedSchedules = dailyScheduleList.filter((_, i) => i !== index);
    setDailyScheduleList(updatedSchedules);
  };

  const submitScheduleList = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const user = JSON.parse(sessionStorage.getItem("user"));
      const response = await axios.post(
        `${API_BASE_URL}/trainer/addTrainerDailySchedule`,
        {
          token,
          user,
          dailyScheduleList,
        }
      );
      alert(response.data.message || "Schedule added successfully!");
    } catch (error) {
      console.error("Error adding schedule:", error);
      alert("Failed to add schedule.");
    }
  };

  return (
    <Container>
      <h2 className="my-4">Add Daily Schedule</h2>
      <h3>Daily Schedule</h3>
      <Table bordered hover responsive className="mb-4">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Trainer Attendance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dailyScheduleList.map((schedule, index) => (
            <tr key={index}>
             
              <td>
                <Form.Control
                  type="date"
                  name="date"
                  value={schedule.date}
                  onChange={(e) => handleRowChange(e, index)}
                  required
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  name="description"
                  value={schedule.description}
                  onChange={(e) => handleRowChange(e, index)}
                  required
                  placeholder="Enter Description"
                />
              </td>
              <td>
                <Form.Select
                  name="trainerAttendance"
                  value={schedule.trainerAttendance}
                  onChange={(e) => handleRowChange(e, index)}
                >
                  <option value="PRESENT">Present</option>
                  <option value="LEAVE">Leave</option>
                </Form.Select>
              </td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => removeScheduleRow(index)}
                  size="sm"
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Row>
        <Col>
          <Button variant="primary" onClick={addScheduleRow}>
            Add Row
          </Button>
          <Button
            variant="success"
            onClick={submitScheduleList}
            className="ms-2"
          >
            Submit
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default AddDailySchedule;