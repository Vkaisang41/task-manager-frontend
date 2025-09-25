import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles/App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const PrivateLayout = ({ children }) => (
    <div className="App">
      <Navbar onLogout={handleLogout} />
      <div className="container">
        {children}
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/" element={<PrivateRoute isLoggedIn={isLoggedIn}><PrivateLayout><Home /></PrivateLayout></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute isLoggedIn={isLoggedIn}><PrivateLayout><Projects /></PrivateLayout></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute isLoggedIn={isLoggedIn}><PrivateLayout><Tasks /></PrivateLayout></PrivateRoute>} />
        <Route path="/notes" element={<PrivateRoute isLoggedIn={isLoggedIn}><PrivateLayout><Notes /></PrivateLayout></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
