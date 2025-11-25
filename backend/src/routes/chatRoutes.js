import { Router } from "express";
import { createGroup, getGroups, getGroupsForVolunter } from "../controllers/chatController.js";
import { authMiddleware, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

router.post('/',authMiddleware, authorizeRoles('CANDIDATE', 'ADMIN'), createGroup);

router.get('/',authMiddleware, authorizeRoles('CANDIDATE', "ADMIN"), getGroups);

router.get('/volunteer',authMiddleware, authorizeRoles('VOLUNTEER', "ADMIN"), getGroupsForVolunter);

export default router;
