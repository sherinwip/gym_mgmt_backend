require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authenticateToken = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const enquiryRoutes = require('./routes/enquiries');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payments');
const followUpRoutes = require('./routes/followUps');

app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/members', authenticateToken, memberRoutes);
app.use('/api/enquiries', authenticateToken, enquiryRoutes);
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/follow-ups', authenticateToken, followUpRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});