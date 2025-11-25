import { Router } from "express";
import { createTimeline, deleteTimeline, getTimelines, updateTimeline } from "../controllers/timelineController.js";
import { authMiddleware, authorizeRoles } from "../middlewares/authMiddleware.js"
const router = Router();

// Get All Timelines
router.get('/', authMiddleware, authorizeRoles('ADMIN', 'VOTER', 'VOLUNTEER','CANDIDATE'), getTimelines);

// Add a Timeline
router.post('/', authMiddleware, authorizeRoles('ADMIN'), createTimeline);

// Update a Timeline
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), updateTimeline);

// Delete a Timeline
router.post('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteTimeline);

export default router;
