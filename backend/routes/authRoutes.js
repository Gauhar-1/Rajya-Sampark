import { Router } from 'express';
import { sendOtp, verifyOtp } from '../controllers/authController.js';
const router = Router();

router.post('/verify-otp', verifyOtp);
router.post('/send-otp', sendOtp);


export default router;
