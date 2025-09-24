import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTasks, FaFolderOpen, FaStickyNote, FaMoon, FaSun, FaSearch, FaSort, FaListUl } from "react-icons/fa";

function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    document.body.style.background = darkMode ? "#181a20" : "#f5f6fa";
    document.body.style.color = darkMode ? "#e4e8ef" : "#23272f";
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <div>
      {/* Theme Switcher */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          className="button"
          onClick={toggleTheme}
          style={{
            background: darkMode ? "#23272f" : "#61dafb",
            color: darkMode ? "#61dafb" : "#23272f",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <h1>Welcome to Task Manager</h1>
      <p>
        <FaTasks /> Manage your <strong>Tasks</strong>, <FaFolderOpen /> <strong>Projects</strong>, and <FaStickyNote /> <strong>Notes</strong> all in one place.
      </p>

      {/* Search & Sort */}
      <div style={{ display: "flex", gap: "16px", margin: "24px 0" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#23272f", borderRadius: 6, padding: "6px 12px" }}>
          <FaSearch style={{ marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search tasks, projects, notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              fontSize: "1rem",
              outline: "none",
              width: "100%",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", background: "#23272f", borderRadius: 6, padding: "6px 12px" }}>
          <FaSort style={{ marginRight: 8 }} />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              fontSize: "1rem",
              outline: "none",
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: "flex", gap: "24px", marginTop: "32px" }}>
        <Link className="button" to="/projects">
          <FaFolderOpen style={{ marginRight: 8 }} />
          Go to Projects
        </Link>
        <Link className="button" to="/tasks">
          <FaTasks style={{ marginRight: 8 }} />
          Go to Tasks
        </Link>
        <Link className="button" to="/notes">
          <FaStickyNote style={{ marginRight: 8 }} />
          Go to Notes
        </Link>
      </div>

      {/* Features Button */}
      <div style={{ marginTop: "32px" }}>
        <button
          className="button"
          onClick={() => setShowFeatures((prev) => !prev)}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <FaListUl />
          {showFeatures ? "Hide Features" : "Show Features"}
        </button>
      </div>

      {/* Features List (toggle) */}
      {showFeatures && (
        <div style={{ marginTop: "24px" }}>
          <h2 style={{ color: "#b2becd" }}>Features:</h2>
          <ul>
            <li> <strong>Theme Switcher:</strong> Toggle between dark and light mode.</li>
            <li> <strong>Search & Filter:</strong> Quickly find tasks, projects, or notes.</li>
            <li> <strong>Sorting:</strong> Sort by date, priority, or name.</li>
            <li> <strong>Task Priorities & Deadlines:</strong> Add priority tags and deadlines.</li>
            <li> <strong>Progress Tracking:</strong> See project completion progress.</li>
            <li> <strong>Notifications:</strong> Get reminders for overdue tasks.</li>
            <li> <strong>Mobile Responsive:</strong> Works smoothly on phones.</li>
            <li> <strong>Export/Import:</strong> Export notes or tasks to PDF/CSV.</li>
            <li> <strong>User Authentication:</strong> Secure login and registration.</li>
            <li> <strong>Drag & Drop:</strong> Rearrange tasks and projects easily.</li>
          </ul>
        </div>
      )}

      {/* Placeholder for future advanced features */}
      <div style={{ marginTop: "32px", color: "#61dafb" }}>
        <em>More features coming soon!</em>
      </div>
    </div>
  );
}

export default Home;
