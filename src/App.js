import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Notification from "./components/Notification";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles/App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [globalNotifications, setGlobalNotifications] = useState([]);

  // ✅ keep login state in sync with localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    setIsLoggedIn(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Check for incomplete items when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const API_BASE = process.env.REACT_APP_API_BASE_URL || "";
      const token = localStorage.getItem("token");

      // Fetch tasks
      fetch(`${API_BASE}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const tasks = data;
            const incompleteTasks = tasks.filter(task => !task.completed);
            const overdueTasks = tasks.filter(task => task.due_date && new Date(task.due_date) < new Date() && !task.completed);

          const notifications = [];

          if (incompleteTasks.length > 0) {
            notifications.push({
              id: 'incomplete-tasks',
              message: `You have ${incompleteTasks.length} incomplete task${incompleteTasks.length > 1 ? 's' : ''}`,
              type: 'warning'
            });
          }

          if (overdueTasks.length > 0) {
            notifications.push({
              id: 'overdue-tasks',
              message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}!`,
              type: 'error'
            });
          }

          setGlobalNotifications(notifications);
         }
       })
       .catch((err) => console.error("Error fetching tasks for notifications:", err));
    } else {
      setGlobalNotifications([]);
    }
  }, [isLoggedIn]);

  const handleLogin = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  // ✅ layout wrapper with Navbar
  const PrivateLayout = ({ children }) => (
    <div className="App">
      <Navbar onLogout={handleLogout} user={user} />
      <div className="container">{children}</div>
    </div>
  );

  return (
    <Router>
      {/* Global Notifications */}
      {globalNotifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => setGlobalNotifications(globalNotifications.filter(n => n.id !== notification.id))}
        />
      ))}
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <PrivateLayout>
                <Home />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <PrivateLayout>
                <Projects />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <PrivateLayout>
                <Tasks />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <PrivateLayout>
                <Notes />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
