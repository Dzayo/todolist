const API_BASE_URL = 'http://localhost:3001/api';

// Projects API
export const projectsAPI = {
  // Get all projects with tasks
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  // Get single project
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  // Create project
  create: async (project) => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  // Delete project
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete project');
    return response.json();
  }
};

// Tasks API
export const tasksAPI = {
  // Create task
  create: async (task) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  // Update task
  update: async (id, updates) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  // Delete task
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
  }
};

// Snapshots API
export const snapshotsAPI = {
  // Get all snapshots (metadata only)
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/snapshots`);
    if (!response.ok) throw new Error('Failed to fetch snapshots');
    return response.json();
  },

  // Get specific snapshot with full data
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/snapshots/${id}`);
    if (!response.ok) throw new Error('Failed to fetch snapshot');
    return response.json();
  },

  // Get latest snapshot
  getLatest: async () => {
    const response = await fetch(`${API_BASE_URL}/snapshots/latest/data`);
    if (!response.ok) throw new Error('Failed to fetch latest snapshot');
    return response.json();
  },

  // Create new snapshot
  create: async (snapshot) => {
    const response = await fetch(`${API_BASE_URL}/snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot)
    });
    if (!response.ok) throw new Error('Failed to create snapshot');
    return response.json();
  },

  // Delete snapshot
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/snapshots/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete snapshot');
    return response.json();
  }
};
