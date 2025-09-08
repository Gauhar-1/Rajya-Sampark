import { Router } from "express"
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import { createPoll, createPost, getFeed, votePoll } from "../controllers/postController.js";
const router = Router();

router.get('/', getFeed);

router.post('/', authMiddleware, createPost);

router.post('/poll', authMiddleware, createPoll);

router.patch('/:id/vote', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), votePoll);

export default router;