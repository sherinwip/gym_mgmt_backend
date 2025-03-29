const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:  'localhost',
  user:  'root',
  password: 'Sherin@123',
  database:  'gym_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: false  
});

module.exports = pool;