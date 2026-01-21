import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 1. Import useNavigate

const Login = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });

  const { email, password } = inputs;
  const navigate = useNavigate(); // 2. Initialize the hook

  const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { email, password };
      
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();

      if (response.ok) {
        localStorage.setItem("token", parseRes.token);
        setAuth(true);
      } else {
        alert(parseRes);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // 3. The Secret Function
  const handleBackgroundClick = () => {
    navigate("/admin-login");
  };

  return (
    // 4. Add onClick to the background
    <div 
      className="auth-container" 
      onClick={handleBackgroundClick} 
      title="flip into another world"
    >
      {/* 5. Stop the click from reaching the background when clicking the card */}
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <h2>Login</h2>
        <form onSubmit={onSubmitForm} autoComplete="off">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="form-control"
            value={email}
            autoComplete="off"
            onChange={onChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="form-control"
            value={password}
            autoComplete="new-password"
            onChange={onChange}
            required
          />
          <button className="btn-primary">Login</button>
        </form>
        <p className="switch-text">
          New here? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;