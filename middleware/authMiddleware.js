const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Impor koneksi database
require('dotenv').config();

/* ===================================
 * FUNGSI 1: PROTECT (Memvalidasi Token)
 * =================================== */
const protect = async (req, res, next) => {
  let token;

  // 1. Cek apakah ada token di header 'Authorization'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Ambil token dari header (Bentuknya: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verifikasi token menggunakan Kunci Rahasia (.env)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. (Penting!) Ambil data user dari DB berdasarkan ID di token
      // Ini untuk memastikan user-nya masih ada di sistem
      const { rows } = await db.query(
        'SELECT user_id, email, role FROM users WHERE user_id = $1',
        [decoded.userId]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'User tidak ditemukan, token tidak valid' });
      }

      // 5. Tempelkan data user ke object 'req'
      // Sehingga rute selanjutnya bisa tahu siapa yang sedang login
      req.user = rows[0]; // req.user = { user_id: 1, email: '...', role: 'ikm' }
      
      // 6. Lanjut ke "manajer" (controller) selanjutnya
      next();

    } catch (error) {
      // Jika token salah atau expired
      console.error(error);
      return res.status(401).json({ message: 'Tidak terotorisasi, token gagal' });
    }
  }

  // 7. Jika tidak ada header 'Authorization' sama sekali
  if (!token) {
    return res.status(401).json({ message: 'Tidak terotorisasi, tidak ada token' });
  }
};

/* ===================================
 * FUNGSI 2: AUTHORIZE (Memvalidasi Role)
 * =================================== */
// Ini adalah "Penjaga" level 2
// Kita memberinya daftar 'role' yang diizinkan (misal: 'admin', 'ikm')
const authorize = (...roles) => {
  return (req, res, next) => {
    // 1. Cek apakah 'role' user (dari 'protect') ada di daftar 'roles'
    if (!roles.includes(req.user.role)) {
      // 2. Jika tidak diizinkan, kirim error 403 (Forbidden)
      return res.status(403).json({ 
        message: `Role '${req.user.role}' tidak diizinkan untuk mengakses sumber daya ini` 
      });
    }
    
    // 3. Jika diizinkan, lanjut
    next();
  };
};

// Ekspor kedua fungsi agar bisa dipakai
module.exports = { protect, authorize };