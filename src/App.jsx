import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FolderOpen, CheckCircle2, Circle, Clock } from 'lucide-react';

const TASK_STATUS = {
  PENDING: 'Pending',
  DOING: 'Doing',
  DONE: 'Done'
};

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('todoProjects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
      if (parsedProjects.length > 0) {
        setSelectedProject(parsedProjects[0].id);
      }
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('todoProjects', JSON.stringify(projects));
    }
  }, [projects]);

  const addProject = (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        tasks: []
      };
      setProjects([...projects, newProject]);
      setSelectedProject(newProject.id);
      setNewProjectName('');
      setShowProjectForm(false);
    }
  };

  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    if (selectedProject === projectId) {
      setSelectedProject(updatedProjects.length > 0 ? updatedProjects[0].id : null);
    }
  };

  const addTask = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim() && selectedProject) {
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject) {
          const newTask = {
            id: Date.now().toString(),
            title: newTaskTitle.trim(),
            status: TASK_STATUS.PENDING,
            createdAt: new Date().toISOString()
          };
          return { ...project, tasks: [...project.tasks, newTask] };
        }
        return project;
      });
      setProjects(updatedProjects);
      setNewTaskTitle('');
    }
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject) {
        const updatedTasks = project.tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        return { ...project, tasks: updatedTasks };
      }
      return project;
    });
    setProjects(updatedProjects);
  };

  const deleteTask = (taskId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject) {
        return { ...project, tasks: project.tasks.filter(task => task.id !== taskId) };
      }
      return project;
    });
    setProjects(updatedProjects);
  };

  const getNextStatus = (currentStatus) => {
    if (currentStatus === TASK_STATUS.PENDING) return TASK_STATUS.DOING;
    if (currentStatus === TASK_STATUS.DOING) return TASK_STATUS.DONE;
    return TASK_STATUS.PENDING;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case TASK_STATUS.PENDING:
        return <Circle className="w-5 h-5 text-slate-400" />;
      case TASK_STATUS.DOING:
        return <Clock className="w-5 h-5 text-blue-500" />;
      case TASK_STATUS.DONE:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TASK_STATUS.PENDING:
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case TASK_STATUS.DOING:
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case TASK_STATUS.DONE:
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const currentProject = projects.find(p => p.id === selectedProject);
  const tasksByStatus = currentProject ? {
    pending: currentProject.tasks.filter(t => t.status === TASK_STATUS.PENDING),
    doing: currentProject.tasks.filter(t => t.status === TASK_STATUS.DOING),
    done: currentProject.tasks.filter(t => t.status === TASK_STATUS.DONE)
  } : { pending: [], doing: [], done: [] };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Task Manager</h1>
          <p className="text-slate-600">Organize your tasks by projects</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Projects Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Projects
                </h2>
                <button
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                  title="Add Project"
                >
                  <Plus className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {showProjectForm && (
                <form onSubmit={addProject} className="mb-4">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProjectForm(false);
                        setNewProjectName('');
                      }}
                      className="flex-1 bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-300 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {projects.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No projects yet</p>
                ) : (
                  projects.map(project => (
                    <div
                      key={project.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                        selectedProject === project.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{project.name}</p>
                        <p className="text-xs text-slate-500">{project.tasks.length} tasks</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded-md transition-colors ml-2"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tasks Area */}
          <div className="lg:col-span-3">
            {currentProject ? (
              <>
                {/* Add Task Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-semibold text-slate-800 mb-4">{currentProject.name}</h2>
                  <form onSubmit={addTask} className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add a new task..."
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Task
                    </button>
                  </form>
                </div>

                {/* Tasks by Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pending Column */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Circle className="w-5 h-5 text-slate-400" />
                      <h3 className="text-lg font-semibold text-slate-800">Pending</h3>
                      <span className="ml-auto bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium">
                        {tasksByStatus.pending.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {tasksByStatus.pending.map(task => (
                        <div
                          key={task.id}
                          className={`p-4 rounded-lg border-2 ${getStatusColor(task.status)} transition-all`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="flex-1 text-slate-800 font-medium break-words">{task.title}</p>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 hover:bg-red-100 rounded-md transition-colors flex-shrink-0"
                              title="Delete Task"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                          <button
                            onClick={() => updateTaskStatus(task.id, getNextStatus(task.status))}
                            className="mt-3 w-full bg-white text-slate-700 px-3 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium border border-slate-300 flex items-center justify-center gap-2"
                          >
                            {getStatusIcon(getNextStatus(task.status))}
                            Move to {getNextStatus(task.status)}
                          </button>
                        </div>
                      ))}
                      {tasksByStatus.pending.length === 0 && (
                        <p className="text-slate-400 text-sm text-center py-8">No pending tasks</p>
                      )}
                    </div>
                  </div>

                  {/* Doing Column */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-slate-800">Doing</h3>
                      <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        {tasksByStatus.doing.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {tasksByStatus.doing.map(task => (
                        <div
                          key={task.id}
                          className={`p-4 rounded-lg border-2 ${getStatusColor(task.status)} transition-all`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="flex-1 text-slate-800 font-medium break-words">{task.title}</p>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 hover:bg-red-100 rounded-md transition-colors flex-shrink-0"
                              title="Delete Task"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                          <button
                            onClick={() => updateTaskStatus(task.id, getNextStatus(task.status))}
                            className="mt-3 w-full bg-white text-slate-700 px-3 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium border border-slate-300 flex items-center justify-center gap-2"
                          >
                            {getStatusIcon(getNextStatus(task.status))}
                            Move to {getNextStatus(task.status)}
                          </button>
                        </div>
                      ))}
                      {tasksByStatus.doing.length === 0 && (
                        <p className="text-slate-400 text-sm text-center py-8">No tasks in progress</p>
                      )}
                    </div>
                  </div>

                  {/* Done Column */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-slate-800">Done</h3>
                      <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        {tasksByStatus.done.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {tasksByStatus.done.map(task => (
                        <div
                          key={task.id}
                          className={`p-4 rounded-lg border-2 ${getStatusColor(task.status)} transition-all`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="flex-1 text-slate-800 font-medium break-words line-through decoration-2 opacity-75">
                              {task.title}
                            </p>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 hover:bg-red-100 rounded-md transition-colors flex-shrink-0"
                              title="Delete Task"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                          <button
                            onClick={() => updateTaskStatus(task.id, getNextStatus(task.status))}
                            className="mt-3 w-full bg-white text-slate-700 px-3 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium border border-slate-300 flex items-center justify-center gap-2"
                          >
                            {getStatusIcon(getNextStatus(task.status))}
                            Move to {getNextStatus(task.status)}
                          </button>
                        </div>
                      ))}
                      {tasksByStatus.done.length === 0 && (
                        <p className="text-slate-400 text-sm text-center py-8">No completed tasks</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Project Selected</h3>
                <p className="text-slate-400">Create or select a project to start managing your tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
