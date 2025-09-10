import express from 'express';
const router = express.Router();
import { controllPark, parkingData, chart } from '../controller/admin.js';

router.post('/admin/controll', controllPark);
router.get('/parking-data', parkingData);
router.get('/parking/logs',chart);
export default router;