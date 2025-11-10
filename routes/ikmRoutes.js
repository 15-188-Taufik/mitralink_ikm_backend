const express = require('express');
const router = express.Router();

// 1. Impor "Manajer" (Controller)
const { 
  getVerifiedIkms, getPublicIkmById, getUnggulanIkms, // Publik
  getMyProfile, updateMyProfile, updateMyProfilePicture, // Profil IKM
  addProduct, getMyProducts, // Produk IKM
  addRevenue, // Pendapatan IKM
  getAllOpenNeeds, // <-- Rute Papan Kebutuhan
  applyToNeed      // <-- Rute Apply (BARU)
} = require('../controllers/ikmController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

/* ===================================
 * RUTE PUBLIK
 * =================================== */
router.get('/', getVerifiedIkms);
router.get('/unggulan', getUnggulanIkms);

/* ===================================
 * RUTE-RUTE TERPROTEKSI UNTUK IKM
 * =================================== */

// Rute Profil
router.get('/me', protect, authorize('ikm'), getMyProfile);
router.put('/me', protect, authorize('ikm'), updateMyProfile);
router.put('/profile-picture', protect, authorize('ikm'), upload.single('foto_profil'), updateMyProfilePicture);

// Rute Produk
router.post('/products', protect, authorize('ikm'), upload.single('foto_produk'), addProduct);
router.get('/products', protect, authorize('ikm'), getMyProducts);

// Rute Pendapatan
router.post('/revenues', protect, authorize('ikm'), addRevenue);

// Rute Kebutuhan Industri
router.get('/needs', protect, authorize('ikm'), getAllOpenNeeds); 
router.post('/needs/:id/apply', protect, authorize('ikm'), applyToNeed); // <-- RUTE BARU

/* ===================================
 * RUTE PUBLIK DINAMIS (HARUS PALING AKHIR)
 * =================================== */
router.get('/:id', getPublicIkmById); 

module.exports = router;