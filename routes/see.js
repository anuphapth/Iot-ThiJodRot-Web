import express from 'express';
import { subscribeParkingStatus } from '../controller/sse.js';

const router = express.Router();

router.get('/events', subscribeParkingStatus);

export default router;
