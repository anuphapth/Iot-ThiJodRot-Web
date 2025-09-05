import express from 'express';
const router = express.Router();
import { controllPark } from '../controller/admin.js';

router.post('/admin/controll', controllPark);

export default router;