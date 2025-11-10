const multer = require('multer');

// Kita akan menyimpan file di memori server untuk sementara
const storage = multer.memoryStorage();

// Fungsi untuk memfilter file: hanya izinkan gambar
const fileFilter = (req, file, cb) => {
  // Cek tipe file (MIME type)
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif'
  ) {
    // Terima file
    cb(null, true);
  } else {
    // Tolak file
    cb(new Error('Jenis file tidak diizinkan, hanya JPEG, PNG, GIF.'), false);
  }
};

// Inisialisasi Multer dengan konfigurasi di atas
// Kita batasi ukuran file 5MB
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 Megabyte
  },
  fileFilter: fileFilter,
});

// Ekspor middleware 'upload' ini
module.exports = upload;