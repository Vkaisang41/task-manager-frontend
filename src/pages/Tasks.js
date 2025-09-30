import React, { useState, useEffect } from "react";
import Notification from "../components/Notification";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editPriority, setEditPriority] = useState("Low");
  const [editDueDate, setEditDueDate] = useState("");
  const [notifications, setNotifications] = useState([]);

  // Utility to format dates nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch tasks on mount
  useEffect(() => {
    console.log("TRACKING: User visited Tasks page");
    const token = localStorage.getItem("token");
    console.log("DEBUG: Fetching tasks from", `${API_BASE}/api/tasks`, "with token:", token);
    fetch(`${API_BASE}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        console.log("DEBUG: Tasks fetch response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("DEBUG: Tasks data received:", data);
        const processedTasks = data.map((task) => ({
          ...task,
          dueDate: task.due_date,
          completed: Boolean(task.completed),
        }));
        setTasks(processedTasks);
        // Check for notifications: overdue tasks
        const overdueTasks = processedTasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date() && !task.completed);
        if (overdueTasks.length > 0) {
          console.log("NOTIFICATION: You have", overdueTasks.length, "overdue tasks");
          const newNotifications = overdueTasks.map(task => ({
            id: `overdue-${task.id}`,
            message: `Task "${task.text}" is overdue!`,
            type: 'error'
          }));
          setNotifications(newNotifications);
        } else {
          setNotifications([]);
        }
      })
      .catch((e) => {
        console.error("DEBUG: Error fetching tasks:", e);
        alert("Failed to load tasks");
      });
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const token = localStorage.getItem("token");
    const payload = {
      text: input.trim(),
      completed: false,
      priority,
    };
    if (dueDate) {
      payload.dueDate = dueDate + 'T00:00:00';
    }
    console.log("TRACKING: Task created -", payload.text, "by user at", new Date().toISOString());
    fetch(`${API_BASE}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        console.log("DEBUG: Add task response status:", res.status);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(`Add task failed: ${res.status} - ${JSON.stringify(data)}`);
        }
        return data;
      })
      .then((newTask) => {
        console.log("DEBUG: New task added:", newTask);
        setTasks([
          ...tasks,
          {
            ...newTask,
            dueDate: newTask.due_date,
            completed: Boolean(newTask.completed),
          },
        ]);
        setInput("");
        setPriority("Low");
        setDueDate("");
      })
      .catch((e) => {
        console.error("DEBUG: Error adding task:", e);
        alert("Failed to add task");
      });
  };

  const handleDelete = (task) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    console.log("AUDIT: Task deleted -", task.text, "by user at", new Date().toISOString());
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/tasks/${task.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => setTasks(tasks.filter((t) => t.id !== task.id)))
      .catch(() => alert("Failed to delete task"));
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setEditValue(task.text);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : "");
  };

  const handleEditSave = (task) => {
    if (!editValue.trim()) {
      alert("Task text cannot be empty");
      return;
    }

    const updatedTask = {
      ...task,
      text: editValue.trim(),
      priority: editPriority,
      dueDate: editDueDate ? editDueDate + 'T00:00:00' : null,
    };

    console.log("TRACKING: Task updated -", updatedTask.text, "by user at", new Date().toISOString());
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: updatedTask.text,
        completed: updatedTask.completed,
        priority: updatedTask.priority,
        ...(updatedTask.dueDate && { dueDate: updatedTask.dueDate }),
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
        setEditingId(null);
        setEditValue("");
        setEditPriority("Low");
        setEditDueDate("");
      })
      .catch(() => alert("Failed to update task"));
  };

  const handleToggleComplete = (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    console.log("TRACKING: Task", updatedTask.completed ? "completed" : "marked incomplete -", updatedTask.text, "by user at", new Date().toISOString());

    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: updatedTask.text,
        completed: updatedTask.completed,
        priority: updatedTask.priority,
        ...(updatedTask.dueDate && { dueDate: updatedTask.dueDate }),
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      })
      .catch(() => alert("Failed to update task"));
  };

  // Filtering
  const filteredTasks = tasks.filter((task) => {
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
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotifications(notifications.filter(n => n.id !== notification.id))}
        />
      ))}
      <h1>Tasks</h1>

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Progress: {tasks.filter(task => task.completed).length} / {tasks.length} completed</span>
          <span>{tasks.length > 0 ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) : 0}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#e0e0e0',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${tasks.length > 0 ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) : 0}%`,
            height: '100%',
            backgroundColor: '#27ae60',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          {tasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date() && !task.completed).length > 0 && (
            <span style={{ color: '#e74c3c' }}>
              ⚠️ {tasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date() && !task.completed).length} overdue tasks
            </span>
          )}
          {tasks.filter(task => task.dueDate && new Date(task.dueDate) > new Date() && !task.completed).length > 0 && (
            <span style={{ color: '#f39c12', marginLeft: '16px' }}>
              📅 {tasks.filter(task => task.dueDate && new Date(task.dueDate) > new Date() && !task.completed).length} upcoming due dates
            </span>
          )}
        </div>
      </div>

      <form
        onSubmit={handleAdd}
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <input
          type="text"
          placeholder="Add a new task"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 2 }}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="button" type="submit" style={{ flex: 1 }}>
          Add Task
        </button>
      </form>

      <div style={{ margin: "16px 0", display: "flex", gap: 12 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <ul>
        {sortedTasks.map((task) => {
          const overdue =
            task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
          return (
            <li
              className="card"
              key={task.id}
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
                  onChange={() => handleToggleComplete(task)}
                  style={{ accentColor: "#61dafb" }}
                  aria-label={`Mark task "${task.text}" as completed`}
                />
                {editingId === task.id ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{ marginRight: "12px", flex: 1 }}
                      aria-label="Edit task text"
                    />
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      style={{ marginRight: "12px" }}
                      aria-label="Edit task priority"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      aria-label="Edit task due date"
                    />
                  </>
                ) : (
                  <>
                    <span>{task.text}</span>
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
                      <span
                        style={{
                          marginLeft: 8,
                          color: overdue ? "#e74c3c" : "#b2becd",
                        }}
                      >
                        Due: {formatDate(task.dueDate)}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div>
                {editingId === task.id ? (
                  <>
                    <button
                      className="button"
                      style={{
                        background: "#27ae60",
                        color: "#fff",
                        marginRight: "8px",
                        padding: "6px 14px",
                      }}
                      onClick={() => handleEditSave(task)}
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
                      onClick={() => setEditingId(null)}
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
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </button>
                    <button
                      className="button"
                      style={{ background: "#e74c3c", color: "#fff", padding: "6px 14px" }}
                      onClick={() => handleDelete(task)}
                    >
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
