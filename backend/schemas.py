from flask import Blueprint, request, jsonify
from models import Task, db
from schemas import task_schema, tasks_schema

task_bp = Blueprint('tasks', __name__)

@task_bp.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    errors = task_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    
    new_task = Task(
        text=data['text'],
        priority=data.get('priority'),
        due_date=data.get('due_date'),
        user_id=data.get('user_id', 1)  # just example
    )
    db.session.add(new_task)
    db.session.commit()
    return task_schema.jsonify(new_task), 201

@task_bp.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return tasks_schema.jsonify(tasks), 200
