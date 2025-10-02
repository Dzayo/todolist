import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FolderOpen, CheckCircle2, Circle, Clock, ChevronRight, ChevronDown } from 'lucide-react';

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
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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
            createdAt: new Date().toISOString(),
            subtasks: []
          };
          return { ...project, tasks: [...project.tasks, newTask] };
        }
        return project;
      });
      setProjects(updatedProjects);
      setNewTaskTitle('');
    }
  };

  const addSubtask = (parentTaskId, subtaskTitle) => {
    if (!subtaskTitle.trim()) return;

    const addSubtaskRecursive = (tasks) => {
      return tasks.map(task => {
        if (task.id === parentTaskId) {
          const newSubtask = {
            id: Date.now().toString() + Math.random(),
            title: subtaskTitle.trim(),
            status: TASK_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            subtasks: []
          };
          return { ...task, subtasks: [...(task.subtasks || []), newSubtask] };
        } else if (task.subtasks && task.subtasks.length > 0) {
          return { ...task, subtasks: addSubtaskRecursive(task.subtasks) };
        }
        return task;
      });
    };

    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject) {
        return { ...project, tasks: addSubtaskRecursive(project.tasks) };
      }
      return project;
    });

    setProjects(updatedProjects);
    setNewSubtaskTitle('');
    setAddingSubtaskTo(null);
    // Expand the parent task to show new subtask
    setExpandedTasks(prev => new Set([...prev, parentTaskId]));
  };

  const updateTaskStatusRecursive = (tasks, taskId, newStatus) => {
    return tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status: newStatus };
      } else if (task.subtasks && task.subtasks.length > 0) {
        return { ...task, subtasks: updateTaskStatusRecursive(task.subtasks, taskId, newStatus) };
      }
      return task;
    });
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject) {
        return { ...project, tasks: updateTaskStatusRecursive(project.tasks, taskId, newStatus) };
      }
      return project;
    });
    setProjects(updatedProjects);
  };

  const deleteTaskRecursive = (tasks, taskId) => {
    return tasks.filter(task => task.id !== taskId).map(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        return { ...task, subtasks: deleteTaskRecursive(task.subtasks, taskId) };
      }
      return task;
    });
  };

  const deleteTask = (taskId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject) {
        return { ...project, tasks: deleteTaskRecursive(project.tasks, taskId) };
      }
      return project;
    });
    setProjects(updatedProjects);
  };

  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getNextStatus = (currentStatus) => {
    if (currentStatus === TASK_STATUS.PENDING) return TASK_STATUS.DOING;
    if (currentStatus === TASK_STATUS.DOING) return TASK_STATUS.DONE;
    return TASK_STATUS.PENDING;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case TASK_STATUS.PENDING:
        return <Circle className="w-4 h-4 text-slate-400" />;
      case TASK_STATUS.DOING:
        return <Clock className="w-4 h-4 text-blue-500" />;
      case TASK_STATUS.DONE:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TASK_STATUS.PENDING:
        return 'bg-slate-50 hover:bg-slate-100 border-slate-200';
      case TASK_STATUS.DOING:
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
      case TASK_STATUS.DONE:
        return 'bg-green-50 hover:bg-green-100 border-green-200';
      default:
        return 'bg-gray-50 hover:bg-gray-100 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case TASK_STATUS.PENDING:
        return 'bg-slate-100 text-slate-700';
      case TASK_STATUS.DOING:
        return 'bg-blue-100 text-blue-700';
      case TASK_STATUS.DONE:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const currentProject = projects.find(p => p.id === selectedProject);

  // Recursive TaskItem component
  const TaskItem = ({ task, depth = 0 }) => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const isAddingSubtask = addingSubtaskTo === task.id;
    const indentStyle = { paddingLeft: `${depth * 24}px` };

    return (
      <div>
        {/* Task Row */}
        <div
          className={`group border-b border-slate-200 ${getStatusColor(task.status)} transition-colors`}
          style={indentStyle}
        >
          <div className="flex items-center gap-2 py-2 px-3">
            {/* Expand/Collapse Button */}
            <button
              onClick={() => toggleExpanded(task.id)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded transition-colors"
            >
              {hasSubtasks ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )
              ) : (
                <span className="w-4 h-4" />
              )}
            </button>

            {/* Status Icon (clickable) */}
            <button
              onClick={() => updateTaskStatus(task.id, getNextStatus(task.status))}
              className="flex-shrink-0 hover:scale-110 transition-transform"
              title={`Change to ${getNextStatus(task.status)}`}
            >
              {getStatusIcon(task.status)}
            </button>

            {/* Task Title */}
            <span className={`flex-1 text-sm ${task.status === TASK_STATUS.DONE ? 'line-through opacity-60' : ''}`}>
              {task.title}
            </span>

            {/* Status Badge */}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
              {task.status}
            </span>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setAddingSubtaskTo(task.id);
                  setExpandedTasks(prev => new Set([...prev, task.id]));
                }}
                className="p-1 hover:bg-blue-200 rounded transition-colors"
                title="Add Subtask"
              >
                <Plus className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 hover:bg-red-200 rounded transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Subtask Form */}
        {isAddingSubtask && isExpanded && (
          <div style={{ paddingLeft: `${(depth + 1) * 24}px` }} className="border-b border-slate-200 bg-slate-50 py-2 px-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addSubtask(task.id, newSubtaskTitle);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Subtask title..."
                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingSubtaskTo(null);
                  setNewSubtaskTitle('');
                }}
                className="px-3 py-1.5 bg-slate-300 text-slate-700 text-sm rounded hover:bg-slate-400 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Render Subtasks Recursively */}
        {isExpanded && hasSubtasks && (
          <div>
            {task.subtasks.map(subtask => (
              <TaskItem key={subtask.id} task={subtask} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Task Manager</h1>
          <p className="text-slate-600">Organize your tasks with unlimited nested subtasks</p>
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

                {/* Hierarchical Task List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {currentProject.tasks.length === 0 ? (
                    <div className="p-12 text-center">
                      <Circle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-400">No tasks yet. Add your first task above!</p>
                    </div>
                  ) : (
                    <div>
                      {currentProject.tasks.map(task => (
                        <TaskItem key={task.id} task={task} depth={0} />
                      ))}
                    </div>
                  )}
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
