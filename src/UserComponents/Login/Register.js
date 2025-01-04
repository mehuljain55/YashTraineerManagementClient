
﻿import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../Config/Config";
import "bootstrap/dist/css/bootstrap.min.css";
import YashLogo from "../Image/yash.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const Register = () => {
  const [formData, setFormData] = useState({
    emailId: "",
    name: "",
    mobileNo: "",
    password: "",
    officeId: "",
  });
  const [officeList, setOfficeList] = useState([]); 
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    mobileNo: "",
    password: "",
    emailId: "",
  });
  const navigate = useNavigate();


  useEffect(() => {
    const fetchOfficeList = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/office/activeOfficeList`);
        if (response.data.status === "success") {
          setOfficeList(response.data.payload);
          setFormData((prevData) => ({
            ...prevData,
            officeId: response.data.payload[0], 
          }));
        } else {
          setError("Failed to load office list.");
        }
      } catch (err) {
        console.error("Error fetching office list:", err);
        setError("An error occurred while fetching office locations.");
      }
    };


    fetchOfficeList();
  }, []);


  const validateField = (name, value) => {
    switch (name) {
      case "mobileNo":
        if (!/^\d{10}$/.test(value)) {
          return "Mobile number must be 10 digits.";
        }
        return "";
      case "password":
        if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
            value
          )
        ) {
          return "Password must be at least 8 characters with a mix of uppercase, lowercase, and a special character.";
        }
        return "";
      case "emailId":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address.";
        }
        if (!value.endsWith("@yash.com")) {
          return "Email must belong to the yash.com.";
        }
        return "";
      default:
        return "";
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const errorMessage = validateField(name, value);
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));


    setFormData({ ...formData, [name]: value });
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);


    const errors = Object.values(validationErrors).filter((msg) => msg !== "");
    if (errors.length > 0) {
      setError("Please correct the highlighted fields.");
      return;
    }


    try {
      const response = await axios.post(`${API_BASE_URL}/user/register`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });


      if (response.data.status === "success") {
        setSuccessMessage("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      } else {
        setError(response.data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError("An error occurred. Please try again.");
    }
  };


  return (
    <div
      style={{ backgroundColor: "#C6E7FF", height: "100vh" }}
      className="d-flex justify-content-center align-items-center"
    >
      <div
        className="rounded p-4"
        style={{
          backgroundColor: "#FBFBFB",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          width: "400px",
        }}
      >
        <div className="text-center mb-4">
          <img src={YashLogo} alt="Company Logo" style={{ height: "80px" }} />
        </div>
        <h2 className="text-center text-dark">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Email ID</label>
            <input
              type="email"
              className="form-control"
              name="emailId"
              value={formData.emailId}
              onChange={handleInputChange}
              required
            />
            {validationErrors.emailId && (
              <small className="text-danger">{validationErrors.emailId}</small>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mobile no</label>
            <input
              type="text"
              className="form-control"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleInputChange}
              required
            />
            {validationErrors.mobileNo && (
              <small className="text-danger">{validationErrors.mobileNo}</small>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"} // Toggle input type
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)} // Toggle visibility
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Eye icon */}
              </button>
            </div>
            {validationErrors.password && (
              <small className="text-danger">{validationErrors.password}</small>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Office Location</label>
            <select
              className="form-select"
              name="officeId"
              value={formData.officeId}
              onChange={handleInputChange}
              required
            >
              {officeList.map((office, index) => (
                <option key={index} value={office}>
                  {office}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="btn w-100"
            style={{
              backgroundColor: "#FFDDAD",
              color: "#333",
              fontWeight: "bold",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            Register
          </button>
        </form>
        {successMessage && (
          <p className="text-success text-center mt-3">{successMessage}</p>
        )}
        {error && <p className="text-danger text-center mt-3">{error}</p>}
        <div className="text-center mt-3">
          <button
            className="btn btn-link"
            onClick={() => navigate("/login")}
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
};


export default Register;
