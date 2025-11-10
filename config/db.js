const { Pool } = require('pg');
require('dotenv').config();

let config;

// Cek apakah kita sedang 'production' (di Railway)
if (process.env.NODE_ENV === 'production') {
  // Jika 'production', gunakan DATABASE_URL dari Railway/Neon
  config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Diperlukan oleh Neon
    }
  };
} else {
  // Jika 'development' (di laptop), gunakan 5 variabel .env lama
  config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  };
}

// Buat "Kolam Koneksi" (Pool) menggunakan konfigurasi yang tepat
const pool = new Pool(config);

// Ekspor 'query'
module.exports = {
  query: (text, params) => pool.query(text, params),
};