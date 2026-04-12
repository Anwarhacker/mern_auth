const mysql2 = require('mysql2');
require('dotenv').config();

const pool = mysql2.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  user:              process.env.DB_USER     || 'root',
  password:          process.env.DB_PASSWORD || '',
  database:          process.env.DB_NAME     || 'mern_auth_db',
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
});

// Verify connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   → Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env');
    // Don't exit — let the server run so requests return a proper error
    return;
  }
  console.log('✅ MySQL connected successfully');
  connection.release();
});

module.exports = pool.promise();
