import React, { useState } from "react";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setNotes([
        ...notes,
        {
          text: input.trim(),
          pinned: false,
        },
      ]);
      setInput("");
    }
  };

  const handleDelete = (idx) => {
    if (window.confirm("Delete this note?")) {
      setNotes(notes.filter((_, i) => i !== idx));
    }
  };

  const handleEdit = (idx) => {
    setEditingIdx(idx);
    setEditValue(notes[idx].text);
  };

  const handleEditSave = (idx) => {
    const updated = [...notes];
    updated[idx].text = editValue;
    setNotes(updated);
    setEditingIdx(null);
    setEditValue("");
  };

  const handlePin = (idx) => {
    const updated = [...notes];
    updated[idx].pinned = !updated[idx].pinned;
    setNotes(updated);
  };

  // Search and pin sort
  const filteredNotes = notes
    .filter(note => note.text.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.pinned - a.pinned);

  return (
    <div>
      <h1>Notes</h1>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Add a new note"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 2 }}
        />
        <button className="button" type="submit" style={{ flex: 1 }}>Add Note</button>
      </form>
      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ margin: "16px 0", width: "100%" }}
      />
      <ul>
        {filteredNotes.map((note, idx) => (
          <li className="card" key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: note.pinned ? "#353b48" : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="button" style={{ background: "#f39c12", color: "#fff", padding: "6px 14px" }} onClick={() => handlePin(idx)}>
                {note.pinned ? "Unpin" : "Pin"}
              </button>
              {editingIdx === idx ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ marginRight: "12px", flex: 1 }}
                />
              ) : (
                <span>{note.text}</span>
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
        ))}
      </ul>
    </div>
  );
}

export default Notes;
