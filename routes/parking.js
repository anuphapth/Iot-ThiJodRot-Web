import express from 'express';
const router = express.Router();

import { parking, parkLog, getParkingStatus } from '../controller/parking.js';

router.post('/parking', parking);
router.get('/log', parkLog);
router.get('/parking/status', getParkingStatus);

export default router;