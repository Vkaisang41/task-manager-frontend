from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from config import Config
from routes import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    app.register_blueprint(api, url_prefix='/api')

    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            "message": "Task Manager API",
            "endpoints": {
                "ping": "GET /api/ping",
                "users": "GET/POST /api/users, GET/PUT/DELETE /api/users/<id>",
                "projects": "GET/POST /api/projects, GET/PUT/DELETE /api/projects/<id>",
                "tasks": "GET/POST /api/tasks, GET/PUT/DELETE /api/tasks/<id>",
                "notes": "GET/POST /api/notes, GET/PUT/DELETE /api/notes/<id>"
            }
        })

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=8001)
