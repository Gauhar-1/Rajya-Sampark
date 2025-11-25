import { Router } from 'express';
import { addTask, getTasks, getTasksForVolunteer, updateStatus } from '../controllers/taskController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware.js'
const router = Router();

// Get all tasks for the candidate
router.get('/',authMiddleware, authorizeRoles('ADMIN', 'CANDIDATE'), getTasks);

// Add a new task
router.post('/',authMiddleware,
  authorizeRoles('ADMIN', 'CANDIDATE'), addTask);

// Get all tasks for the volunteer
router.get('/volunteer',authMiddleware, authorizeRoles('ADMIN', 'VOLUNTEER'), getTasksForVolunteer);

// Status change from volunteer
router.patch('/:id/status', authMiddleware,authorizeRoles('ADMIN', 'VOLUNTEER'), updateStatus )

export default router;
