import express from 'express';
import db from '../db.js';

const router = express.Router();

// Helper function to build hierarchical task structure
const buildTaskHierarchy = (tasks, parentId = null) => {
  return tasks
    .filter(task => task.parent_id === parentId)
    .map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      createdAt: task.created_at,
      subtasks: buildTaskHierarchy(tasks, task.id)
    }));
};

// Get all projects with their tasks
router.get('/', async (req, res) => {
  try {
    const [projects] = await db.query('SELECT * FROM projects ORDER BY created_at ASC');
    
    // Get all tasks for all projects
    const [allTasks] = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
    
    // Build projects with hierarchical tasks
    const projectsWithTasks = projects.map(project => {
      const projectTasks = allTasks.filter(task => task.project_id === project.id);
      return {
        id: project.id,
        name: project.name,
        tasks: buildTaskHierarchy(projectTasks)
      };
    });
    
    res.json(projectsWithTasks);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project with tasks
router.get('/:id', async (req, res) => {
  try {
    const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const [tasks] = await db.query('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC', [req.params.id]);
    
    const project = {
      id: projects[0].id,
      name: projects[0].name,
      tasks: buildTaskHierarchy(tasks)
    };
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    await db.query('INSERT INTO projects (id, name) VALUES (?, ?)', [id, name.trim()]);
    
    res.status(201).json({ id, name: name.trim(), tasks: [] });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Delete project (cascades to tasks)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
