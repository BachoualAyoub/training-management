const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all sessions with formation and trainer info
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        s.id_session,
        s.date_debut,
        s.date_fin,
        s.description,
        s.id_formation,
        f.titre as formation_title,
        f.niveau,
        f.charge_horaire,
        COUNT(DISTINCT i.id_candidat) as candidateCount
      FROM session s
      LEFT JOIN formation f ON s.id_formation = f.id_formation
      LEFT JOIN inscription i ON s.id_session = i.id_session
      GROUP BY s.id_session
    `);
    connection.release();
    
    const data = rows.map(row => ({
      id: row.id_session,
      startDate: row.date_debut,
      endDate: row.date_fin,
      description: row.description,
      formationId: row.id_formation,
      formationTitle: row.formation_title,
      level: row.niveau,
      duration: row.charge_horaire,
      candidateCount: row.candidateCount || 0
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get sessions for a specific formation
router.get('/formation/:formationId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        s.id_session,
        s.date_debut,
        s.date_fin,
        s.description,
        s.id_formation,
        f.titre as formation_title,
        f.niveau,
        f.charge_horaire,
        COUNT(DISTINCT i.id_candidat) as candidateCount
      FROM session s
      LEFT JOIN formation f ON s.id_formation = f.id_formation
      LEFT JOIN inscription i ON s.id_session = i.id_session
      WHERE s.id_formation = ?
      GROUP BY s.id_session
    `, [req.params.formationId]);
    connection.release();
    
    const data = rows.map(row => ({
      id: row.id_session,
      startDate: row.date_debut,
      endDate: row.date_fin,
      description: row.description,
      formationId: row.id_formation,
      formationTitle: row.formation_title,
      level: row.niveau,
      duration: row.charge_horaire,
      candidateCount: row.candidateCount || 0
    }));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get session by ID with all candidates
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [sessionRows] = await connection.query(`
      SELECT 
        s.id_session,
        s.date_debut,
        s.date_fin,
        s.description,
        s.id_formation,
        f.titre as formation_title
      FROM session s
      LEFT JOIN formation f ON s.id_formation = f.id_formation
      WHERE s.id_session = ?
    `, [req.params.id]);
    
    if (sessionRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const [candidates] = await connection.query(`
      SELECT c.* FROM candidat c
      INNER JOIN inscription i ON c.id_candidat = i.id_candidat
      WHERE i.id_session = ?
    `, [req.params.id]);
    
    connection.release();
    
    const session = sessionRows[0];
    res.json({
      id: session.id_session,
      startDate: session.date_debut,
      endDate: session.date_fin,
      description: session.description,
      formationId: session.id_formation,
      formationTitle: session.formation_title,
      candidates: candidates.map(c => ({
        id: c.id_candidat,
        firstName: c.prenom,
        lastName: c.nom,
        email: c.email
      }))
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Create session
router.post('/', async (req, res) => {
  try {
    const { startDate, endDate, description, formationId, trainerIds } = req.body;
    
    if (!formationId) {
      return res.status(400).json({ error: 'Formation ID is required' });
    }
    
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO session (date_debut, date_fin, description, id_formation) VALUES (?, ?, ?, ?)',
      [startDate, endDate, description, formationId]
    );
    
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      startDate,
      endDate,
      description,
      formationId
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Register candidate to session
router.post('/:id/register', async (req, res) => {
  try {
    const { candidateId } = req.body;
    const sessionId = req.params.id;
    
    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }
    
    const connection = await pool.getConnection();
    
    const [countRows] = await connection.query(
      'SELECT COUNT(*) as count FROM inscription WHERE id_session = ?',
      [sessionId]
    );
    
    if (countRows[0].count >= 15) {
      connection.release();
      return res.status(400).json({ error: 'Session is full (max 15 candidates)' });
    }
    
    const [existingRows] = await connection.query(
      'SELECT * FROM inscription WHERE id_session = ? AND id_candidat = ?',
      [sessionId, candidateId]
    );
    
    if (existingRows.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Candidate already registered to this session' });
    }
    
    await connection.query(
      'INSERT INTO inscription (id_session, id_candidat) VALUES (?, ?)',
      [sessionId, candidateId]
    );
    
    connection.release();
    
    res.status(201).json({ message: 'Candidate registered successfully' });
  } catch (error) {
    console.error('Error registering candidate:', error);
    res.status(500).json({ error: 'Failed to register candidate' });
  }
});

// Update session
router.put('/:id', async (req, res) => {
  try {
    const { startDate, endDate, description, formationId } = req.body;
    
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE session SET date_debut = ?, date_fin = ?, description = ?, id_formation = ? WHERE id_session = ?',
      [startDate, endDate, description, formationId, req.params.id]
    );
    connection.release();
    
    res.json({
      id: req.params.id,
      startDate,
      endDate,
      description,
      formationId
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM session WHERE id_session = ?', [req.params.id]);
    connection.release();
    
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;
