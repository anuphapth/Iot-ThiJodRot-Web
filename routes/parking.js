import express from 'express';
const router = express.Router();

import { parking, parkLog, getParkingStatus, subscribeParkingStatus } from '../controller/parking.js';

router.post('/parking', parking);
router.get('/log', parkLog);
router.get('/parking/status', getParkingStatus);
router.get('/events', subscribeParkingStatus);

export default router;