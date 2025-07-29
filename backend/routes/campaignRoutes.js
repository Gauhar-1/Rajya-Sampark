import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware.js'
import { addCampaign, getCampaigns } from '../controllers/campaignController.js';
const router = Router();

// Get all campign of a volunteer
router.get('/volunteer', authMiddleware, getCampaigns);

// Add a Campaign 
router.post('/', authMiddleware, authorizeRoles('ADMIN', 'VOLUNTEER'), addCampaign);

export default router;

