import express from 'express';
const router = express.Router();
import { controllPark, parkingData, chart , getpower } from '../controller/admin.js';

router.post('/admin/controll', controllPark);
router.get('/parking-data', parkingData);
router.get('/parking/logs',chart);
router.post('/admin/up/power',getpower);
export default router;