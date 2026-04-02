import express from 'express';
import sseController from '../controllers/sseController.js';

const router = express.Router();

router.get('/events', sseController.subscribeParkingStatus);

export default router;
