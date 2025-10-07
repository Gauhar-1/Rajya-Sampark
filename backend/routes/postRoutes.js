import { Router } from "express"
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import { createPoll, createPost, getComments, getFeed, postComment, updateLikes, votePoll } from "../controllers/postController.js";
const router = Router();

router.get('/', getFeed);

router.post('/', authMiddleware, createPost);

router.post('/poll', authMiddleware, createPoll);

router.patch('/:id/vote', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), votePoll);

router.post('/comment', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), postComment);

router.get('/:id/comment', authMiddleware, getComments);

router.patch('/:id/like', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), updateLikes);

export default router;