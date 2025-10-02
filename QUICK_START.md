# Quick Start Guide

## 🚀 Get Your ToDo App Running in 5 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment File
The `.env` file should already exist. If not, create it from the example:
```bash
Copy-Item .env.example .env
```

Verify it contains:
```
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=todolist
```

### Step 3: Create MySQL Database
Open MySQL and run:
```sql
CREATE DATABASE IF NOT EXISTS todolist;
USE todolist;
```

Then run the initialization script:
```bash
# Option 1: Direct SQL file
mysql -u root -p todolist < server/init-db.sql

# Option 2: Copy-paste from server/init-db.sql into MySQL client
```

### Step 4: Start the Backend Server
Open a terminal and run:
```bash
npm run server:dev
```

You should see:
```
✅ Database connected successfully
🚀 Server is running on http://localhost:3001
```

### Step 5: Start the Frontend
Open a **second terminal** and run:
```bash
npm run dev
```

Visit **http://localhost:5173** in your browser!

---

## 📁 Project Structure

```
ToDoList/
├── server/                 # Backend (Express + MySQL)
│   ├── index.js           # Main server file
│   ├── db.js              # Database connection
│   ├── init-db.sql        # Database schema
│   └── routes/
│       ├── projects.js    # Project endpoints
│       └── tasks.js       # Task endpoints
│
├── src/                   # Frontend (React)
│   ├── App.jsx           # Main app (now with API integration)
│   ├── api.js            # API service layer
│   └── ...
│
├── .env                  # Environment variables (gitignored)
├── .env.example          # Environment template
└── package.json          # Dependencies & scripts
```

## 🔌 API Endpoints

### Projects
- `GET /api/projects` - Get all projects with tasks
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `POST /api/tasks` - Create task/subtask
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (cascades to subtasks)

### Health Check
- `GET /api/health` - Check if server is running

## 🛠️ Troubleshooting

### "Failed to load projects"
- ✅ Check backend server is running (terminal 1)
- ✅ Verify MySQL is running and database exists
- ✅ Check `.env` credentials are correct

### "Port already in use"
- Change `PORT=3001` in `.env` to another port (e.g., `3002`)
- Update `API_BASE_URL` in `src/api.js` accordingly

### Database connection errors
- Verify MySQL service is running
- Check username/password in `.env`
- Ensure `todolist` database exists

## 💡 Tips

- The app now **saves to MySQL database** instead of localStorage
- If the API is unavailable, it falls back to localStorage
- Run both servers (backend + frontend) for full functionality
- All tasks and subtasks are hierarchical in the database
