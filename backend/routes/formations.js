const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all formations
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM formation');
    connection.release();
    
    const data = rows.map(row => ({
      id: row.id_formation,
      title: row.titre,
      description: row.description,
      duration: row.charge_horaire,
      programPdf: row.programme_pdf,
      level: row.niveau
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching formations:', error);
    res.status(500).json({ error: 'Failed to fetch formations' });
  }
});

// Get formation by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM formation WHERE id_formation = ?', [req.params.id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Formation not found' });
    }
    
    const row = rows[0];
    res.json({
      id: row.id_formation,
      title: row.titre,
      description: row.description,
      duration: row.charge_horaire,
      programPdf: row.programme_pdf,
      level: row.niveau
    });
  } catch (error) {
    console.error('Error fetching formation:', error);
    res.status(500).json({ error: 'Failed to fetch formation' });
  }
});

// Create formation
router.post('/', async (req, res) => {
  try {
    const { title, description, duration, programPdf, level } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO formation (titre, description, charge_horaire, programme_pdf, niveau) VALUES (?, ?, ?, ?, ?)',
      [title, description, duration, programPdf, level]
    );
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      duration,
      programPdf,
      level
    });
  } catch (error) {
    console.error('Error creating formation:', error);
    res.status(500).json({ error: 'Failed to create formation' });
  }
});

// Update formation
router.put('/:id', async (req, res) => {
  try {
    const { title, description, duration, programPdf, level } = req.body;
    
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE formation SET titre = ?, description = ?, charge_horaire = ?, programme_pdf = ?, niveau = ? WHERE id_formation = ?',
      [title, description, duration, programPdf, level, req.params.id]
    );
    connection.release();
    
    res.json({
      id: req.params.id,
      title,
      description,
      duration,
      programPdf,
      level
    });
  } catch (error) {
    console.error('Error updating formation:', error);
    res.status(500).json({ error: 'Failed to update formation' });
  }
});

// Delete formation
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM formation WHERE id_formation = ?', [req.params.id]);
    connection.release();
    
    res.json({ message: 'Formation deleted successfully' });
  } catch (error) {
    console.error('Error deleting formation:', error);
    res.status(500).json({ error: 'Failed to delete formation' });
  }
});

module.exports = router;
