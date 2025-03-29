const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config/db');

const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/members',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  })
});

// Create new member
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      gender,
      email,
      contact,
      dateOfBirth,
      bloodGroup,
      location,
      address,
      occupation,
      membershipStartDate,
      membershipEndDate,
      userId
    } = req.body;

    const imageUrl = req.file ? `/uploads/members/${req.file.filename}` : null;
    const thumbnailUrl = imageUrl ? imageUrl.replace('.', '_thumb.') : null;

    const [result] = await db.query(
      `INSERT INTO members (
        name, gender, email, contact, date_of_birth, blood_group,
        location, address, occupation, membership_start_date,
        membership_end_date, user_id, image_url, thumbnail_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, gender, email, contact, dateOfBirth, bloodGroup,
        location, address, occupation, membershipStartDate,
        membershipEndDate, userId, imageUrl, thumbnailUrl
      ]
    );

    const [member] = await db.query('SELECT * FROM members WHERE id = ?', [result.insertId]);
    res.json(member[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search members by name and/or contact
router.get('/search', async (req, res) => {
  try {
    const { name, contact } = req.query;
    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];

    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }

    if (contact) {
      query += ' AND contact LIKE ?';
      params.push(`%${contact}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [members] = await db.query(query, params);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all members
router.get('/', async (req, res) => {
  try {
    const [members] = await db.query(
      'SELECT * FROM members ORDER BY created_at DESC'
    );
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [members] = await db.query('SELECT * FROM members WHERE id = ?', [id]);
    
    if (members.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json(members[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
      .join(', ');
    
    const values = [...Object.values(updates), id];

    await db.query(
      `UPDATE members SET ${fields} WHERE id = ?`,
      values
    );

    const [member] = await db.query('SELECT * FROM members WHERE id = ?', [id]);
    res.json(member[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM members WHERE id = ?', [id]);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;