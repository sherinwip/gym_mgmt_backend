const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create new payment
router.post('/', async (req, res) => {
  try {
    const {
      member_id,
      amount,
      payment_date,
      payment_type,
      due_date
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO payments (
        member_id, amount, payment_date, payment_type, due_date
      ) VALUES (?, ?, ?, ?, ?)`,
      [member_id, amount, payment_date, payment_type, due_date]
    );

    const [payment] = await db.query('SELECT * FROM payments WHERE id = ?', [result.insertId]);
    res.json(payment[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT p.*, m.name as member_name 
      FROM payments p
      LEFT JOIN members m ON p.member_id = m.id
      ORDER BY p.created_at DESC
    `);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payments by member ID
router.get('/member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const [payments] = await db.query(
      'SELECT * FROM payments WHERE member_id = ? ORDER BY payment_date DESC',
      [memberId]
    );

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
      .join(', ');
    
    const values = [...Object.values(updates), id];

    await db.query(
      `UPDATE payments SET ${fields} WHERE id = ?`,
      values
    );

    const [payment] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
    res.json(payment[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM payments WHERE id = ?', [id]);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;