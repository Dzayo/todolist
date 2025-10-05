import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FolderOpen, CheckCircle2, Circle, Clock, ChevronRight, ChevronDown, FileText, GripVertical, Edit2, X, Save } from 'lucide-react';
import { projectsAPI, tasksAPI } from './api';

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
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [descriptionModalTask, setDescriptionModalTask] = useState(null);
  const [descriptionText, setDescriptionText] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverTask, setDragOverTask] = useState(null);
  const [dragOverPosition, setDragOverPosition] = useState(null); // 'before', 'after', 'inside'

  // Load projects from database on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsAPI.getAll();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        // Fallback to localStorage if API fails
        const savedProjects = localStorage.getItem('todoProjects');
        if (savedProjects) {
          const parsedProjects = JSON.parse(savedProjects);
          setProjects(parsedProjects);
          if (parsedProjects.length > 0) {
            setSelectedProject(parsedProjects[0].id);
          }
        }
      }
    };
    loadProjects();
  }, []);

  const addProject = async (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        tasks: []
      };
      try {
        await projectsAPI.create(newProject);
        setProjects([...projects, newProject]);
        setSelectedProject(newProject.id);
        setNewProjectName('');
        setShowProjectForm(false);
      } catch (error) {
        console.error('Failed to create project:', error);
        alert('Failed to create project. Please try again.');
      }
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await projectsAPI.delete(projectId);
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      if (selectedProject === projectId) {
        setSelectedProject(updatedProjects.length > 0 ? updatedProjects[0].id : null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (newTaskTitle.trim() && selectedProject) {
      const newTask = {
        id: Date.now().toString(),
        projectId: selectedProject,
        parentId: null,
        title: newTaskTitle.trim(),
        description: '',
        status: TASK_STATUS.PENDING
      };
      try {
        const createdTask = await tasksAPI.create(newTask);
        const updatedProjects = projects.map(project => {
          if (project.id === selectedProject) {
            return { ...project, tasks: [...project.tasks, createdTask] };
          }
          return project;
        });
        setProjects(updatedProjects);
        setNewTaskTitle('');
      } catch (error) {
        console.error('Failed to create task:', error);
        alert('Failed to create task. Please try again.');
      }
    }
  };

  const addSubtask = async (parentTaskId, subtaskTitle) => {
    if (!subtaskTitle.trim()) return;

    const newSubtask = {
      id: Date.now().toString() + Math.random(),
      projectId: selectedProject,
      parentId: parentTaskId,
      title: subtaskTitle.trim(),
      description: '',
      status: TASK_STATUS.PENDING
    };

    try {
      const createdSubtask = await tasksAPI.create(newSubtask);
      
      const addSubtaskRecursive = (tasks) => {
        return tasks.map(task => {
          if (task.id === parentTaskId) {
            return { ...task, subtasks: [...(task.subtasks || []), createdSubtask] };
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
    } catch (error) {
      console.error('Failed to create subtask:', error);
      alert('Failed to create subtask. Please try again.');
    }
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

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject) {
          return { ...project, tasks: updateTaskStatusRecursive(project.tasks, taskId, newStatus) };
        }
        return project;
      });
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const deleteTaskRecursive = (tasks, taskId) => {
    return tasks.filter(task => task.id !== taskId).map(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        return { ...task, subtasks: deleteTaskRecursive(task.subtasks, taskId) };
      }
      return task;
    });
  };

  const deleteTask = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject) {
          return { ...project, tasks: deleteTaskRecursive(project.tasks, taskId) };
        }
        return project;
      });
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
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
        return 'bg-slate-800 hover:bg-slate-700 border-slate-600';
      case TASK_STATUS.DOING:
        return 'bg-blue-900 hover:bg-blue-800 border-blue-700';
      case TASK_STATUS.DONE:
        return 'bg-green-900 hover:bg-green-800 border-green-700';
      default:
        return 'bg-gray-800 hover:bg-gray-700 border-gray-600';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case TASK_STATUS.PENDING:
        return 'bg-slate-700 text-slate-200';
      case TASK_STATUS.DOING:
        return 'bg-blue-700 text-blue-200';
      case TASK_STATUS.DONE:
        return 'bg-green-700 text-green-200';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  const updateTaskTitle = async (taskId, newTitle) => {
    if (!newTitle.trim()) return;
    
    try {
      await tasksAPI.update(taskId, { title: newTitle.trim() });
      
      const updateTitleRecursive = (tasks) => {
        return tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, title: newTitle.trim() };
          } else if (task.subtasks && task.subtasks.length > 0) {
            return { ...task, subtasks: updateTitleRecursive(task.subtasks) };
          }
          return task;
        });
      };

      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject) {
          return { ...project, tasks: updateTitleRecursive(project.tasks) };
        }
        return project;
      });
      setProjects(updatedProjects);
      setEditingTaskId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to update task title:', error);
      alert('Failed to update task title. Please try again.');
    }
  };

  const updateTaskDescription = async (taskId, newDescription) => {
    try {
      await tasksAPI.update(taskId, { description: newDescription });
      
      const updateDescriptionRecursive = (tasks) => {
        return tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, description: newDescription };
          } else if (task.subtasks && task.subtasks.length > 0) {
            return { ...task, subtasks: updateDescriptionRecursive(task.subtasks) };
          }
          return task;
        });
      };

      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject) {
          return { ...project, tasks: updateDescriptionRecursive(project.tasks) };
        }
        return project;
      });
      setProjects(updatedProjects);
      setDescriptionModalTask(null);
      setDescriptionText('');
    } catch (error) {
      console.error('Failed to update task description:', error);
      alert('Failed to update task description. Please try again.');
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, task, position) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTask(task);
    setDragOverPosition(position);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverTask(null);
    setDragOverPosition(null);
  };

  const handleDrop = async (e, targetTask, position) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask || draggedTask.id === targetTask.id) {
      handleDragEnd();
      return;
    }

    // Determine new parent based on drop position
    let newParentId = null;
    
    if (position === 'inside') {
      newParentId = targetTask.id;
    } else if (position === 'before' || position === 'after') {
      newParentId = targetTask.parentId || null;
    }

    try {
      await tasksAPI.update(draggedTask.id, { parentId: newParentId });
      
      // Reload projects to reflect changes
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to move task:', error);
      alert('Failed to move task. Please try again.');
    }
    
    handleDragEnd();
  };

  const currentProject = projects.find(p => p.id === selectedProject);

  // Recursive TaskItem component
  const TaskItem = ({ task, depth = 0 }) => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const isAddingSubtask = addingSubtaskTo === task.id;
    const isEditing = editingTaskId === task.id;
    const isDraggedOver = dragOverTask?.id === task.id;
    const indentStyle = { paddingLeft: `${depth * 24}px` };

    return (
      <div>
        {/* Task Row */}
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, task)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, task, 'inside')}
          onDrop={(e) => handleDrop(e, task, 'inside')}
          className={`group border-b border-gray-700 ${getStatusColor(task.status)} transition-colors relative ${
            isDraggedOver && dragOverPosition === 'inside' ? 'ring-2 ring-blue-500' : ''
          }`}
          style={indentStyle}
        >
          {/* Drag indicators */}
          {isDraggedOver && dragOverPosition === 'before' && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
          {isDraggedOver && dragOverPosition === 'after' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
          
          <div className="flex items-center gap-2 py-2 px-3">
            {/* Drag Handle */}
            <div className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-gray-500" />
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => toggleExpanded(task.id)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
            >
              {hasSubtasks ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
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

            {/* Task Title - Editable */}
            {isEditing ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateTaskTitle(task.id, editingTitle);
                    } else if (e.key === 'Escape') {
                      setEditingTaskId(null);
                      setEditingTitle('');
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm bg-gray-700 text-white border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => updateTaskTitle(task.id, editingTitle)}
                  className="p-1 hover:bg-green-900 rounded transition-colors"
                  title="Save"
                >
                  <Save className="w-4 h-4 text-green-400" />
                </button>
                <button
                  onClick={() => {
                    setEditingTaskId(null);
                    setEditingTitle('');
                  }}
                  className="p-1 hover:bg-red-900 rounded transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : (
              <span 
                className={`flex-1 text-sm text-gray-200 ${task.status === TASK_STATUS.DONE ? 'line-through opacity-60' : ''}`}
                onDoubleClick={() => {
                  setEditingTaskId(task.id);
                  setEditingTitle(task.title);
                }}
                title="Double-click to edit"
              >
                {task.title}
              </span>
            )}

            {/* Status Badge */}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
              {task.status}
            </span>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setDescriptionModalTask(task);
                  setDescriptionText(task.description || '');
                }}
                className="p-1 hover:bg-purple-900 rounded transition-colors"
                title="View/Edit Description"
              >
                <FileText className={`w-4 h-4 ${task.description ? 'text-purple-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={() => {
                  setEditingTaskId(task.id);
                  setEditingTitle(task.title);
                }}
                className="p-1 hover:bg-yellow-900 rounded transition-colors"
                title="Edit Title"
              >
                <Edit2 className="w-4 h-4 text-yellow-400" />
              </button>
              <button
                onClick={() => {
                  setAddingSubtaskTo(task.id);
                  setExpandedTasks(prev => new Set([...prev, task.id]));
                }}
                className="p-1 hover:bg-blue-900 rounded transition-colors"
                title="Add Subtask"
              >
                <Plus className="w-4 h-4 text-blue-400" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 hover:bg-red-900 rounded transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Subtask Form */}
        {isAddingSubtask && isExpanded && (
          <div style={{ paddingLeft: `${(depth + 1) * 24}px` }} className="border-b border-gray-700 bg-gray-800 py-2 px-3">
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
                className="flex-1 px-3 py-1.5 text-sm bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-1.5 bg-gray-700 text-gray-200 text-sm rounded hover:bg-gray-600 transition-colors"
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
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Task Manager</h1>
          <p className="text-gray-400">Organize your tasks with unlimited nested subtasks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Projects Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow-md p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Projects
                </h2>
                <button
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="p-1 hover:bg-gray-800 rounded-md transition-colors"
                  title="Add Project"
                >
                  <Plus className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {showProjectForm && (
                <form onSubmit={addProject} className="mb-4">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
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
                      className="flex-1 bg-gray-700 text-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {projects.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No projects yet</p>
                ) : (
                  projects.map(project => (
                    <div
                      key={project.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                        selectedProject === project.id
                          ? 'bg-blue-900 border-2 border-blue-500'
                          : 'bg-gray-800 hover:bg-gray-750 border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{project.name}</p>
                        <p className="text-xs text-gray-400">{project.tasks.length} tasks</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="p-1 hover:bg-red-900 rounded-md transition-colors ml-2"
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
                <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-6 border border-gray-800">
                  <h2 className="text-2xl font-semibold text-white mb-4">{currentProject.name}</h2>
                  <form onSubmit={addTask} className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add a new task..."
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-800">
                  {currentProject.tasks.length === 0 ? (
                    <div className="p-12 text-center">
                      <Circle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500">No tasks yet. Add your first task above!</p>
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
              <div className="bg-gray-900 rounded-lg shadow-md p-12 text-center border border-gray-800">
                <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Project Selected</h3>
                <p className="text-gray-500">Create or select a project to start managing your tasks</p>
              </div>
            )}
          </div>
        </div>

        {/* Description Modal */}
        {descriptionModalTask && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setDescriptionModalTask(null);
              setDescriptionText('');
            }}
          >
            <div 
              className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">Task Description</h3>
                    <p className="text-sm text-gray-400 mt-1">{descriptionModalTask.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDescriptionModalTask(null);
                    setDescriptionText('');
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <textarea
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  placeholder="Add a detailed description for this task..."
                  className="w-full h-64 px-4 py-3 bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    setDescriptionModalTask(null);
                    setDescriptionText('');
                  }}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateTaskDescription(descriptionModalTask.id, descriptionText)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Description
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
