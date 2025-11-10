// 1. Impor "alat" penerjemah PostgreSQL (pg)
const { Pool } = require('pg');

// 2. Impor "brankas" kita
require('dotenv').config();

// 3. Buat "Kolam Koneksi" (Connection Pool)
// Ini jauh lebih efisien daripada membuat koneksi baru setiap kali ada query.
// Dia mengambil semua data dari file .env Anda.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 4. Kita ekspor fungsi "query" agar bisa kita gunakan di file lain
module.exports = {
  query: (text, params) => pool.query(text, params),
};