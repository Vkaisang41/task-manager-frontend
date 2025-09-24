import React from "react";
import { Link } from "react-router-dom";
import "../styles/App.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Task Manager</h2>
      <div>
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/projects">Projects</Link>
        <Link className="nav-link" to="/tasks">Tasks</Link>
        <Link className="nav-link" to="/notes">Notes</Link>
      </div>
    </nav>
  );
}

export default Navbar;