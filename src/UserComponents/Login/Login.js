import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../Config/Config";
import "bootstrap/dist/css/bootstrap.min.css";
import YashLogo from "../Image/yash.jpg"; 
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons for eye and eye-slash

const Login = ({ setLoginStatus }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    sessionStorage.clear();

    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ userId, password }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Response Result:", result);

      if (result.status === "success") {
        sessionStorage.setItem("token", result.payload.token);
        sessionStorage.setItem("user", JSON.stringify(result.payload.user));
        setLoginStatus(true); // Notify App.js of successful login
        navigate("/dashboard", { replace: true }); // Redirect to dashboard
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const handleRegister = () => {
    navigate("/register", { replace: true }); // Redirect to dashboard
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
        <h2 className="text-center text-dark">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">User ID</label>
            <input
              type="text"
              className="form-control"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"} 
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)} 
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
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
            Login
          </button>
        </form>
        <button
          onClick={handleRegister}
          className="btn w-100 mt-3"
          style={{
            backgroundColor: "#FFDDAD",
            color: "#333",
            fontWeight: "bold",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          Register
        </button>
        {error && <p className="text-danger text-center mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
