# Task Manager - Project-Based To-Do List

A modern, intuitive task management application that allows you to organize your tasks by projects with status tracking.

## Features

- **Project Management**: Create and organize multiple projects
- **Task Organization**: Group tasks under specific projects
- **Status Workflow**: Track task progress through three states:
  - **Pending**: Newly created tasks (default state)
  - **Doing**: Tasks currently in progress
  - **Done**: Completed tasks
- **Kanban-Style Board**: Visual columns for each status
- **Local Storage**: Your data persists between sessions
- **Modern UI**: Clean, responsive design with TailwindCSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## How to Use

1. **Create a Project**: Click the "+" button in the Projects sidebar and enter a project name
2. **Select a Project**: Click on any project to view its tasks
3. **Add Tasks**: Type in the task input field and click "Add Task" (tasks start in "Pending" status)
4. **Change Status**: Click the status button on any task to move it through the workflow:
   - Pending → Doing → Done → Pending (cycles through)
5. **Delete Items**: Click the trash icon to delete projects or tasks

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **LocalStorage**: Client-side data persistence

## Project Structure

```
ToDoList/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## License

MIT
