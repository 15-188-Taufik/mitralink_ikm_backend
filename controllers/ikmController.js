const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

/* ===================================
 * FUNGSI: PUBLIK MENDAPATKAN IKM TERVERIFIKASI
 * @route   GET /api/ikm
 * =================================== */
exports.getVerifiedIkms = async (req, res) => {
  try {
    const query = `
      SELECT p.profile_id, p.nama_usaha, p.alamat, p.foto_url, p.deskripsi,
             string_agg(c.nama_kategori, ', ') AS kategori 
      FROM ikm_profiles p
      LEFT JOIN ikm_categories ic ON p.profile_id = ic.ikm_profile_id
      LEFT JOIN categories c ON ic.category_id = c.category_id
      WHERE p.is_verified = true
      GROUP BY p.profile_id ORDER BY p.nama_usaha ASC;
    `;
    const { rows } = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: PUBLIK MENDAPATKAN IKM UNGGULAN (HOMEPAGE)
 * @route   GET /api/ikm/unggulan
 * =================================== */
exports.getUnggulanIkms = async (req, res) => {
  try {
    const query = `
      SELECT p.profile_id, p.nama_usaha, p.alamat, p.foto_url,
             string_agg(c.nama_kategori, ', ') AS kategori 
      FROM ikm_profiles p
      LEFT JOIN ikm_categories ic ON p.profile_id = ic.ikm_profile_id
      LEFT JOIN categories c ON ic.category_id = c.category_id
      WHERE p.is_verified = true
      GROUP BY p.profile_id ORDER BY RANDOM() LIMIT 3 
    `;
    const { rows } = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: PUBLIK MENDAPATKAN DETAIL 1 IKM
 * @route   GET /api/ikm/:id
 * =================================== */
exports.getPublicIkmById = async (req, res) => {
  try {
    const { id } = req.params;
    const profileQuery = db.query('SELECT * FROM ikm_profiles WHERE profile_id = $1 AND is_verified = true', [id]);
    const productsQuery = db.query('SELECT * FROM products WHERE ikm_profile_id = $1', [id]);
    const [profileResult, productsResult] = await Promise.all([profileQuery, productsQuery]);
    if (profileResult.rows.length === 0) return res.status(404).json({ message: 'IKM tidak ditemukan' });
    const ikm = profileResult.rows[0];
    ikm.products = productsResult.rows;
    res.status(200).json(ikm);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: IKM MENDAPATKAN PROFIL SENDIRI
 * @route   GET /api/ikm/me
 * =================================== */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { rows } = await db.query(
      'SELECT * FROM ikm_profiles WHERE user_id = $1', 
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Profil IKM tidak ditemukan' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: IKM MENGUPDATE PROFIL TEKS SENDIRI
 * @route   PUT /api/ikm/me
 * =================================== */
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { 
      nama_usaha, nama_pemilik, alamat, no_hp, 
      link_ecommerce, foto_url, deskripsi 
    } = req.body;
    const query = `
      UPDATE ikm_profiles
      SET nama_usaha = $1, nama_pemilik = $2, alamat = $3, no_hp = $4, 
          link_ecommerce = $5, foto_url = $6, deskripsi = $7
      WHERE user_id = $8
      RETURNING * `;
    const params = [
      nama_usaha, nama_pemilik, alamat, no_hp, 
      link_ecommerce, foto_url, deskripsi, userId
    ];
    const { rows } = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Profil IKM tidak ditemukan' });
    }
    res.status(200).json({
      message: 'Profil berhasil diperbarui',
      profile: rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: IKM MENGUPDATE FOTO PROFIL
 * @route   PUT /api/ikm/profile-picture
 * =================================== */
exports.updateMyProfilePicture = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'Foto profil dibutuhkan' });
    }
    const userId = req.user.user_id;
    const b64 = Buffer.from(file.buffer).toString('base64');
    let dataURI = "data:" + file.mimetype + ";base64," + b64;
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'mitralink/profiles', 
    });
    const foto_profil_url = uploadResult.secure_url;
    const { rows } = await db.query(
      `UPDATE ikm_profiles SET foto_url = $1 WHERE user_id = $2 RETURNING *`,
      [foto_profil_url, userId]
    );
    res.status(200).json({ 
      message: 'Foto profil berhasil diperbarui', 
      profile: rows[0] 
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: IKM MENAMBAHKAN PRODUK BARU (CLOUDINARY)
 * @route   POST /api/ikm/products
 * =================================== */
exports.addProduct = async (req, res) => {
  try {
    const { nama_produk, deskripsi_produk } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'Foto produk dibutuhkan' });
    }
    if (!nama_produk) {
      return res.status(400).json({ message: 'Nama produk dibutuhkan' });
    }
    const userId = req.user.user_id;
    const profileResult = await db.query(
      'SELECT profile_id FROM ikm_profiles WHERE user_id = $1',
      [userId]
    );
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profil IKM tidak ditemukan' });
    }
    const { profile_id } = profileResult.rows[0];
    const b64 = Buffer.from(file.buffer).toString('base64');
    let dataURI = "data:" + file.mimetype + ";base64," + b64;
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'mitralink/products', 
    });
    const foto_produk_url = uploadResult.secure_url;
    const query = `
      INSERT INTO products (ikm_profile_id, nama_produk, deskripsi_produk, foto_produk_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [profile_id, nama_produk, deskripsi_produk, foto_produk_url];
    const { rows } = await db.query(query, params);
    res.status(201).json({ 
      message: 'Produk berhasil diunggah dan ditambahkan', 
      product: rows[0] 
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: IKM MENDAPATKAN SEMUA PRODUK MEREKA
 * @route   GET /api/ikm/products
 * =================================== */
exports.getMyProducts = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const profileResult = await db.query(
      'SELECT profile_id FROM ikm_profiles WHERE user_id = $1',
      [userId]
    );
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profil IKM tidak ditemukan' });
    }
    const { profile_id } = profileResult.rows[0];
    const { rows } = await db.query(
      'SELECT * FROM products WHERE ikm_profile_id = $1 ORDER BY product_id DESC',
      [profile_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: IKM MELAPORKAN PENDAPATAN
 * @route   POST /api/ikm/revenues
 * =================================== */
exports.addRevenue = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { bulan, tahun, jumlah_pendapatan } = req.body;
    if (!bulan || !tahun || !jumlah_pendapatan) {
      return res.status(400).json({ message: 'Bulan, tahun, dan jumlah pendapatan dibutuhkan' });
    }
    const profileResult = await db.query(
      'SELECT profile_id FROM ikm_profiles WHERE user_id = $1',
      [userId]
    );
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profil IKM tidak ditemukan' });
    }
    const { profile_id } = profileResult.rows[0];
    const query = `
      INSERT INTO revenues (ikm_profile_id, bulan, tahun, jumlah_pendapatan)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [profile_id, bulan, tahun, jumlah_pendapatan];
    const { rows } = await db.query(query, params);
    res.status(201).json({ 
      message: 'Laporan pendapatan berhasil ditambahkan', 
      revenue: rows[0] 
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: IKM MELIHAT SEMUA KEBUTUHAN (PAPAN KEBUTUHAN)
 * @route   GET /api/ikm/needs
 * =================================== */
exports.getAllOpenNeeds = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const profileResult = await db.query('SELECT profile_id FROM ikm_profiles WHERE user_id = $1', [userId]);
    if (profileResult.rows.length === 0) return res.status(404).json({ message: 'Profil IKM tidak ditemukan' });
    const ikmProfileId = profileResult.rows[0].profile_id;

    const query = `
      SELECT 
        n.need_id, n.judul_kebutuhan, n.deskripsi, n.created_at, n.status,
        p.nama_perusahaan, p.sektor_industri, p.no_hp,
        CASE WHEN a.ikm_profile_id IS NOT NULL THEN true ELSE false END AS sudah_melamar
      FROM industry_needs n
      JOIN industry_profiles p ON n.industry_profile_id = p.profile_id
      LEFT JOIN need_applications a ON n.need_id = a.need_id AND a.ikm_profile_id = $1
      WHERE n.status = 'open' OR n.status = 'review'
      ORDER BY n.created_at DESC
    `;
    
    const { rows } = await db.query(query, [ikmProfileId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/* ===================================
 * FUNGSI: IKM MELAMAR KEBUTUHAN
 * @route   POST /api/ikm/needs/:id/apply
 * =================================== */
exports.applyToNeed = async (req, res) => {
  try {
    const { id } = req.params; // ID Kebutuhan (need_id)
    const { message } = req.body; // Pesan lamaran dari IKM
    const userId = req.user.user_id;

    const profileResult = await db.query('SELECT profile_id FROM ikm_profiles WHERE user_id = $1', [userId]);
    if (profileResult.rows.length === 0) return res.status(404).json({ message: 'Profil IKM tidak ditemukan' });
    const ikmProfileId = profileResult.rows[0].profile_id;

    const insertQuery = `
      INSERT INTO need_applications (need_id, ikm_profile_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await db.query(insertQuery, [id, ikmProfileId, message]);

    await db.query("UPDATE industry_needs SET status = 'review' WHERE need_id = $1", [id]);

    res.status(201).json({ message: 'Lamaran berhasil terkirim', application: rows[0] });
  } catch (error) {
    if (error.code === '23505') { // unique_violation
      return res.status(400).json({ message: 'Anda sudah pernah melamar kebutuhan ini' });
    }
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};