// 1. Memuat "brankas" (dotenv) paling pertama
require('dotenv').config(); 

// 2. Impor "alat-alat" kita (HANYA SEKALI)
const express = require('express');
const cors = require('cors');

// 3. Impor SEMUA Rute kita (HANYA SEKALI)
const authRoutes = require('./routes/authRoutes');
const ikmRoutes = require('./routes/ikmRoutes');
const industryRoutes = require('./routes/industryRoutes');
const adminRoutes = require('./routes/adminRoutes');

// 4. Inisialisasi aplikasi express (HANYA SEKALI)
const app = express();

// 5. Tentukan PORT
const PORT = process.env.PORT || 5000;

/* ===================
 * MIDDLEWARE
 * =================== */
app.use(cors());
app.use(express.json());

/* ===================
 * RUTE / ENDPOINTS
 * =================== */

// Rute tes sederhana untuk Homepage
app.get('/', (req, res) => {
  res.send('Selamat Datang di API MitraLink IKM!');
});

// Gunakan Rute Auth
app.use('/api/auth', authRoutes);

// Gunakan Rute IKM
app.use('/api/ikm', ikmRoutes);

// Gunakan Rute Industri
app.use('/api/industry', industryRoutes);

// Gunakan Rute Admin
app.use('/api/admin', adminRoutes);


/* ===================
 * MENJALANKAN SERVER (HANYA SEKALI)
 * =================== */
app.listen(PORT, (err) => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});