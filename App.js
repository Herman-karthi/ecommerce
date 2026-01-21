import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// --- Components ---
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import AdminLogin from "./AdminLogin.jsx"; // <--- NEW IMPORT
import AdminRegister from "./AdminRegister";
import PublicHome from "./PublicHome.jsx";
import AdminDashboard from "./AdminDashboard";
import UserHome from "./UserHome";

// --- Styles ---
import "./Auth.css";
// import "./Home.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in when the app loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(false);
  };

  // Logout function specifically for Admin (clears token and goes to user login)
  const adminLogout = () => {
    localStorage.removeItem("token"); // In a real app, you might have a separate admin token key
    window.location.href = "/login";
  };

  return (
    <Router>
      <div className="container">
        <Routes>
          {/* --- USER ROUTES --- */}

          {/* Login Route (Now contains the hidden door logic inside Login.jsx) */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to="/dashboard" />}
          />

          {/* Register Route */}
          <Route
            path="/register"
            element={!isAuthenticated ? <Register setAuth={setAuth} /> : <Navigate to="/dashboard" />}
          />

          {/* User Dashboard Route (Protected) */}
          {/* <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <div className="dashboard-container">
                  <h1>Welcome to the E-Commerce Dashboard</h1>
                  <p>You are securely logged in.</p>
                  <button onClick={logout} className="btn-logout">Logout</button>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          /> */}

          {/* --- ADMIN ROUTES (NEW) --- */}

          {/* OLD CODE:
  <Route path="/admin-dashboard" element={ <div style=...> ... </div> } /> 
*/}

          {/* NEW CODE: */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Temporary Route for creating the first admin */}
          <Route path="/admin-register" element={<AdminRegister />} />

          {/* 1. Admin Login Page (The Dark Mode Page) */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* 2. Admin Dashboard (Simple inline page for now) */}
          <Route path="/admin-dashboard" element={
            <div style={{ padding: "50px", textAlign: "center", backgroundColor: "#fff", height: "100vh" }}>
              <h1 style={{ color: "red", borderBottom: "2px solid red", display: "inline-block" }}>
                TOP SECRET ADMIN PANEL
              </h1>
              <p style={{ fontSize: "18px", marginTop: "20px" }}>
                Manage Users, Products, and Orders here.
              </p>
              <div style={{ marginTop: "40px", padding: "20px", background: "#f8d7da", color: "#721c24", borderRadius: "5px" }}>
                <strong>System Status:</strong> All Systems Operational
              </div>
              <button
                onClick={adminLogout}
                style={{ marginTop: "30px", padding: "10px 20px", background: "#333", color: "white", border: "none", cursor: "pointer" }}
              >
                Logout Admin
              </button>
            </div>
          } />
          {/* //<Route path="/" element={<PublicHome />} /> */}
          {/* Redirect random URLs to PublicHome */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                // Pass setAuth so they can logout
                <UserHome setAuth={setAuth} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<PublicHome />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;