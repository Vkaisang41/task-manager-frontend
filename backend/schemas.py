from marshmallow import Schema, fields

user_schema = Schema.from_dict({
    "username": fields.Str(required=True),
    "password": fields.Str(required=True),
    "role": fields.Str()
})()

task_schema = Schema.from_dict({
    "text": fields.Str(required=True),
    "completed": fields.Bool(),
    "priority": fields.Str(),
    "dueDate": fields.DateTime()
})()

project_schema = Schema.from_dict({
    "name": fields.Str(required=True),
    "category": fields.Str(),
    "pinned": fields.Bool()
})()

note_schema = Schema.from_dict({
    "text": fields.Str(required=True),
    "pinned": fields.Bool()
})()
