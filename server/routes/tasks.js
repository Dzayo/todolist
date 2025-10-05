import express from 'express';
import db from '../db.js';

const router = express.Router();

// Create new task
router.post('/', async (req, res) => {
  try {
    const { id, projectId, parentId, title, status, description, sortOrder } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    await db.query(
      'INSERT INTO tasks (id, project_id, parent_id, title, description, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, projectId, parentId || null, title.trim(), description || '', status || 'Pending', sortOrder || 0]
    );
    
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    
    res.status(201).json({
      id: rows[0].id,
      title: rows[0].title,
      description: rows[0].description,
      status: rows[0].status,
      sortOrder: rows[0].sort_order,
      createdAt: rows[0].created_at,
      subtasks: []
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { title, status, description, parentId, sortOrder } = req.body;
    const updates = [];
    const values = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (parentId !== undefined) {
      updates.push('parent_id = ?');
      values.push(parentId);
    }
    if (sortOrder !== undefined) {
      updates.push('sort_order = ?');
      values.push(sortOrder);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    values.push(req.params.id);
    
    await db.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({
      id: rows[0].id,
      title: rows[0].title,
      description: rows[0].description,
      status: rows[0].status,
      sortOrder: rows[0].sort_order,
      createdAt: rows[0].created_at
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task (cascades to subtasks)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
