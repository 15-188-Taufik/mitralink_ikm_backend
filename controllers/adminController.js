const db = require('../config/db'); // Impor koneksi database

/* ===================================
 * FUNGSI: ADMIN MENDAPATKAN IKM (BELUM VERIFIKASI)
 * @route   GET /api/admin/unverified
 * =================================== */
exports.getUnverifiedIkms = async (req, res) => {
  try {
    // 1. Ambil semua profil IKM yang 'is_verified' nya 'false'
    // Kita JOIN dengan tabel 'users' untuk menampilkan email mereka juga
    const query = `
      SELECT p.profile_id, p.nama_usaha, p.nama_pemilik, u.email, p.created_at
      FROM ikm_profiles p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.is_verified = false
      ORDER BY p.created_at ASC
    `;

    const { rows } = await db.query(query);

    // 2. Kirim daftarnya (bisa jadi array kosong)
    res.status(200).json(rows);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: ADMIN MEM-VERIFIKASI IKM
 * @route   PUT /api/admin/verify/:id
 * =================================== */
exports.verifyIkm = async (req, res) => {
  try {
    // 1. Ambil 'id' (profile_id) dari parameter URL
    const { id } = req.params;

    // 2. Buat query UPDATE untuk mengubah 'is_verified' menjadi true
    const query = `
      UPDATE ikm_profiles
      SET is_verified = true
      WHERE profile_id = $1
      RETURNING * `; 

    // 3. Eksekusi query
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Profil IKM tidak ditemukan dengan ID tersebut' });
    }

    // 4. Kirim data profil yang sudah ter-update
    res.status(200).json({
      message: `IKM ${rows[0].nama_usaha} berhasil diverifikasi`,
      profile: rows[0]
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: ADMIN MELIHAT LAPORAN PENDAPATAN
 * @route   GET /api/admin/reports/revenue
 * =================================== */
exports.getRevenueReports = async (req, res) => {
  try {
    // 1. Ambil semua data dari tabel 'revenues'
    // Kita JOIN dengan 'ikm_profiles' untuk mendapatkan nama usaha
    const query = `
      SELECT 
        r.revenue_id,
        p.nama_usaha,
        r.bulan,
        r.tahun,
        r.jumlah_pendapatan,
        r.created_at AS tanggal_lapor
      FROM revenues r
      JOIN ikm_profiles p ON r.ikm_profile_id = p.profile_id
      ORDER BY r.tahun DESC, r.bulan DESC, p.nama_usaha ASC
    `;
    
    const { rows } = await db.query(query);

    // 2. Kirim daftarnya (bisa jadi array kosong)
    res.status(200).json(rows);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};