// src/components/Projects.js
import React, { useState, useEffect } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Work");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editCategory, setEditCategory] = useState("Work");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found, please log in.");
      return;
    }

    fetch(`${API_BASE}/api/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch projects: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        const safeProjects = (Array.isArray(data) ? data : []).filter((p) => p?.id);
        setProjects(safeProjects);
      })
      .catch((err) => console.error(err.message));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const token = localStorage.getItem("token");
      fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: input.trim(),
          category,
          pinned: false,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Add project failed: ${res.status} - ${text}`);
          }
          return res.json();
        })
        .then((newProject) => {
          if (newProject?.id) {
            setProjects([...projects, newProject]);
            setInput("");
            setCategory("Work");
          }
        })
        .catch((err) => console.error(err.message));
    }
  };

  const handleDelete = (id) => {
    if (!id) return;
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/projects/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        setProjects(projects.filter((project) => project.id !== id));
      })
      .catch((err) => console.error(err.message));
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setEditValue(project.name || "");
    setEditCategory(project.category || "Work");
  };

  const handleEditSave = (project) => {
    if (!project?.id || !editValue.trim()) {
      alert("Invalid project or empty name");
      return;
    }

    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editValue.trim(),
        category: editCategory,
        pinned: project.pinned || false,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Update failed: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((updatedProject) => {
        setProjects(projects.map((p) => (p.id === project.id ? updatedProject : p)));
        setEditingId(null);
        setEditValue("");
      })
      .catch((err) => console.error(err.message));
  };

  const handlePin = (project) => {
    if (!project?.id) return;
    const token = localStorage.getItem("token");

    fetch(`${API_BASE}/api/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: project.name,
        category: project.category,
        pinned: !project.pinned,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Pin toggle failed: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((updatedProject) => {
        setProjects(projects.map((p) => (p.id === project.id ? updatedProject : p)));
      })
      .catch((err) => console.error(err.message));
  };

  const filteredProjects = projects
    .filter((project) => filter === "all" || project.category === filter)
    .sort((a, b) => {
      if (a.pinned === b.pinned) return 0;
      return a.pinned ? -1 : 1;
    });

  return (
    <div>
      <h1>Projects</h1>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Add a new project"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 2 }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="Work">Work</option>
          <option value="School">School</option>
          <option value="Personal">Personal</option>
        </select>
        <button className="button" type="submit" style={{ flex: 1 }}>
          Add Project
        </button>
      </form>

      <div style={{ margin: "16px 0" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="Work">Work</option>
          <option value="School">School</option>
          <option value="Personal">Personal</option>
        </select>
      </div>

      <ul>
        {filteredProjects.map((project) => (
          <li
            key={project.id}
            className="card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: project.pinned ? "#353b48" : undefined,
              padding: "8px",
              marginBottom: "8px",
              borderRadius: "4px",
              color: project.pinned ? "white" : "black",
            }}
          >
            {editingId === project.id ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ flex: 2 }}
                />
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="Work">Work</option>
                  <option value="School">School</option>
                  <option value="Personal">Personal</option>
                </select>
                <button
                  className="button"
                  style={{ background: "#27ae60", color: "#fff", marginRight: "8px" }}
                  onClick={() => handleEditSave(project)}
                >
                  Save
                </button>
                <button
                  className="button"
                  style={{ background: "#7f8c8d", color: "#fff" }}
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span style={{ flex: 1 }}>
                  {project.name} ({project.category})
                </span>
                <div>
                  <button
                    className="button"
                    style={{ background: "#f39c12", color: "#fff", marginRight: "8px" }}
                    onClick={() => handlePin(project)}
                  >
                    {project.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    className="button"
                    style={{ background: "#2980b9", color: "#fff", marginRight: "8px" }}
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </button>
                  <button
                    className="button"
                    style={{ background: "#e74c3c", color: "#fff" }}
                    onClick={() => handleDelete(project.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Projects;
