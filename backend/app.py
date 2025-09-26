from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import time
from models import db, User, Task, Project, Note, Tag

app = Flask(__name__, static_folder='../build', static_url_path='/')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db.init_app(app)


# ---------------- DATABASE ----------------
# Database initialized with SQLAlchemy
with app.app_context():
    db.create_all()


# ---------------- AUTH ----------------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
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
        return jsonify({"token": token, "user": {"id": user.id, "username": user.username}})
    return jsonify({"msg": "Wrong password"}), 401




# ---------------- TASKS ----------------
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])


@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json()
    new_task = Task(
        text=data["text"],
        completed=bool(data.get("completed", False)),
        priority=data.get("priority"),
        due_date=data.get("dueDate")
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    task = Task.query.get_or_404(task_id)
    task.text = data["text"]
    task.completed = bool(data["completed"])
    task.priority = data.get("priority")
    task.due_date = data.get("dueDate")
    db.session.commit()
    return jsonify(task.to_dict())


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return "", 204


# ---------------- PROJECTS ----------------
@app.route("/api/projects", methods=["GET"])
def get_projects():
    projects = Project.query.all()
    return jsonify([project.to_dict() for project in projects])


@app.route("/api/projects", methods=["POST"])
def add_project():
    data = request.get_json()
    new_project = Project(
        name=data["name"],
        category=data.get("category"),
        pinned=bool(data.get("pinned", False))
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify(new_project.to_dict()), 201


@app.route("/api/projects/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    data = request.get_json()
    project = Project.query.get_or_404(project_id)
    project.name = data["name"]
    project.category = data.get("category")
    project.pinned = bool(data.get("pinned", False))
    db.session.commit()
    return jsonify(project.to_dict())


@app.route("/api/projects/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return "", 204


# ---------------- NOTES ----------------
@app.route("/api/notes", methods=["GET"])
def get_notes():
    notes = Note.query.all()
    return jsonify([note.to_dict() for note in notes])


@app.route("/api/notes", methods=["POST"])
def add_note():
    data = request.get_json()
    new_note = Note(
        text=data["text"],
        pinned=bool(data.get("pinned", False))
    )
    db.session.add(new_note)
    db.session.commit()
    return jsonify(new_note.to_dict()), 201


@app.route("/api/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    data = request.get_json()
    note = Note.query.get_or_404(note_id)
    note.text = data["text"]
    note.pinned = bool(data.get("pinned", False))
    db.session.commit()
    return jsonify(note.to_dict())


@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    db.session.delete(note)
    db.session.commit()
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
