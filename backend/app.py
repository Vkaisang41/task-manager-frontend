import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from marshmallow import ValidationError

from models import db, User, Task, Project, Note, TaskProject
from schemas import user_schema, task_schema, project_schema, note_schema

# ---------------- APP CONFIG ----------------
app = Flask(__name__, static_folder="../build", static_url_path="/")
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev_secret_key")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///tasks.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()


# ---------------- AUTH ----------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    errors = user_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"msg": "Username already exists"}), 409

    password_hash = generate_password_hash(data["password"])
    new_user = User(username=data["username"], password=password_hash)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User registered"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    print(f"DEBUG: Login attempt for username: {data.get('username')}")
    if not data.get("username") or not data.get("password"):
        print("DEBUG: Invalid login request - missing fields")
        return jsonify({"msg": "Invalid request"}), 400
    user = User.query.filter_by(username=data["username"]).first()
    if user and check_password_hash(user.password, data["password"]):
        token = f"token_{user.id}_{int(time.time())}"
        print(f"DEBUG: Login successful for user {user.username}, token: {token}")
        return jsonify({"token": token, "user": user.to_dict()}), 200
    print("DEBUG: Login failed - wrong credentials")
    return jsonify({"msg": "Wrong credentials"}), 401


def get_current_user():
    token = request.headers.get("Authorization")
    if not token:
        print("DEBUG: No Authorization header")
        return None
    # Strip "Bearer " prefix if present
    if token.startswith("Bearer "):
        token = token[7:]
    print(f"DEBUG: Token received: {token}")
    try:
        parts = token.split("_")
        if len(parts) >= 2 and parts[0] == "token":
            user_id = int(parts[1])
            user = User.query.get(user_id)
            print(f"DEBUG: User found: {user.username if user else None}")
            return user
        else:
            print("DEBUG: Token format invalid")
    except Exception as e:
        print(f"DEBUG: Exception parsing token: {e}")
    return None


# ---------------- TASKS ----------------
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    user = get_current_user()
    if not user:
        print("DEBUG: Unauthorized access to tasks")
        return jsonify({"msg": "Unauthorized"}), 401
    print(f"DEBUG: Getting tasks for user {user.username}, count: {len(Task.query.filter_by(user_id=user.id).all())}")
    tasks = Task.query.filter_by(user_id=user.id).all()
    return jsonify([t.to_dict() for t in tasks]), 200


@app.route("/api/tasks", methods=["POST"])
def add_task():
    user = get_current_user()
    if not user:
        print("DEBUG: Unauthorized add task")
        return jsonify({"msg": "Unauthorized"}), 401
    data = request.get_json() or {}
    print(f"DEBUG: Add task data: {data}")
    try:
        deserialized = task_schema.load(data)
    except ValidationError as err:
        print(f"DEBUG: Validation errors: {err.messages}")
        return jsonify({"errors": err.messages}), 400
    new_task = Task(
        text=deserialized["text"],
        completed=deserialized.get("completed", False),
        priority=deserialized.get("priority"),
        due_date=deserialized.get("dueDate"),
        user_id=user.id
    )
    db.session.add(new_task)
    db.session.commit()
    print(f"DEBUG: Task added for user {user.username}: {new_task.text}")
    return jsonify(new_task.to_dict()), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    task = Task.query.filter_by(id=task_id, user_id=user.id).first_or_404()
    data = request.get_json() or {}
    try:
        deserialized = task_schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    # Update fields - only if provided, else keep current
    task.text = deserialized.get("text", task.text)
    task.completed = deserialized.get("completed", task.completed)
    task.priority = deserialized.get("priority", task.priority)
    task.due_date = deserialized.get("dueDate", task.due_date)
    db.session.commit()
    return jsonify(task.to_dict()), 200


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    task = Task.query.filter_by(id=task_id, user_id=user.id).first_or_404()
    db.session.delete(task)
    db.session.commit()
    return "", 204


# ---------------- PROJECTS ----------------
@app.route("/api/projects", methods=["GET"])
def get_projects():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    projects = Project.query.filter_by(user_id=user.id).all()
    return jsonify([p.to_dict() for p in projects]), 200


@app.route("/api/projects", methods=["POST"])
def add_project():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    data = request.get_json() or {}
    errors = project_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400
    new_project = Project(
        name=data["name"],
        category=data.get("category"),
        pinned=data.get("pinned", False),
        user_id=user.id
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify(new_project.to_dict()), 201


@app.route("/api/projects/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    project = Project.query.filter_by(id=project_id, user_id=user.id).first_or_404()
    data = request.get_json() or {}
    errors = project_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    # Update only provided fields
    project.name = data.get("name", project.name)
    project.category = data.get("category", project.category)
    project.pinned = data.get("pinned", project.pinned)
    db.session.commit()
    return jsonify(project.to_dict()), 200


@app.route("/api/projects/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    project = Project.query.filter_by(id=project_id, user_id=user.id).first_or_404()
    db.session.delete(project)
    db.session.commit()
    return "", 204


# ---------------- NOTES ----------------
@app.route("/api/notes", methods=["GET"])
def get_notes():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    notes = Note.query.filter_by(user_id=user.id).all()
    return jsonify([n.to_dict() for n in notes]), 200


@app.route("/api/notes", methods=["POST"])
def add_note():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    data = request.get_json() or {}
    errors = note_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400
    new_note = Note(
        text=data["text"],
        pinned=data.get("pinned", False),
        user_id=user.id
    )
    db.session.add(new_note)
    db.session.commit()
    return jsonify(new_note.to_dict()), 201


@app.route("/api/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    note = Note.query.filter_by(id=note_id, user_id=user.id).first_or_404()
    data = request.get_json() or {}
    errors = note_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    note.text = data.get("text", note.text)
    note.pinned = data.get("pinned", note.pinned)
    db.session.commit()
    return jsonify(note.to_dict()), 200


@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    note = Note.query.filter_by(id=note_id, user_id=user.id).first_or_404()
    db.session.delete(note)
    db.session.commit()
    return "", 204


# ---------------- TASK-PROJECT ASSOCIATIONS ----------------
@app.route("/api/task-projects", methods=["POST"])
def add_task_project():
    user = get_current_user()
    if not user:
        return jsonify({"msg":"Unauthorized"}), 401
    data = request.get_json() or {}
    task = Task.query.filter_by(id=data.get("task_id"), user_id=user.id).first()
    project = Project.query.filter_by(id=data.get("project_id"), user_id=user.id).first()
    if not task or not project:
        return jsonify({"msg":"Task or Project not found"}), 404
    tp = TaskProject(task_id=task.id, project_id=project.id, context=data.get("context"), order=data.get("order"))
    db.session.add(tp)
    db.session.commit()
    return jsonify(tp.to_dict()), 201

@app.route("/api/task-projects/<int:tp_id>", methods=["PATCH"])
def update_task_project(tp_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg":"Unauthorized"}), 401
    tp = TaskProject.query.get_or_404(tp_id)
    if tp.task.user_id != user.id or tp.project.user_id != user.id:
        return jsonify({"msg":"Unauthorized"}), 401
    data = request.get_json() or {}
    if "context" in data:
        tp.context = data["context"]
    if "order" in data:
        tp.order = data["order"]
    db.session.commit()
    return jsonify(tp.to_dict()), 200

@app.route("/api/task-projects/<int:tp_id>", methods=["DELETE"])
def delete_task_project(tp_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg":"Unauthorized"}), 401
    tp = TaskProject.query.get_or_404(tp_id)
    if tp.task.user_id != user.id or tp.project.user_id != user.id:
        return jsonify({"msg":"Unauthorized"}), 401
    db.session.delete(tp)
    db.session.commit()
    return "", 204


# ---------------- FRONTEND STATIC ----------------
@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/<path:path>")
def catch_all(path):
    return app.send_static_file("index.html")


# ---------------- LOCAL DEV ----------------
if __name__ == "__main__":
    app.run(port=8001, debug=True)
