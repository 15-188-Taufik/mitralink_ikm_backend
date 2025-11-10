const express = require('express');
const router = express.Router();

// 1. Kita impor "Manajer" (Controller) yang akan kita buat nanti
const { registerUser, loginUser } = require('../controllers/authController');

// 2. Rute untuk Mendaftar (Register)
// Saat ada panggilan POST ke /api/auth/register
// Teruskan panggilan itu ke fungsi 'registerUser'
router.post('/register', registerUser);

// 3. Rute untuk Masuk (Login)
// Saat ada panggilan POST ke /api/auth/login
// Teruskan panggilan itu ke fungsi 'loginUser'
router.post('/login', loginUser);


// 4. Ekspor router ini agar bisa dipakai di index.js
module.exports = router;