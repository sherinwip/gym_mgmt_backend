const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get enquiry statistics
router.get('/enquiry-stats', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM enquiries
      GROUP BY status
    `);
    
    const stats = {
      converted: results.find(r => r.status === 'converted')?.count || 0,
      expected: results.find(r => r.status === 'expected')?.count || 0,
      notInterested: results.find(r => r.status === 'not_interested')?.count || 0,
      hot: results.find(r => r.status === 'hot')?.count || 0,
      cold: results.find(r => r.status === 'cold')?.count || 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get member attendance for last 6 months
router.get('/attendance', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [attendance] = await db.query(`
      SELECT a.*, m.id as member_id, m.name as member_name, m.thumbnail_url
      FROM attendance a
      LEFT JOIN members m ON a.member_id = m.id
      WHERE a.check_in_time >= ?
      ORDER BY a.check_in_time DESC
    `, [sixMonthsAgo]);

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly admissions
router.get('/monthly-admissions', async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [members] = await db.query(`
      SELECT *
      FROM members
      WHERE created_at >= ?
    `, [startOfMonth]);

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get member status statistics
router.get('/member-stats', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM members
      GROUP BY status
    `);

    const stats = {
      active: results.find(r => r.status === 'active')?.count || 0,
      inactive: results.find(r => r.status === 'inactive')?.count || 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get birthday information
router.get('/birthdays', async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    
    // Get member birthdays
    const [memberBirthdays] = await db.query(`
      SELECT *
      FROM members
      WHERE MONTH(date_of_birth) = ?
    `, [currentMonth]);

    // Get staff birthdays
    const [staffBirthdays] = await db.query(`
      SELECT *
      FROM staff
      WHERE MONTH(date_of_birth) = ?
    `, [currentMonth]);

    res.json({
      members: memberBirthdays,
      staff: staffBirthdays
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get follow-up counts
router.get('/follow-up-counts', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT type, status, COUNT(*) as count
      FROM follow_ups
      WHERE status = 'pending'
      GROUP BY type, status
    `);

    const counts = {
      enquiryFollowUps: results.find(r => r.type === 'enquiry')?.count || 0,
      membershipEnd: results.find(r => r.type === 'membership_end')?.count || 0,
      paymentDue: results.find(r => r.type === 'payment_due')?.count || 0,
      renewFollowUp: results.find(r => r.type === 'renew')?.count || 0,
      otherFollowUp: results.find(r => r.type === 'other')?.count || 0
    };

    res.json(counts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;