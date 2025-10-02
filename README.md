# Task Manager - Project-Based To-Do List with MySQL

A modern, full-stack task management application with hierarchical subtasks, project organization, and MySQL database persistence.

## Features

- **Project Management**: Create and organize multiple projects
- **Hierarchical Tasks**: Unlimited nested subtasks for detailed task breakdown
- **Task Organization**: Group tasks under specific projects
- **Status Workflow**: Track task progress through three states:
  - **Pending**: Newly created tasks (default state)
  - **Doing**: Tasks currently in progress
  - **Done**: Completed tasks
- **MySQL Database**: Persistent storage with relational database
- **REST API**: Express.js backend with RESTful endpoints
- **Modern UI**: Clean, responsive design with TailwindCSS
- **Fallback Support**: Works with localStorage if database is unavailable

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- MySQL Server (v5.7 or higher)

### Quick Setup

**See [QUICK_START.md](QUICK_START.md) for detailed instructions**

1. **Install dependencies**:
```bash
npm install
```

2. **Setup environment** (copy and configure):
```bash
Copy-Item .env.example .env
```

3. **Create MySQL database**:
```sql
CREATE DATABASE todolist;
```

4. **Initialize database schema**:
```bash
mysql -u root -p todolist < server/init-db.sql
```

5. **Start the backend server** (Terminal 1):
```bash
npm run server:dev
```

6. **Start the frontend** (Terminal 2):
```bash
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## How to Use

1. **Create a Project**: Click the "+" button in the Projects sidebar and enter a project name
2. **Select a Project**: Click on any project to view its tasks
3. **Add Tasks**: Type in the task input field and click "Add Task" (tasks start in "Pending" status)
4. **Add Subtasks**: Click the "+" icon on any task to add a subtask (unlimited nesting)
5. **Expand/Collapse**: Click the chevron icon to expand/collapse subtasks
6. **Change Status**: Click the status icon on any task to cycle through:
   - Pending (circle) → Doing (clock) → Done (check) → Pending
7. **Delete Items**: Click the trash icon to delete projects or tasks (cascades to subtasks)

## Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

### Backend
- **Express.js**: REST API server
- **MySQL2**: MySQL database driver with promise support
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Database
- **MySQL**: Relational database with hierarchical task structure
- Foreign key constraints for data integrity
- Cascade deletes for cleanup

## Project Structure

```
ToDoList/
├── server/                    # Backend (Express + MySQL)
│   ├── index.js              # Main server file
│   ├── db.js                 # Database connection pool
│   ├── init-db.sql           # Database schema & initialization
│   └── routes/
│       ├── projects.js       # Project CRUD endpoints
│       └── tasks.js          # Task CRUD endpoints
├── src/                      # Frontend (React)
│   ├── App.jsx              # Main app component with API integration
│   ├── api.js               # API service layer
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── package.json             # Dependencies and scripts
├── QUICK_START.md           # Quick setup guide
├── DATABASE_SETUP.md        # Detailed database setup
└── vite.config.js           # Vite configuration
```

## API Endpoints

- `GET /api/projects` - Get all projects with tasks
- `POST /api/projects` - Create a new project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/tasks` - Create a task or subtask
- `PUT /api/tasks/:id` - Update task status or title
- `DELETE /api/tasks/:id` - Delete a task (cascades to subtasks)
- `GET /api/health` - Health check endpoint

## License

MIT
