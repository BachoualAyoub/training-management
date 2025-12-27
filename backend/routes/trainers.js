const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all trainers
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM formateur');
    connection.release();
    
    const data = rows.map(row => ({
      id: row.id_formateur,
      firstName: row.prenom,
      lastName: row.nom,
      email: row.email,
      phone: row.telephone,
      cin: row.cin,
      photo: row.photo,
      cvPdf: row.cv_pdf
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({ error: 'Failed to fetch trainers' });
  }
});

// Get trainer by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM formateur WHERE id_formateur = ?', [req.params.id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trainer not found' });
    }
    
    const row = rows[0];
    res.json({
      id: row.id_formateur,
      firstName: row.prenom,
      lastName: row.nom,
      email: row.email,
      phone: row.telephone,
      cin: row.cin,
      photo: row.photo,
      cvPdf: row.cv_pdf
    });
  } catch (error) {
    console.error('Error fetching trainer:', error);
    res.status(500).json({ error: 'Failed to fetch trainer' });
  }
});

// Create trainer
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, cin, photo, cvPdf } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO formateur (prenom, nom, email, telephone, cin, photo, cv_pdf) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone, cin, photo, cvPdf]
    );
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      firstName,
      lastName,
      email,
      phone,
      cin,
      photo,
      cvPdf
    });
  } catch (error) {
    console.error('Error creating trainer:', error);
    res.status(500).json({ error: 'Failed to create trainer' });
  }
});

// Update trainer
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, cin, photo, cvPdf } = req.body;
    
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE formateur SET prenom = ?, nom = ?, email = ?, telephone = ?, cin = ?, photo = ?, cv_pdf = ? WHERE id_formateur = ?',
      [firstName, lastName, email, phone, cin, photo, cvPdf, req.params.id]
    );
    connection.release();
    
    res.json({
      id: req.params.id,
      firstName,
      lastName,
      email,
      phone,
      cin,
      photo,
      cvPdf
    });
  } catch (error) {
    console.error('Error updating trainer:', error);
    res.status(500).json({ error: 'Failed to update trainer' });
  }
});

// Delete trainer
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM formateur WHERE id_formateur = ?', [req.params.id]);
    connection.release();
    
    res.json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    res.status(500).json({ error: 'Failed to delete trainer' });
  }
});

module.exports = router;
