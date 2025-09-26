from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin

db = SQLAlchemy()

# Association table for many-to-many between Task and Project
task_project = db.Table(
    "task_project",
    db.Column("task_id", db.Integer, db.ForeignKey("tasks.id"), primary_key=True),
    db.Column("project_id", db.Integer, db.ForeignKey("projects.id"), primary_key=True)
)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    tasks = db.relationship('Task', backref='user', lazy=True, cascade="all, delete-orphan")
    projects = db.relationship('Project', backref='user', lazy=True, cascade="all, delete-orphan")
    notes = db.relationship('Note', backref='user', lazy=True, cascade="all, delete-orphan")

    serialize_rules = ('-password', '-tasks.user', '-projects.user', '-notes.user')


class Task(db.Model, SerializerMixin):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(20))
    due_date = db.Column(db.String(20))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # many-to-many
    projects = db.relationship(
        "Project",
        secondary=task_project,
        back_populates="tasks",
        lazy="dynamic"
    )

    serialize_rules = ('-user', '-projects.tasks')


class Project(db.Model, SerializerMixin):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    pinned = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # many-to-many
    tasks = db.relationship(
        "Task",
        secondary=task_project,
        back_populates="projects",
        lazy="dynamic"
    )

    serialize_rules = ('-user', '-tasks.projects')


class Note(db.Model, SerializerMixin):
    __tablename__ = 'notes'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    pinned = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    serialize_rules = ('-user',)
