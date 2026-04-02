import express from 'express';
const router = express.Router();
import adminController from '../controllers/adminController.js';

router.post('/admin/controll', adminController.controlParkingSlot);
router.get('/parking-data', adminController.getParkingData);
router.get('/parking/logs', adminController.getChart);
router.post('/admin/up/power', adminController.addPowerReading);
router.get('/admin/getdata/power', adminController.getPowerStats);
export default router;