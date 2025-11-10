const cloudinary = require('cloudinary').v2; // Impor library
require('dotenv').config(); // Pastikan .env terbaca

// Konfigurasi Cloudinary menggunakan kredensial dari .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Menggunakan https
});

// Ekspor 'cloudinary' yang sudah terkonfigurasi
module.exports = cloudinary;