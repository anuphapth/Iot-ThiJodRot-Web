import express from 'express';
const router = express.Router();

import parkingController from '../controllers/parkingController.js';

router.post('/parking', parkingController.updateParkingStatus);
router.get('/log', parkingController.getParkingLogs);
router.get('/parking/status', parkingController.getParkingStatus);

export default router;