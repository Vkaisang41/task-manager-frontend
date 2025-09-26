import React, { useState, useEffect } from "react";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Fetch tasks from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch("https://task-manager-backend-407e.onrender.com/api/tasks", {
      headers: {
        'Authorization': token
      }
    })
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const token = localStorage.getItem('token');
      fetch("https://task-manager-backend-407e.onrender.com/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        },
        body: JSON.stringify({
          text: input.trim(),
          completed: false,
          priority,
          dueDate,
        }),
      })
        .then(res => res.json())
        .then(newTask => {
          setTasks([...tasks, newTask]);
          setInput("");
          setPriority("Low");
          setDueDate("");
        });
    }
  };

  const handleDelete = (idx) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const token = localStorage.getItem('token');
      fetch(`https://task-manager-backend-407e.onrender.com/api/tasks/${tasks[idx].id}`, {
        method: "DELETE",
        headers: {
          'Authorization': token
        }
      })
        .then(() => {
          setTasks(tasks.filter((_, i) => i !== idx));
        });
    }
  };

  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setEditValue(tasks[idx].text);
  };

  const handleEditSave = (idx) => {
    const updated = [...tasks];
    updated[idx].text = editValue;
    const token = localStorage.getItem('token');
    fetch(`https://task-manager-backend-407e.onrender.com/api/tasks/${tasks[idx].id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': token
      },
      body: JSON.stringify(updated[idx]),
    })
      .then(res => res.json())
      .then(() => {
        setTasks(updated);
        setEditingIdx(null);
        setEditValue("");
      });
  };

  const handleToggleComplete = (idx) => {
    const updated = [...tasks];
    updated[idx].completed = !updated[idx].completed;
    const token = localStorage.getItem('token');
    fetch(`https://task-manager-backend-407e.onrender.com/api/tasks/${tasks[idx].id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': token
      },
      body: JSON.stringify(updated[idx]),
    })
      .then(res => res.json())
      .then(() => {
        setTasks(updated);
      });
  };

  // Filtering
  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === "priority") {
      const order = { High: 3, Medium: 2, Low: 1 };
      return order[b.priority] - order[a.priority];
    }
    if (sort === "date") {
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    }
    return a.text.localeCompare(b.text);
  });

  return (
    <div>
      <h1>Tasks</h1>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Add a new task"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 2 }}
        />
        <select value={priority} onChange={e => setPriority(e.target.value)} style={{ flex: 1 }}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="button" type="submit" style={{ flex: 1 }}>Add Task</button>
      </form>

      <div style={{ margin: "16px 0", display: "flex", gap: 12 }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="date">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <ul>
        {sortedTasks.map((task, idx) => {
          const overdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
          return (
            <li
              className="card"
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: task.completed ? 0.6 : 1,
                textDecoration: task.completed ? "line-through" : "none",
                borderLeft: `6px solid ${
                  task.priority === "High"
                    ? "#e74c3c"
                    : task.priority === "Medium"
                    ? "#f39c12"
                    : "#27ae60"
                }`,
                background: overdue ? "#2c2c2c" : undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(idx)}
                  style={{ accentColor: "#61dafb" }}
                />
                {editingIdx === idx ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    style={{ marginRight: "12px", flex: 1 }}
                  />
                ) : (
                  <span>{task.text}</span>
                )}
                <span
                  style={{
                    fontWeight: "bold",
                    color:
                      task.priority === "High"
                        ? "#e74c3c"
                        : task.priority === "Medium"
                        ? "#f39c12"
                        : "#27ae60",
                    marginLeft: 8,
                  }}
                >
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span style={{ marginLeft: 8, color: overdue ? "#e74c3c" : "#b2becd" }}>
                    Due: {task.dueDate}
                  </span>
                )}
              </div>
              <div>
                {editingIdx === idx ? (
                  <>
                    <button className="button" style={{ background: "#27ae60", color: "#fff", marginRight: "8px", padding: "6px 14px" }} onClick={() => handleEditSave(idx)}>
                      Save
                    </button>
                    <button className="button" style={{ background: "#7f8c8d", color: "#fff", padding: "6px 14px" }} onClick={() => setEditingIdx(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="button" style={{ background: "#2980b9", color: "#fff", marginRight: "8px", padding: "6px 14px" }} onClick={() => handleEdit(idx)}>
                      Edit
                    </button>
                    <button className="button" style={{ background: "#e74c3c", color: "#fff", padding: "6px 14px" }} onClick={() => handleDelete(idx)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Tasks;
