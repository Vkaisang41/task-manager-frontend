import React, { useState } from "react";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Work");
  const [filter, setFilter] = useState("all");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setProjects([
        ...projects,
        {
          name: input.trim(),
          category,
          tasks: [],
        },
      ]);
      setInput("");
      setCategory("Work");
    }
  };

  const handleDelete = (idx) => {
    if (window.confirm("Delete this project?")) {
      setProjects(projects.filter((_, i) => i !== idx));
    }
  };

  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setEditValue(projects[idx].name);
  };

  const handleEditSave = (idx) => {
    const updated = [...projects];
    updated[idx].name = editValue;
    setProjects(updated);
    setEditingIdx(null);
    setEditValue("");
  };

  // Filtering
  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.category === filter;
  });

  return (
    <div>
      <h1>Projects</h1>
      <form
        onSubmit={handleAdd}
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
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
        {filteredProjects.map((project, idx) => {
          // Example progress: random for demo
          const totalTasks = project.tasks.length || 5;
          const completedTasks = Math.floor(Math.random() * (totalTasks + 1));
          const progress = Math.round((completedTasks / totalTasks) * 100);

          return (
            <li className="card" key={idx} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {editingIdx === idx ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{ marginRight: "12px", flex: 1 }}
                  />
                ) : (
                  <span style={{ fontWeight: "bold" }}>{project.name}</span>
                )}
                <span
                  style={{
                    marginLeft: 12,
                    color: "#61dafb",
                    textTransform: "capitalize",
                  }}
                >
                  {project.category}
                </span>
                <div>
                  {editingIdx === idx ? (
                    <>
                      <button
                        className="button"
                        style={{
                          background: "#27ae60",
                          color: "#fff",
                          marginRight: "8px",
                          padding: "6px 14px",
                        }}
                        onClick={() => handleEditSave(idx)}
                      >
                        Save
                      </button>
                      <button
                        className="button"
                        style={{
                          background: "#7f8c8d",
                          color: "#fff",
                          padding: "6px 14px",
                        }}
                        onClick={() => setEditingIdx(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="button"
                        style={{
                          background: "#2980b9",
                          color: "#fff",
                          marginRight: "8px",
                          padding: "6px 14px",
                        }}
                        onClick={() => handleEdit(idx)}
                      >
                        Edit
                      </button>
                      <button
                        className="button"
                        style={{
                          background: "#e74c3c",
                          color: "#fff",
                          padding: "6px 14px",
                        }}
                        onClick={() => handleDelete(idx)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* Progress Bar */}
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    background: "#353b48",
                    borderRadius: 6,
                    height: 12,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      background: "#61dafb",
                      width: `${progress}%`,
                      height: "100%",
                      borderRadius: 6,
                      transition: "width 0.5s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "#b2becd",
                    display: "block",
                    marginTop: 4,
                  }}
                >
                  {completedTasks} of {totalTasks} tasks done ({progress}%)
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Projects;
