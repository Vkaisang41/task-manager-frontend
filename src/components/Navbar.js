import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/App.css";

function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">Task Manager</h2>
      <div>
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/projects">Projects</Link>
        <Link className="nav-link" to="/tasks">Tasks</Link>
        <Link className="nav-link" to="/notes">Notes</Link>
        <button className="nav-link" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;