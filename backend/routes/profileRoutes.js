import { Router } from "express";
import { getProfile, getProfiles } from "../controllers/profileController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
const router = Router();


router.get('/', authMiddleware, authorizeRoles('ADMIN', 'VOTER'), getProfiles)

router.get('/:id', authMiddleware, authorizeRoles('ADMIN', 'VOTER'), getProfile)

export default router;