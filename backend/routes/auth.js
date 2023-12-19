import express from 'express';
const router = express.Router();



import authController from '../controllers/auth.js';
import loginLimiter from '../middleware/loginLimiter.js';

router
    .post('/', loginLimiter, authController.login);

router
    .get('/refresh', authController.refresh);

router
    .post('/logout',authController.logout);

export default router;
