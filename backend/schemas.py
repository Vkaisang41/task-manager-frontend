from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=1, max=80))
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))

class TaskSchema(Schema):
    id = fields.Int(dump_only=True)
    text = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    completed = fields.Bool()
    priority = fields.Str(validate=validate.OneOf(['Low', 'Medium', 'High']))
    due_date = fields.Str()
    user_id = fields.Int(dump_only=True)

class ProjectSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    category = fields.Str(validate=validate.OneOf(['Work', 'School', 'Personal']))
    pinned = fields.Bool()
    user_id = fields.Int(dump_only=True)

class NoteSchema(Schema):
    id = fields.Int(dump_only=True)
    text = fields.Str(required=True)
    pinned = fields.Bool()
    user_id = fields.Int(dump_only=True)

# Instances
user_schema = UserSchema()
users_schema = UserSchema(many=True)

task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)

project_schema = ProjectSchema()
projects_schema = ProjectSchema(many=True)

note_schema = NoteSchema()
notes_schema = NoteSchema(many=True)
