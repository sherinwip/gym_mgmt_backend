const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create new attendance record
router.post('/', async (req, res) => {
  try {
    const { member_id } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO attendance (member_id, check_in_time) VALUES (?, NOW())',
      [member_id]
    );

    const [attendance] = await db.query(
      'SELECT * FROM attendance WHERE id = ?',
      [result.insertId]
    );

    res.json(attendance[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const [attendance] = await db.query(`
      SELECT a.*, m.name as member_name, m.thumbnail_url
      FROM attendance a
      LEFT JOIN members m ON a.member_id = m.id
      ORDER BY a.check_in_time DESC
    `);

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance by member ID
router.get('/member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const [attendance] = await db.query(
      'SELECT * FROM attendance WHERE member_id = ? ORDER BY check_in_time DESC',
      [memberId]
    );

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update check-out time
router.put('/:id/checkout', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      'UPDATE attendance SET check_out_time = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    const [attendance] = await db.query(
      'SELECT * FROM attendance WHERE id = ?',
      [id]
    );

    res.json(attendance[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's attendance
router.get('/today', async (req, res) => {
  try {
    const [attendance] = await db.query(`
      SELECT a.*, m.name as member_name, m.thumbnail_url
      FROM attendance a
      LEFT JOIN members m ON a.member_id = m.id
      WHERE DATE(a.check_in_time) = CURDATE()
      ORDER BY a.check_in_time DESC
    `);

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;