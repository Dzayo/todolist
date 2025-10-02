import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all todos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Get single todo
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// Create new todo
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Todo text is required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO todos (text, completed) VALUES (?, ?)',
      [text.trim(), false]
    );
    
    const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo
router.put('/:id', async (req, res) => {
  try {
    const { text, completed } = req.body;
    const updates = [];
    const values = [];
    
    if (text !== undefined) {
      updates.push('text = ?');
      values.push(text);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    values.push(req.params.id);
    
    await db.query(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM todos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Delete all completed todos
router.delete('/completed/all', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM todos WHERE completed = true');
    res.json({ message: `Deleted ${result.affectedRows} completed todos` });
  } catch (error) {
    console.error('Error deleting completed todos:', error);
    res.status(500).json({ error: 'Failed to delete completed todos' });
  }
});

export default router;
