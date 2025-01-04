import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./UserComponents/Login/Login.js";
import Register from "./UserComponents/Login/Register.js";
import API_BASE_URL from "./UserComponents/Config/Config.js";
import Dashboard from "./UserComponents/Dashboard/Maincomponent.js";

const App = () => {
  const [loginStatus, setLoginStatus] = useState(false); // Tracks login success
  const navigate = useNavigate(); 

  useEffect(() => {
    const validateToken = async () => {
      const token = sessionStorage.getItem("token");
      const user = JSON.parse(sessionStorage.getItem("user"));

      if (token && user) {
        try {
          console.log("Validating token...");
          const response = await fetch(`${API_BASE_URL}/user/validate_token?userId=${user.emailId}&token=${token}`);
          const result = await response.json();

          if (result.status === "unauthorized") {
            sessionStorage.clear();
            alert("Unauthorized access");
            setLoginStatus(false); // Logout on invalid token
          }
        } catch (error) {
          console.error("Error validating token:", error);
          sessionStorage.clear();
       
          setLoginStatus(false); // Logout on error
        }
      }
    };

    if (loginStatus) {
      const interval = setInterval(validateToken, 6000); // Poll every 6 seconds
      return () => clearInterval(interval); // Cleanup on unmount or loginStatus change
    }
  }, [loginStatus]);

  return (
    <Routes>
      <Route path="/login" element={<Login setLoginStatus={setLoginStatus} />} />
      <Route path="/register" element={<Register  />} />
      <Route
        path="/dashboard"
        element={loginStatus ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/"
        element={loginStatus ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
