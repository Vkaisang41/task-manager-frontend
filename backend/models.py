from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin

db = SQLAlchemy()

# association model (many-to-many with user-submittable attributes)
class TaskProject(db.Model, SerializerMixin):
    __tablename__ = "task_projects"

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)

    # rubric-required user-submitted attribute(s)
    context = db.Column(db.String(200), nullable=True)   # user can add a note when linking
    order = db.Column(db.Integer, nullable=True)         # optional ordering/prioritization

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships
    task = db.relationship("Task", back_populates="task_projects")
    project = db.relationship("Project", back_populates="task_projects")

    def to_dict(self):
        return {
            "id": self.id,
            "task_id": self.task_id,
            "project_id": self.project_id,
            "context": self.context,
            "order": self.order,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    tasks = db.relationship("Task", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    projects = db.relationship("Project", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    notes = db.relationship("Note", backref="user", lazy="dynamic", cascade="all, delete-orphan")

    serialize_rules = ("-password", "-tasks.user", "-projects.user", "-notes.user")

    def to_dict(self):
        return {"id": self.id, "username": self.username}


class Task(db.Model, SerializerMixin):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    priority = db.Column(db.String(20), nullable=True)
    due_date = db.Column(db.String(50), nullable=True)  # keep as string (ISO) for simplicity
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # association relationship
    task_projects = db.relationship("TaskProject", back_populates="task", cascade="all, delete-orphan", lazy="dynamic")
    # convenience view-only tasks->projects list
    projects = db.relationship("Project", secondary="task_projects", back_populates="tasks", viewonly=True)

    serialize_rules = ("-user", "-task_projects.task")

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "completed": self.completed,
            "priority": self.priority,
            "dueDate": self.due_date,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "task_projects": [tp.to_dict() for tp in self.task_projects]
        }


class Project(db.Model, SerializerMixin):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    pinned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    task_projects = db.relationship("TaskProject", back_populates="project", cascade="all, delete-orphan", lazy="dynamic")
    tasks = db.relationship("Task", secondary="task_projects", back_populates="projects", viewonly=True)

    serialize_rules = ("-user", "-task_projects.project")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "pinned": self.pinned,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "task_projects": [tp.to_dict() for tp in self.task_projects]
        }


class Note(db.Model, SerializerMixin):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    pinned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    serialize_rules = ("-user",)

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "pinned": self.pinned,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
