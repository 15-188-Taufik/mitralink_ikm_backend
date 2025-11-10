const express = require('express');
const router = express.Router();

// 1. Impor "Manajer" (Controller)
const { 
  getMyProfile, 
  updateMyProfile,
  createNeed,
  getMyNeeds,
  getNeedApplicants, // <-- BARU
  updateNeedStatus   // <-- BARU
} = require('../controllers/industryController');

// 2. Impor "Penjaga Keamanan" (Middleware) kita
const { protect, authorize } = require('../middleware/authMiddleware');

/* ===================================
 * RUTE-RUTE PROFIL
 * =================================== */
router.get('/me', protect, authorize('industri'), getMyProfile);
router.put('/me', protect, authorize('industri'), updateMyProfile);

/* ===================================
 * RUTE-RUTE PAPAN KEBUTUHAN
 * =================================== */
router.post('/needs', protect, authorize('industri'), createNeed);
router.get('/needs', protect, authorize('industri'), getMyNeeds);

// Rute baru untuk melihat detail 1 kebutuhan + pelamarnya
router.get('/needs/:id', protect, authorize('industri'), getNeedApplicants);

// Rute baru untuk mengubah status (misal: 'closed')
router.put('/needs/:id/status', protect, authorize('industri'), updateNeedStatus);

module.exports = router;