const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM candidat');
    connection.release();
    
    const data = rows.map(row => ({
      id: row.id_candidat,
      firstName: row.prenom,
      lastName: row.nom,
      email: row.email,
      cin: row.cin,
      photo: row.photo,
      password: row.mot_de_passe
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get candidate by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM candidat WHERE id_candidat = ?', [req.params.id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    const row = rows[0];
    res.json({
      id: row.id_candidat,
      firstName: row.prenom,
      lastName: row.nom,
      email: row.email,
      cin: row.cin,
      photo: row.photo,
      password: row.mot_de_passe
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// Create candidate
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, cin, photo, password } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO candidat (prenom, nom, email, cin, photo, mot_de_passe) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, cin, photo, password]
    );
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      firstName,
      lastName,
      email,
      cin,
      photo,
      password
    });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// Update candidate
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, cin, photo, password } = req.body;
    
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE candidat SET prenom = ?, nom = ?, email = ?, cin = ?, photo = ?, mot_de_passe = ? WHERE id_candidat = ?',
      [firstName, lastName, email, cin, photo, password, req.params.id]
    );
    connection.release();
    
    res.json({
      id: req.params.id,
      firstName,
      lastName,
      email,
      cin,
      photo,
      password
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete candidate
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM candidat WHERE id_candidat = ?', [req.params.id]);
    connection.release();
    
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

module.exports = router;
