import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all snapshots (metadata only, not full data)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, created_at, description FROM snapshots ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    res.status(500).json({ error: 'Failed to fetch snapshots' });
  }
});

// Get specific snapshot with full data
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM snapshots WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }
    
    res.json({
      id: rows[0].id,
      createdAt: rows[0].created_at,
      description: rows[0].description,
      data: rows[0].data
    });
  } catch (error) {
    console.error('Error fetching snapshot:', error);
    res.status(500).json({ error: 'Failed to fetch snapshot' });
  }
});

// Get latest snapshot
router.get('/latest/data', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM snapshots ORDER BY created_at DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      return res.json({ data: [] }); // Return empty state if no snapshots
    }
    
    res.json({
      id: rows[0].id,
      createdAt: rows[0].created_at,
      description: rows[0].description,
      data: rows[0].data
    });
  } catch (error) {
    console.error('Error fetching latest snapshot:', error);
    res.status(500).json({ error: 'Failed to fetch latest snapshot' });
  }
});

// Create new snapshot
router.post('/', async (req, res) => {
  try {
    const { id, description, data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Snapshot data is required' });
    }
    
    await db.query(
      'INSERT INTO snapshots (id, description, data) VALUES (?, ?, ?)',
      [id, description || null, JSON.stringify(data)]
    );
    
    const [rows] = await db.query('SELECT * FROM snapshots WHERE id = ?', [id]);
    
    res.status(201).json({
      id: rows[0].id,
      createdAt: rows[0].created_at,
      description: rows[0].description
    });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    res.status(500).json({ error: 'Failed to create snapshot' });
  }
});

// Delete snapshot
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM snapshots WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }
    
    res.json({ message: 'Snapshot deleted successfully' });
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    res.status(500).json({ error: 'Failed to delete snapshot' });
  }
});

export default router;
