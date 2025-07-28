import { Router } from 'express';
import { addTask, getTasks } from '../controllers/taskController.js';
import { authMiddleware, authorizeRoles } from '../middleware/authMiddleware.js'
const router = Router();

// Get all tasks for the candidate
router.get('/',authMiddleware, authorizeRoles('ADMIN', 'CANDIDATE'), getTasks);

// Add a new task
router.post('/',authMiddleware,
  authorizeRoles('ADMIN', 'CANDIDATE'), addTask);

export default router;