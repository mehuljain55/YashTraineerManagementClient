import React, { useState } from "react";
import YashLogo from "../Image/yash.jpg";
import {  Button, Dropdown } from 'react-bootstrap';

import Dashboard from "../Trainer/Dashboard";
import ViewTraining from "../Trainer/ViewTraining";
import ViewTrainerSchedule from "../Trainer/ViewTrainerSchedule";
import "bootstrap/dist/css/bootstrap.min.css";
import AddDailySchedule from "../Trainer/AddDailySchedule";
import ViewTrainingManager from "../Manager/ViewTrainingManager";
import ManagerDashboard from "../Manager/ManagerDashboard";
import UserRequest from "../Manager/UserRequest";
import ViewDailySchedules from "../Manager/ViewDailySchedules";
import UserApprovalList from "../Manager/UserApprovalList";



const Maincomponent = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const user = JSON.parse(sessionStorage.getItem("user")) || {};

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div>
          {user.role === "trainer" ? (
            <Dashboard activeSection={setActiveSection} />
          ) : (
            <ManagerDashboard />
          )}
        </div>
        
        );
        
      case "ViewTraining":
        return (
          <div>
            <ViewTraining />
          </div>
        );

        case "ViewTrainerSchedule":
          return (
            <div>
              <ViewTrainerSchedule />
            </div>
          );

          case "AddDailySchedule":
            return (
              <div>
                <AddDailySchedule />
              </div>
            );  

            case "ViewTrainingManager":
              return (
                <div>
                  <ViewTrainingManager />
                </div>
              );  
           
              case "userRequests":
                return (
                  <div>
                    <UserRequest />
                  </div>
                );  

                case "ViewDailySchedules":
                  return (
                    <div>
                      <ViewDailySchedules />
                    </div>
                  );    

                  case "UserApprovalList":
                    return (
                      <div>
                        <UserApprovalList />
                      </div>
                    );    
  
                  
      default:
        return (
          <div>
            <h3>404</h3>
            <p>Section not found.</p>
          </div>
        );
    }
  };

  return (
    <div className="d-flex vh-100">
      <div
        className={`sidebar d-flex flex-column bg-light ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{
          width: isSidebarOpen ? "250px" : "0",
          transition: "width 0.3s ease",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          className="p-4 text-center"
          style={{
            borderBottom: "1px solid #ddd",
            background: "#BFECFF",
          }}
        >
          <img
            src={YashLogo}
            alt="Company Logo"
            style={{
              height: "80px",
              objectFit: "contain",
              marginBottom: "10px",
            }}
          />
          <h5>Welcome</h5>
        
        </div>
        <div className="menu mt-3">
          {user.role === "trainer" && (
            <>
              <h6 className="px-4 text-secondary">User</h6>
              <ul className="list-unstyled px-3">
                <li>
                  <button
                    className={`btn btn-link text-decoration-none w-100 text-start ${
                      activeSection === "ViewTraining"
                        ? "fw-bold text-primary"
                        : "text-dark"
                    }`}
                    onClick={() => setActiveSection("ViewTraining")}
                  >
                    View Training
                  </button>
                </li>

                <li>
                  <button
                    className={`btn btn-link text-decoration-none w-100 text-start ${
                      activeSection === "ViewTrainerSchedule"
                        ? "fw-bold text-primary"
                        : "text-dark"
                    }`}
                    onClick={() => setActiveSection("ViewTrainerSchedule")}
                  >
                  View Trainer Schedule
                  </button>
                </li>

                <li>
                  <button
                    className={`btn btn-link text-decoration-none w-100 text-start ${
                      activeSection === "AddDailySchedule"
                        ? "fw-bold text-primary"
                        : "text-dark"
                    }`}
                    onClick={() => setActiveSection("AddDailySchedule")}
                  >
                 Add Daily Schedule
                  </button>
                </li>
               
              </ul>
            </>
          )}
          
          {user.role === "manager" && (
            <>
              <h6 className="px-4 text-secondary">User</h6>
              <ul className="list-unstyled px-3">
                <li>
                  <button
                    className={`btn btn-link text-decoration-none w-100 text-start ${
                      activeSection === "ViewTrainingManager"
                        ? "fw-bold text-primary"
                        : "text-dark"
                    }`}
                    onClick={() => setActiveSection("ViewTrainingManager")}
                  >
                    View Training
                  </button>
                </li>
               
                <li>
                  <button
                    className={`btn btn-link text-decoration-none w-100 text-start ${
                      activeSection === "userRequests"
                        ? "fw-bold text-primary"
                        : "text-dark"
                    }`}
                    onClick={() => setActiveSection("userRequests")}
                  >
                   User Requests
                  </button>
                </li>

                 <li>
                  <button
                    className={`btn btn-link text-decoration-none w-100 text-start ${
                      activeSection === "ViewDailySchedules"
                        ? "fw-bold text-primary"
                        : "text-dark"
                    }`}
                    onClick={() => setActiveSection("ViewDailySchedules")}
                  >
                   Trainer Schedule
                  </button>

                </li>

                <li>
                  <button
                    className={`btn btn-link text-decoration-none w-100 text-start ${
                      activeSection === "UserApprovalList"
                        ? "fw-bold text-primary"
                        : "text-dark"
                    }`}
                    onClick={() => setActiveSection("UserApprovalList")}
                  >
                   Account Approval 
                  </button>

                </li>


              </ul>
            </>
          )}

        </div>
      </div>

      <div className="main-content flex-grow-1">
  <nav
    className="navbar navbar-expand-lg navbar-light"
    style={{
      background: "#1f509a",
      color: "white",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    }}
  >
    <div className="container-fluid px-4 d-flex align-items-center">
      <button
        className="btn btn-light me-3"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{ marginRight: "10px" }} 
      >
        ☰
      </button>
      
      <h2 className="me-3" style={{ marginRight: "20px" }}>TMS</h2> 
      
      <Button
        onClick={() => setActiveSection("dashboard")}
        className="navbar-brand text-white fw-bold"
        style={{ fontSize: "18px", marginRight: "20px" }} 
      >
        Dashboard
      </Button>

      <button className="btn btn-outline-light ms-auto" onClick={handleLogout}>
        Logout
      </button>
    </div>
  </nav>
  <div className="container mt-4">{renderSection()}</div>
</div>
    </div>
  );
};

export default Maincomponent;
