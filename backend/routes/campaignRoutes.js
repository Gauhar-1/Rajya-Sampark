import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware.js'
import { addCampaign, getAllCampaigns, getCampaignById, getCampaigns, updateCampaign } from '../controllers/campaignController.js';
const router = Router();

// Get all campaigns of a volunteer
router.get('/volunteer', authMiddleware, getCampaigns);

// Add a Campaign 
router.post('/', authMiddleware, authorizeRoles('ADMIN', 'VOLUNTEER'), addCampaign);

// Update a Campaign
router.put('/', authMiddleware, authorizeRoles('ADMIN', 'VOLUNTEER'), updateCampaign);

// Get all Campaigns
router.get('/', authMiddleware, getAllCampaigns);

// Get  Campaign by Id
router.get('/:id', authMiddleware, getCampaignById);

export default router;

