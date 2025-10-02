import { Router } from "express";
import { createGroup, getGroups } from "../controllers/chatController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/',authMiddleware, authorizeRoles('CANDIDATE', 'ADMIN'), createGroup);

router.get('/',authMiddleware, authorizeRoles('CANDIDATE', "ADMIN"), getGroups);

export default router;
