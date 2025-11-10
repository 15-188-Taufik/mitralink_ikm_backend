const db = require('../config/db');

// GET /api/industry/me
exports.getMyProfile = async (req, res) => {
  // (Fungsi ini tidak berubah)
  try {
    const userId = req.user.user_id;
    const { rows } = await db.query(
      'SELECT * FROM industry_profiles WHERE user_id = $1', 
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Profil Industri tidak ditemukan' });
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// PUT /api/industry/me (VERSI UPGRADE)
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    // TAMBAHKAN 'no_hp'
    const { nama_perusahaan, sektor_industri, no_hp } = req.body;

    const query = `
      UPDATE industry_profiles
      SET nama_perusahaan = $1, sektor_industri = $2, no_hp = $3
      WHERE user_id = $4
      RETURNING * `; 
    const params = [nama_perusahaan, sektor_industri, no_hp, userId]; // Tambahkan no_hp

    const { rows } = await db.query(query, params);
    if (rows.length === 0) return res.status(404).json({ message: 'Profil Industri tidak ditemukan' });

    res.status(200).json({
      message: 'Profil Industri berhasil diperbarui',
      profile: rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST /api/industry/needs
exports.createNeed = async (req, res) => {
  // (Fungsi ini tidak berubah)
  try {
    const userId = req.user.user_id;
    const { judul_kebutuhan, deskripsi } = req.body;
    if (!judul_kebutuhan || !deskripsi) return res.status(400).json({ message: 'Judul dan deskripsi dibutuhkan' });

    const profileResult = await db.query('SELECT profile_id FROM industry_profiles WHERE user_id = $1', [userId]);
    if (profileResult.rows.length === 0) return res.status(404).json({ message: 'Profil Industri tidak ditemukan' });
    const { profile_id } = profileResult.rows[0];

    const query = `
      INSERT INTO industry_needs (industry_profile_id, judul_kebutuhan, deskripsi)
      VALUES ($1, $2, $3) RETURNING *
    `;
    const params = [profile_id, judul_kebutuhan, deskripsi];
    const { rows } = await db.query(query, params);
    res.status(201).json({ message: 'Kebutuhan berhasil diposting', need: rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/industry/needs
exports.getMyNeeds = async (req, res) => {
  // (Fungsi ini tidak berubah)
  try {
    const userId = req.user.user_id;
    const profileResult = await db.query('SELECT profile_id FROM industry_profiles WHERE user_id = $1', [userId]);
    if (profileResult.rows.length === 0) return res.status(404).json({ message: 'Profil Industri tidak ditemukan' });
    const { profile_id } = profileResult.rows[0];
    const { rows } = await db.query(
      'SELECT * FROM industry_needs WHERE industry_profile_id = $1 ORDER BY created_at DESC',
      [profile_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- FUNGSI BARU UNTUK MELIHAT PELAMAR ---
// GET /api/industry/needs/:id
exports.getNeedApplicants = async (req, res) => {
  try {
    const { id } = req.params; // ID Kebutuhan (need_id)

    // 1. Ambil detail kebutuhan
    const needQuery = db.query('SELECT * FROM industry_needs WHERE need_id = $1', [id]);

    // 2. Ambil daftar pelamar (JOIN dengan profil IKM)
    const applicantsQuery = db.query(
      `SELECT a.message, a.created_at, p.nama_usaha, p.no_hp, p.foto_url 
       FROM need_applications a
       JOIN ikm_profiles p ON a.ikm_profile_id = p.profile_id
       WHERE a.need_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    const [needResult, applicantsResult] = await Promise.all([needQuery, applicantsQuery]);

    if (needResult.rows.length === 0) return res.status(404).json({ message: 'Kebutuhan tidak ditemukan' });

    const response = {
      need: needResult.rows[0],
      applicants: applicantsResult.rows
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- FUNGSI BARU UNTUK MENUTUP KEBUTUHAN ---
// PUT /api/industry/needs/:id/status
exports.updateNeedStatus = async (req, res) => {
  try {
    const { id } = req.params; // ID Kebutuhan
    const { status } = req.body; // Status baru (misal: 'closed')

    if (!status || !['open', 'review', 'closed'].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid. Gunakan 'open', 'review', atau 'closed'" });
    }

    const { rows } = await db.query(
      'UPDATE industry_needs SET status = $1 WHERE need_id = $2 RETURNING *',
      [status, id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Kebutuhan tidak ditemukan' });

    res.status(200).json({ message: 'Status kebutuhan diperbarui', need: rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};