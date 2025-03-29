const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config/db');

const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/enquiries',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  })
});

// Create new enquiry
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
      enquiryType,
      source,
      referredBy,
      rating,
      callResponse,
      budget,
      executiveName,
      nextFollowUpDate,
      comments
    } = req.body;

    const imageUrl = req.file ? `/uploads/enquiries/${req.file.filename}` : null;
    const thumbnailUrl = imageUrl ? imageUrl.replace('.', '_thumb.') : null;

    const [result] = await db.query(
      `INSERT INTO enquiries (
        name, gender, email, contact, date_of_birth, blood_group,
        location, address, occupation, enquiry_type, source,
        referred_by, rating, call_response, budget,
        executive_name, next_follow_up_date, image_url,
        thumbnail_url, comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, gender, email, contact, dateOfBirth, bloodGroup,
        location, address, occupation, enquiryType, source,
        referredBy, rating, callResponse, budget,
        executiveName, nextFollowUpDate, imageUrl,
        thumbnailUrl, comments
      ]
    );

    const [enquiry] = await db.query('SELECT * FROM enquiries WHERE id = ?', [result.insertId]);
    res.json(enquiry[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all enquiries
router.get('/', async (req, res) => {
  try {
    const [enquiries] = await db.query(
      'SELECT * FROM enquiries ORDER BY created_at DESC'
    );
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update enquiry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
      .join(', ');
    
    const values = [...Object.values(updates), id];

    await db.query(
      `UPDATE enquiries SET ${fields} WHERE id = ?`,
      values
    );

    const [enquiry] = await db.query('SELECT * FROM enquiries WHERE id = ?', [id]);
    res.json(enquiry[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete enquiry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM enquiries WHERE id = ?', [id]);
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;