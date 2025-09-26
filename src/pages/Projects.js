import React, { useState, useEffect } from "react";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Work");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editCategory, setEditCategory] = useState("Work");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('https://task-manager-backend-407e.onrender.com/api/projects', {
      headers: {
        'Authorization': token
      }
    })
      .then((res) => res.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const token = localStorage.getItem('token');
      fetch('https://task-manager-backend-407e.onrender.com/api/projects', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        },
        body: JSON.stringify({
          name: input.trim(),
          category,
          pinned: false,
        }),
      })
        .then((res) => res.json())
        .then((newProject) => {
          setProjects([...projects, newProject]);
          setInput("");
          setCategory("Work");
        });
    }
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    fetch(`https://task-manager-backend-407e.onrender.com/api/projects/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': token
      }
    }).then(() => {
      setProjects(projects.filter((project) => project.id !== id));
    });
  };

  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setEditValue(projects[idx].name);
    setEditCategory(projects[idx].category);
  };

  const handleEditSave = (idx) => {
    if (!editValue.trim()) {
      alert("Project name cannot be empty");
      return;
    }
    const project = projects[idx];
    const token = localStorage.getItem('token');
    fetch(`https://task-manager-backend-407e.onrender.com/api/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': token
      },
      body: JSON.stringify({
        name: editValue.trim(),
        category: editCategory,
        pinned: project.pinned || false,
      }),
    })
      .then((res) => res.json())
      .then((updatedProject) => {
        const updated = [...projects];
        updated[idx] = updatedProject;
        setProjects(updated);
        setEditingIdx(null);
        setEditValue("");
      });
  };

  const handlePin = (idx) => {
    const project = projects[idx];
    const token = localStorage.getItem('token');
    fetch(`https://task-manager-backend-407e.onrender.com/api/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': token
      },
      body: JSON.stringify({
        ...project,
        pinned: !project.pinned,
      }),
    })
      .then((res) => res.json())
      .then((updatedProject) => {
        const updated = [...projects];
        updated[idx] = updatedProject;
        setProjects(updated);
      });
  };

  // Filter and sort: pinned projects first, then by filter
  const filteredProjects = projects
    .filter((project) => filter === "all" || project.category === filter)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

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
        {filteredProjects.map((project, idx) => (
          <li key={project.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: project.pinned ? "#353b48" : undefined }}>
            {editingIdx === idx ? (
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
                <button className="button" style={{ background: "#27ae60", color: "#fff", marginRight: "8px" }} onClick={() => handleEditSave(idx)}>
                  Save
                </button>
                <button className="button" style={{ background: "#7f8c8d", color: "#fff" }} onClick={() => setEditingIdx(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span style={{ flex: 1 }}>
                  {project.name} ({project.category})
                </span>
                <div>
                  <button className="button" style={{ background: "#f39c12", color: "#fff", marginRight: "8px" }} onClick={() => handlePin(idx)}>
                    {project.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button className="button" style={{ background: "#2980b9", color: "#fff", marginRight: "8px" }} onClick={() => handleEdit(idx)}>
                    Edit
                  </button>
                  <button className="button" style={{ background: "#e74c3c", color: "#fff" }} onClick={() => handleDelete(project.id)}>
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
