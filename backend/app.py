from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import time
from models import db, User, Task, Project, Note
from schemas import (
    user_schema, users_schema,
    task_schema, tasks_schema,
    project_schema, projects_schema,
    note_schema, notes_schema
)

# ---------------- APP CONFIG ----------------
app = Flask(__name__, static_folder='../build', static_url_path='/')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db.init_app(app)

# Create all tables automatically
with app.app_context():
    db.create_all()


# ---------------- AUTH ----------------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    errors = user_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "Username already exists"}), 409

    password_hash = generate_password_hash(data['password'])
    new_user = User(username=data['username'], password=password_hash)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User registered"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Invalid request"}), 400
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password, data['password']):
        token = f"token_{user.id}_{int(time.time())}"
        return jsonify({"token": token, "user": user_schema.dump(user)})
    return jsonify({"msg": "Wrong password"}), 401


def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return None
    try:
        parts = token.split('_')
        if len(parts) >= 2 and parts[0] == 'token':
            user_id = int(parts[1])
            return User.query.get(user_id)
    except:
        pass
    return None


# ---------------- TASKS ----------------
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    tasks = Task.query.filter_by(user_id=user.id).all()
    return jsonify([task.to_dict() for task in tasks])


@app.route("/api/tasks", methods=["POST"])
def add_task():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    data = request.get_json()
    errors = task_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    new_task = Task(
        text=data["text"],
        completed=data.get("completed", False),
        priority=data.get("priority"),
        due_date=data.get("dueDate"),
        user_id=user.id
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    data = request.get_json()
    errors = task_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    task = Task.query.filter_by(id=task_id, user_id=user.id).first_or_404()
    task.text = data["text"]
    task.completed = data["completed"]
    task.priority = data.get("priority")
    task.due_date = data.get("dueDate")
    db.session.commit()
    return jsonify(task.to_dict())


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
    return jsonify([project.to_dict() for project in projects])


@app.route("/api/projects", methods=["POST"])
def add_project():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    data = request.get_json()
    errors = project_schema.validate(data)
    if errors:
        return jsonify(errors), 400
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
    data = request.get_json()
    errors = project_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    project = Project.query.filter_by(id=project_id, user_id=user.id).first_or_404()
    project.name = data["name"]
    project.category = data.get("category")
    project.pinned = data.get("pinned", False)
    db.session.commit()
    return jsonify(project.to_dict())


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
    return jsonify([note.to_dict() for note in notes])


@app.route("/api/notes", methods=["POST"])
def add_note():
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    data = request.get_json()
    errors = note_schema.validate(data)
    if errors:
        return jsonify(errors), 400
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
    data = request.get_json()
    errors = note_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    note = Note.query.filter_by(id=note_id, user_id=user.id).first_or_404()
    note.text = data["text"]
    note.pinned = data.get("pinned", False)
    db.session.commit()
    return jsonify(note.to_dict())


@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    user = get_current_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    note = Note.query.filter_by(id=note_id, user_id=user.id).first_or_404()
    db.session.delete(note)
    db.session.commit()
    return "", 204


# ---------------- FRONTEND ----------------
@app.route('/')
def index():
    return jsonify({"message": "Task Manager API"})

@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file('index.html')


# ---------------- LOCAL DEV ----------------
if __name__ == "__main__":
    app.run(port=8000, debug=True)
