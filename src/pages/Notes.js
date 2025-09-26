import React, { useState, useEffect } from "react";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch("https://task-manager-backend-407e.onrender.com/api/notes", {
      headers: {
        'Authorization': token
      }
    })
      .then((res) => res.json())
      .then((data) => setNotes(Array.isArray(data) ? data : []));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const token = localStorage.getItem('token');
      fetch("https://task-manager-backend-407e.onrender.com/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        },
        body: JSON.stringify({
          text: input.trim(),
          pinned: false,
        }),
      })
        .then((res) => res.json())
        .then((newNote) => {
          setNotes([...notes, newNote]);
          setInput("");
        });
    }
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    fetch(`https://task-manager-backend-407e.onrender.com/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': token
      }
    }).then(() => {
      setNotes(notes.filter((note) => note.id !== id));
    });
  };

  const handlePin = (idx) => {
    const note = notes[idx];
    const token = localStorage.getItem('token');
    fetch(`https://task-manager-backend-407e.onrender.com/api/notes/${note.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': token
      },
      body: JSON.stringify({
        ...note,
        pinned: !note.pinned,
      }),
    })
      .then((res) => res.json())
      .then((updatedNote) => {
        const updated = [...notes];
        updated[idx] = updatedNote;
        setNotes(updated);
      });
  };

  // Sort pinned notes first
  const sortedNotes = [...notes].sort((a, b) => b.pinned - a.pinned);

  return (
    <div>
      <h1>Notes</h1>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Add a new note"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="button" type="submit">Add Note</button>
      </form>
      <ul>
        {sortedNotes.map((note, idx) => (
          <li key={note.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: note.pinned ? "#353b48" : undefined }}>
            <span>{note.text}</span>
            <div>
              <button className="button" style={{ background: "#f39c12", color: "#fff", marginRight: "8px" }} onClick={() => handlePin(idx)}>
                {note.pinned ? "Unpin" : "Pin"}
              </button>
              <button className="button" style={{ background: "#e74c3c", color: "#fff" }} onClick={() => handleDelete(note.id)}>
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
