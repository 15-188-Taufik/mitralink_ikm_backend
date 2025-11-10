const express = require('express');
const router = express.Router();

// 1. Impor "Manajer" (Controller)
//    (TAMBAHKAN 'getRevenueReports' di sini)
const { 
  getUnverifiedIkms, 
  verifyIkm,
  getRevenueReports // <-- TAMBAHKAN INI
} = require('../controllers/adminController');

// 2. Impor "Penjaga Keamanan" (Middleware) kita
const { protect, authorize } = require('../middleware/authMiddleware');

/* ===================================
 * RUTE-RUTE VERIFIKASI (Sudah ada)
 * =================================== */

// GET /api/admin/unverified
router.get(
  '/unverified', 
  protect,
  authorize('admin'),
  getUnverifiedIkms
);

// PUT /api/admin/verify/:id
router.put(
  '/verify/:id',
  protect,
  authorize('admin'),
  verifyIkm
);

/* ===================================
 * RUTE-RUTE LAPORAN DAMPAK (Baru)
 * =================================== */

// GET /api/admin/reports/revenue
// (Admin melihat semua laporan pendapatan IKM)
router.get(
  '/reports/revenue',
  protect,
  authorize('admin'),
  getRevenueReports // <-- TAMBAHKAN INI
);

// 4. Ekspor router ini
module.exports = router;