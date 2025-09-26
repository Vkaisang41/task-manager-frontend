from flask_marshmallow import Marshmallow
from models import User, Task, Project, Note, Tag

ma = Marshmallow()

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ('password',)

class TagSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Tag
        load_instance = True

class TaskSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Task
        load_instance = True
    user = ma.Nested(UserSchema, exclude=('tasks', 'projects', 'notes'))
    tags = ma.Nested(TagSchema, many=True, only=('id', 'name'))

class ProjectSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Project
        load_instance = True
    user = ma.Nested(UserSchema, exclude=('tasks', 'projects', 'notes'))

class NoteSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Note
        load_instance = True
    user = ma.Nested(UserSchema, exclude=('tasks', 'projects', 'notes'))

# Instances
user_schema = UserSchema()
users_schema = UserSchema(many=True)

task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)

project_schema = ProjectSchema()
projects_schema = ProjectSchema(many=True)

note_schema = NoteSchema()
notes_schema = NoteSchema(many=True)

tag_schema = TagSchema()
tags_schema = TagSchema(many=True)