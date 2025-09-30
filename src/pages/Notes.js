import React, { useState, useEffect } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    console.log("TRACKING: User visited Notes page");
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/api/notes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch notes: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        const safeNotes = Array.isArray(data) ? data : [];
        setNotes(safeNotes);
        // Check for notifications: incomplete notes (assuming no completion, perhaps based on content)
        // For now, just log visit
      })
      .catch(err => console.error(err.message));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const token = localStorage.getItem('token');
      fetch(`${API_BASE}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: input.trim(),
          pinned: false,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Add note failed: ${res.status} - ${text}`);
          }
          return res.json();
        })
        .then((newNote) => {
          setNotes((prev) => [...prev, newNote]);
          setInput("");
        })
        .catch(err => console.error(err.message));
    }
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        setNotes((prev) => prev.filter((note) => note.id !== id));
      })
      .catch(err => console.error(err.message));
  };

  const handlePin = (note) => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/api/notes/${note.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: note.text,
        pinned: !note.pinned,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Pin toggle failed: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((updatedNote) => {
        setNotes((prev) =>
          prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
        );
      })
      .catch(err => console.error(err.message));
  };

  // Sort pinned notes first
  const sortedNotes = [...notes].sort((a, b) => b.pinned - a.pinned);

  return (
    <div>
      <h1>Notes</h1>

      {/* Progress Summary */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Notes: {notes.length} total</span>
          <span>100% complete (all notes available)</span>
        </div>
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#e0e0e0',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#9b59b6',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          <span>📝 Notes are informational and don't have due dates</span>
        </div>
      </div>
      <form onSubmit={handleAdd} style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Add a new note"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <button className="button" type="submit">Add Note</button>
      </form>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {sortedNotes.map((note) => (
          <li
            key={note.id}
            className="card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: note.pinned ? "#353b48" : undefined,
              padding: "8px",
              marginBottom: "8px",
              borderRadius: "4px",
              color: note.pinned ? "white" : "black"
            }}
          >
            <span>{note.text}</span>
            <div>
              <button
                className="button"
                style={{ background: "#f39c12", color: "#fff", marginRight: "8px" }}
                onClick={() => handlePin(note)}
              >
                {note.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                className="button"
                style={{ background: "#e74c3c", color: "#fff" }}
                onClick={() => handleDelete(note.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;
