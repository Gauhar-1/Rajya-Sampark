import { Router } from 'express';
import express from 'express';
import { handleClerkWebhook } from '../controllers/webhookController.js';

const router = Router();

// Need raw body for svix verification
router.post('/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

export default router;
