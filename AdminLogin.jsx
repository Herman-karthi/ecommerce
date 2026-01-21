import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [inputs, setInputs] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const { username, password } = inputs;

  const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { username, password };
      const response = await fetch("http://localhost:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();

      if (response.ok) {
        localStorage.setItem("token", parseRes.token);
        alert("Welcome, Admin!");
        navigate("/admin-dashboard");
      } else {
        alert(parseRes);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const adminStyle = {
    backgroundColor: "#2c3e50",
    color: "white",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  return (
    <div style={adminStyle}>
      <div className="auth-card" style={{ border: "2px solid #e74c3c" }}>
        <h2 style={{ color: "#e74c3c" }}>ADMIN ACCESS</h2>
        
        <form onSubmit={onSubmitForm} autoComplete="off">
          <input
            type="text"
            name="username"
            placeholder="Admin Username"
            className="form-control"
            value={username}
            onChange={onChange}
            autoComplete="off" 
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Admin Password"
            className="form-control"
            value={password}
            onChange={onChange}
            autoComplete="new-password"
            required
          />
          
          <button className="btn-primary" style={{ backgroundColor: "#e74c3c" }}>
            Unlock System
          </button>
        </form>
        
        <div style={{ marginTop: "15px", fontSize: "14px" }}>
            {/* LINK 1: Back to normal user login */}
            <span style={{cursor: "pointer", color: "#ccc", marginRight: "20px"}} onClick={() => navigate("/login")}>
                ← Back to User Login
            </span>

            {/* LINK 2: The Secret Register Link */}
            {/* <span style={{cursor: "pointer", color: "#e74c3c"}} onClick={() => navigate("/admin-register")}>
                Register New Admin
            </span> */}
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;