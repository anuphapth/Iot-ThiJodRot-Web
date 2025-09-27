import express from 'express';
const router = express.Router();
import { controllPark, parkingData, chart , getpower, getupPower } from '../controller/admin.js';

router.post('/admin/controll', controllPark);
router.get('/parking-data', parkingData);
router.get('/parking/logs',chart);
router.post('/admin/up/power',getpower);
router.get('/admin/getdata/power',getupPower);
export default router;