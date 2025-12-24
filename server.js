const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connection to Railway Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

// 1. Home Route
app.get('/', (req, res) => res.send('Library API is Running! 📚'));

// 2. Register (Members Table)
app.post('/api/register', async (req, res) => {
  const { name, username, email, phone, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Members (FullName, Username, Email, Phone, Password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, username, email, phone, password]
    );
    res.json({ success: true, member: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: "User already exists" });
  }
});

// 3. Login (Email, Username, or Phone)
app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM Members WHERE (Email = $1 OR Username = $1 OR Phone = $1) AND Password = $2',
      [identifier, password]
    );
    if (result.rows.length > 0) res.json({ success: true, member: result.rows[0] });
    else res.status(401).json({ success: false, message: "Wrong credentials" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 4. Get Books
app.get('/api/books', async (req, res) => {
  const result = await pool.query('SELECT * FROM Books');
  res.json(result.rows);
});

// Railway needs 0.0.0.0 to listen correctly
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on port ${PORT}`));