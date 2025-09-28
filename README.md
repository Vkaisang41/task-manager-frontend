# Task Manager

A full-stack task management application built with React for the frontend and Flask for the backend. Users can register, log in, and manage their tasks, projects, and notes with a clean, intuitive interface.

## Live Demo

- **Frontend**: [https://task-manager-frontend-hz18.onrender.com](https://task-manager-frontend-hz18.onrender.com)
- **Backend API**: [https://task-manager-backend-407e.onrender.com](https://task-manager-backend-407e.onrender.com)

## Features

- **User Authentication**: Secure registration and login with JWT-like token-based authentication
- **Task Management**: Create, read, update, and delete tasks with priorities and due dates
- **Project Organization**: Organize tasks into projects with categories and pinning
- **Notes**: Quick notes with pinning functionality
- **Task-Project Associations**: Link tasks to multiple projects with context and ordering
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Immediate UI updates after CRUD operations

## Tech Stack

### Frontend
- **React** 19.1.1 - UI library
- **React Router DOM** 7.9.1 - Client-side routing
- **Formik** 2.4.6 - Form handling
- **Yup** 1.4.0 - Form validation
- **React Icons** 5.5.0 - Icon library
- **React Testing Library** - Testing utilities

### Backend
- **Flask** 3.0.3 - Web framework
- **SQLAlchemy** 3.1.1 - ORM
- **Marshmallow** 3.21.3 - Serialization/validation
- **Flask-CORS** 5.0.0 - Cross-origin resource sharing
- **Werkzeug** 3.0.6 - WSGI utility
- **Gunicorn** 23.0.0 - WSGI server

### Database
- **SQLite** (default) - Lightweight database
- Configurable via `DATABASE_URL` environment variable

## Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set environment variables (optional):
   ```bash
   export SECRET_KEY=your_secret_key
   export DATABASE_URL=sqlite:///tasks.db  # or your preferred database
   ```

5. Run the backend server:
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:8001`

### Frontend Setup

1. Navigate to the root directory (if not already there)

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## Usage

1. **Register**: Create a new account at `/register`
2. **Login**: Authenticate at `/login`
3. **Dashboard**: View overview on the home page
4. **Tasks**: Manage tasks at `/tasks`
5. **Projects**: Organize projects at `/projects`
6. **Notes**: Take notes at `/notes`

### API Endpoints

#### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

#### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/<id>` - Update a task
- `DELETE /api/tasks/<id>` - Delete a task

#### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create a new project
- `PUT /api/projects/<id>` - Update a project
- `DELETE /api/projects/<id>` - Delete a project

#### Notes
- `GET /api/notes` - Get all user notes
- `POST /api/notes` - Create a new note
- `PUT /api/notes/<id>` - Update a note
- `DELETE /api/notes/<id>` - Delete a note

#### Task-Project Associations
- `POST /api/task-projects` - Associate task with project
- `PATCH /api/task-projects/<id>` - Update association
- `DELETE /api/task-projects/<id>` - Remove association

## Testing

### Frontend Tests
```bash
npm test
```

### Backend Tests
```bash
cd backend
python -m pytest  # If pytest is configured
```

## Deployment

The application is deployed on Render:

- **Frontend**: Hosted as a static site
- **Backend**: Hosted as a web service

To deploy locally or to other platforms:

### Build Frontend for Production
```bash
npm run build
```

### Deploy Backend
Ensure `gunicorn` is used for production:
```bash
gunicorn --bind 0.0.0.0:$PORT app:app
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## Authors

- **Vincent Kaisang** - Frontend Development
- **Job Kariuki** - Backend Development

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.


Built with using React and Flask
