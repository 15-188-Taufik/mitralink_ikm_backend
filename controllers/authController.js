// 1. Impor "alat" yang kita butuhkan
const db = require('../config/db');           // Kabel koneksi database
const bcrypt = require('bcryptjs');         // Alat "penggembok" password
const jwt = require('jsonwebtoken');        // Alat "pembuat kartu akses" (token)

// --- Fungsi Helper untuk membuat "Kartu Akses" (Token) ---
const generateToken = (userId, role) => {
  // Kita ambil kunci rahasia dari "brankas" .env
  const secret = process.env.JWT_SECRET;

  // Buat token yang berisi ID dan Role user, berlaku selama 1 hari
  return jwt.sign({ userId, role }, secret, {
    expiresIn: '1d', 
  });
};


/* ===================================
 * FUNGSI: REGISTER USER BARU
 * @route   POST /api/auth/register
 * =================================== */
exports.registerUser = async (req, res) => {
  // 1. Ambil data dari "formulir" (body request)
  const { email, password, role, nama_usaha, nama_perusahaan } = req.body;

  // 2. Validasi Input (Sangat Penting!)
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, dan role dibutuhkan' });
  }
  if (role === 'ikm' && !nama_usaha) {
    return res.status(400).json({ message: 'Nama usaha dibutuhkan untuk registrasi IKM' });
  }
  if (role === 'industri' && !nama_perusahaan) {
    return res.status(400).json({ message: 'Nama perusahaan dibutuhkan untuk registrasi Industri' });
  }

  try {
    // 3. Cek apakah email sudah terdaftar di database
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // 4. Amankan Password (Hashing)
    // Kita "gembok" password-nya sebelum disimpan
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 5. Simpan user baru ke tabel 'users'
    // Kita gunakan 'RETURNING user_id' untuk langsung mendapatkan ID user baru
    const newUserQuery = 'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id';
    const newUser = await db.query(newUserQuery, [email, password_hash, role]);
    const userId = newUser.rows[0].user_id;

    // 6. Buat profil khusus berdasarkan role
    if (role === 'ikm') {
      await db.query('INSERT INTO ikm_profiles (user_id, nama_usaha) VALUES ($1, $2)', [userId, nama_usaha]);
    } else if (role === 'industri') {
      await db.query('INSERT INTO industry_profiles (user_id, nama_perusahaan) VALUES ($1, $2)', [userId, nama_perusahaan]);
    }

    // 7. Kirim balasan sukses (Tanpa token, kita minta user login)
    res.status(201).json({
      message: 'Registrasi berhasil. Silakan login.',
      user: { user_id: userId, email: email, role: role }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: LOGIN USER
 * @route   POST /api/auth/login
 * =================================== */
exports.loginUser = async (req, res) => {
  // 1. Ambil data dari "formulir" (body request)
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password dibutuhkan' });
  }

  try {
    // 2. Cari user di database berdasarkan email
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    // 3. Jika user tidak ditemukan...
    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // 4. Jika user ada, bandingkan "gembok" password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    // 5. Jika password salah...
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // 6. Jika BERHASIL: Buat "Kartu Akses" (Token)
    const token = generateToken(user.user_id, user.role);

    // 7. Kirim balasan sukses beserta token dan data user
    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};