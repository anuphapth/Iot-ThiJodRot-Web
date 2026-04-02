import express from 'express';
const router = express.Router();

import usersController from '../controllers/usersController.js';

router.post('/login', usersController.login);
router.post('/logout', usersController.logout);

export default router;