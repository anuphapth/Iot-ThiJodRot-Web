import express from 'express';
const router = express.Router();

import { login} from '../controller/users.js';

router.post('/login',login);

export default router; 