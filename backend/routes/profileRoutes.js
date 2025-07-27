import { Router } from "express";
import { getProfile, getProfiles, updateUserRole, updateUserStatus } from "../controllers/profileController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
const router = Router();

// Get all profiles
router.get('/', authMiddleware, authorizeRoles('ADMIN', 'VOTER'), getProfiles)

// Get single Profile
router.get('/:id', authMiddleware, authorizeRoles('ADMIN', 'VOTER'), getProfile)

// patch role
router.patch('/:id/role', authMiddleware, authorizeRoles('ADMIN'), updateUserRole)

// patch status
router.patch('/:id/status', authMiddleware, authorizeRoles('ADMIN'), updateUserStatus)

export default router;