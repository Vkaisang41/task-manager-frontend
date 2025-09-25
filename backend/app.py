from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import time
import os

app = Flask(__name__, static_folder='../build', static_url_path='/')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key')
CORS(app)


# ---------------- DATABASE ----------------
def get_db():
    conn = sqlite3.connect("tasks.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = sqlite3.connect("tasks.db")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            completed INTEGER NOT NULL,
            priority TEXT,
            dueDate TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            pinned INTEGER DEFAULT 0
        )
    """)
    # Migration: add pinned column if missing
    try:
        conn.execute("ALTER TABLE projects ADD COLUMN pinned INTEGER DEFAULT 0;")
    except sqlite3.OperationalError:
        pass  # Column already exists

    conn.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            pinned INTEGER NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


# Initialize database
init_db()


# ---------------- AUTH ----------------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username=?", (data['username'],)).fetchone()
    if user:
        conn.close()
        return jsonify({"msg": "Username already exists"}), 409

    password_hash = generate_password_hash(data['password'])
    conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", (data['username'], password_hash))
    conn.commit()
    conn.close()
    return jsonify({"msg": "User registered"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Invalid request"}), 400
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username=?", (data['username'],)).fetchone()
    conn.close()
    if user and check_password_hash(user['password'], data['password']):
        token = f"token_{user['id']}_{int(time.time())}"
        return jsonify({"token": token, "user": {"id": user['id'], "username": user['username']}})
    return jsonify({"msg": "Wrong password"}), 401


def decode_token(token):
    try:
        parts = token.split('_')
        if len(parts) >= 2 and parts[0] == 'token':
            return int(parts[1])
        return None
    except Exception:
        return None


# ---------------- TASKS ----------------
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    conn = get_db()
    tasks = conn.execute("SELECT * FROM tasks").fetchall()
    conn.close()
    return jsonify([dict(row) for row in tasks])


@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO tasks (text, completed, priority, dueDate) VALUES (?, ?, ?, ?)",
        (data["text"], int(data["completed"]), data["priority"], data["dueDate"])
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({"id": new_id, **data}), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        "UPDATE tasks SET text=?, completed=?, priority=?, dueDate=? WHERE id=?",
        (data["text"], int(data["completed"]), data["priority"], data["dueDate"], task_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"id": task_id, **data})


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = get_db()
    conn.execute("DELETE FROM tasks WHERE id=?", (task_id,))
    conn.commit()
    conn.close()
    return "", 204


# ---------------- PROJECTS ----------------
@app.route("/api/projects", methods=["GET"])
def get_projects():
    conn = get_db()
    projects = conn.execute("SELECT * FROM projects").fetchall()
    conn.close()
    return jsonify([dict(row) for row in projects])


@app.route("/api/projects", methods=["POST"])
def add_project():
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO projects (name, category, pinned) VALUES (?, ?, ?)",
        (data["name"], data["category"], int(data.get("pinned", False)))
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({"id": new_id, **data}), 201


@app.route("/api/projects/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        "UPDATE projects SET name=?, category=?, pinned=? WHERE id=?",
        (data["name"], data["category"], int(data.get("pinned", False)), project_id)
    )
    conn.commit()
    updated = conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated))


@app.route("/api/projects/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    conn = get_db()
    conn.execute("DELETE FROM projects WHERE id=?", (project_id,))
    conn.commit()
    conn.close()
    return "", 204


# ---------------- NOTES ----------------
@app.route("/api/notes", methods=["GET"])
def get_notes():
    conn = get_db()
    notes = conn.execute("SELECT * FROM notes").fetchall()
    conn.close()
    return jsonify([dict(row) for row in notes])


@app.route("/api/notes", methods=["POST"])
def add_note():
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO notes (text, pinned) VALUES (?, ?)",
        (data["text"], int(data.get("pinned", False)))
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return jsonify({"id": new_id, **data}), 201


@app.route("/api/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        "UPDATE notes SET text=?, pinned=? WHERE id=?",
        (data["text"], int(data.get("pinned", False)), note_id)
    )
    conn.commit()
    updated = conn.execute("SELECT * FROM notes WHERE id=?", (note_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated))


@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    conn = get_db()
    conn.execute("DELETE FROM notes WHERE id=?", (note_id,))
    conn.commit()
    conn.close()
    return "", 204


# ---------------- FRONTEND ----------------
@app.route('/')
def serve_index():
    return app.send_static_file('index.html')


@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file('index.html')


# ---------------- LOCAL DEV ----------------
if __name__ == "__main__":
    app.run(port=8000, debug=True)
