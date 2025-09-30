from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Role constants
ROLE_USER = 'user'
ROLE_MANAGER = 'manager'
ROLE_ADMIN = 'admin'

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'admin', 'manager', 'user'

    def to_dict(self):
        return {"id": self.id, "username": self.username, "role": self.role}

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(50))
    due_date = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='tasks')

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "completed": self.completed,
            "priority": self.priority,
            "dueDate": self.due_date.isoformat() if self.due_date else None,
            "user_id": self.user_id
        }

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50))
    pinned = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='projects')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "pinned": self.pinned,
            "user_id": self.user_id
        }

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    pinned = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='notes')

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "pinned": self.pinned,
            "user_id": self.user_id
        }

class TaskProject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    context = db.Column(db.Text)
    order = db.Column(db.Integer)

    task = db.relationship('Task', backref='task_projects')
    project = db.relationship('Project', backref='task_projects')

    def to_dict(self):
        return {
            "id": self.id,
            "task_id": self.task_id,
            "project_id": self.project_id,
            "context": self.context,
            "order": self.order
        }
