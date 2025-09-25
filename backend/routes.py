from flask import Blueprint, jsonify, request
from models import db, User, Project, Task, Note

# Create a Blueprint
api = Blueprint("api", __name__)

# Root route
@api.route("/", methods=["GET"])
def welcome():
    return jsonify({
        "message": "Task Manager API",
        "endpoints": {
            "ping": "GET /api/ping",
            "users": "GET/POST /api/users, GET/PUT/DELETE /api/users/<id>",
            "projects": "GET/POST /api/projects, GET/PUT/DELETE /api/projects/<id>",
            "tasks": "GET/POST /api/tasks, GET/PUT/DELETE /api/tasks/<id>",
            "notes": "GET/POST /api/notes, GET/PUT/DELETE /api/notes/<id>"
        }
    })

# Test route
@api.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong!"})

# User routes
@api.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([{"id": u.id, "username": u.username} for u in users])

@api.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    username = data.get("username")
    if not username:
        return jsonify({"error": "Username required"}), 400
    user = User(username=username)
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "username": user.username}), 201

@api.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({"id": user.id, "username": user.username})

@api.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    username = data.get("username")
    if username:
        user.username = username
    db.session.commit()
    return jsonify({"id": user.id, "username": user.username})

@api.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})

# Project routes
@api.route("/projects", methods=["GET"])
def get_projects():
    projects = Project.query.all()
    return jsonify([{"id": p.id, "name": p.name, "user_id": p.user_id} for p in projects])

@api.route("/projects", methods=["POST"])
def create_project():
    data = request.get_json()
    name = data.get("name")
    user_id = data.get("user_id")
    if not name or not user_id:
        return jsonify({"error": "Name and user_id required"}), 400
    project = Project(name=name, user_id=user_id)
    db.session.add(project)
    db.session.commit()
    return jsonify({"id": project.id, "name": project.name, "user_id": project.user_id}), 201

@api.route("/projects/<int:project_id>", methods=["GET"])
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify({"id": project.id, "name": project.name, "user_id": project.user_id})

@api.route("/projects/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    name = data.get("name")
    if name:
        project.name = name
    db.session.commit()
    return jsonify({"id": project.id, "name": project.name, "user_id": project.user_id})

@api.route("/projects/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "Project deleted"})

# Task routes
@api.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([{"id": t.id, "title": t.title, "description": t.description, "due_date": t.due_date, "project_id": t.project_id} for t in tasks])

@api.route("/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    title = data.get("title")
    project_id = data.get("project_id")
    description = data.get("description")
    due_date = data.get("due_date")
    if not title or not project_id:
        return jsonify({"error": "Title and project_id required"}), 400
    task = Task(title=title, description=description, due_date=due_date, project_id=project_id)
    db.session.add(task)
    db.session.commit()
    return jsonify({"id": task.id, "title": task.title, "description": task.description, "due_date": task.due_date, "project_id": task.project_id}), 201

@api.route("/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify({"id": task.id, "title": task.title, "description": task.description, "due_date": task.due_date, "project_id": task.project_id})

@api.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    due_date = data.get("due_date")
    if title:
        task.title = title
    if description is not None:
        task.description = description
    if due_date is not None:
        task.due_date = due_date
    db.session.commit()
    return jsonify({"id": task.id, "title": task.title, "description": task.description, "due_date": task.due_date, "project_id": task.project_id})

@api.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"})

# Note routes
@api.route("/notes", methods=["GET"])
def get_notes():
    notes = Note.query.all()
    return jsonify([{"id": n.id, "content": n.content, "task_id": n.task_id} for n in notes])

@api.route("/notes", methods=["POST"])
def create_note():
    data = request.get_json()
    content = data.get("content")
    task_id = data.get("task_id")
    if not content or not task_id:
        return jsonify({"error": "Content and task_id required"}), 400
    note = Note(content=content, task_id=task_id)
    db.session.add(note)
    db.session.commit()
    return jsonify({"id": note.id, "content": note.content, "task_id": note.task_id}), 201

@api.route("/notes/<int:note_id>", methods=["GET"])
def get_note(note_id):
    note = Note.query.get_or_404(note_id)
    return jsonify({"id": note.id, "content": note.content, "task_id": note.task_id})

@api.route("/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    note = Note.query.get_or_404(note_id)
    data = request.get_json()
    content = data.get("content")
    if content:
        note.content = content
    db.session.commit()
    return jsonify({"id": note.id, "content": note.content, "task_id": note.task_id})

@api.route("/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "Note deleted"})
