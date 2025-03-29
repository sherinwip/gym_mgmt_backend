const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create new follow-up
router.post('/', async (req, res) => {
  try {
    const {
      type,
      reference_id,
      follow_up_date,
      notes
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO follow_ups (
        type, reference_id, follow_up_date, notes
      ) VALUES (?, ?, ?, ?)`,
      [type, reference_id, follow_up_date, notes]
    );

    const [followUp] = await db.query('SELECT * FROM follow_ups WHERE id = ?', [result.insertId]);
    res.json(followUp[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all follow-ups
router.get('/', async (req, res) => {
  try {
    const [followUps] = await db.query(`
      SELECT f.*, 
        CASE 
          WHEN f.type = 'enquiry' THEN e.name
          WHEN f.type = 'membership_end' OR f.type = 'payment_due' OR f.type = 'renew' THEN m.name
        END as reference_name
      FROM follow_ups f
      LEFT JOIN enquiries e ON f.type = 'enquiry' AND f.reference_id = e.id
      LEFT JOIN members m ON (f.type IN ('membership_end', 'payment_due', 'renew')) AND f.reference_id = m.id
      ORDER BY f.follow_up_date ASC
    `);
    res.json(followUps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get follow-ups by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    const [followUps] = await db.query(
      'SELECT * FROM follow_ups WHERE type = ? ORDER BY follow_up_date ASC',
      [type]
    );

    res.json(followUps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending follow-ups
router.get('/pending', async (req, res) => {
  try {
    const [followUps] = await db.query(`
      SELECT f.*, 
        CASE 
          WHEN f.type = 'enquiry' THEN e.name
          WHEN f.type IN ('membership_end', 'payment_due', 'renew') THEN m.name
        END as reference_name
      FROM follow_ups f
      LEFT JOIN enquiries e ON f.type = 'enquiry' AND f.reference_id = e.id
      LEFT JOIN members m ON f.type IN ('membership_end', 'payment_due', 'renew') AND f.reference_id = m.id
      WHERE f.status = 'pending'
      ORDER BY f.follow_up_date ASC
    `);
    res.json(followUps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update follow-up
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
      .join(', ');
    
    const values = [...Object.values(updates), id];

    await db.query(
      `UPDATE follow_ups SET ${fields} WHERE id = ?`,
      values
    );

    const [followUp] = await db.query('SELECT * FROM follow_ups WHERE id = ?', [id]);
    res.json(followUp[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete follow-up
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM follow_ups WHERE id = ?', [id]);
    res.json({ message: 'Follow-up deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;