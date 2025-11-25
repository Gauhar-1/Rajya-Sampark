import { Router } from 'express';
import { sendOtp, verifyOtp } from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import authValidation from '../validations/authValidation.js';

const router = Router();

router.post('/verify-otp', validate(authValidation.verifyOtpSchema), verifyOtp);
router.post('/send-otp', validate(authValidation.sendOtpSchema), sendOtp);


export default router;
