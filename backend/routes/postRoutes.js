import { Router } from "express"
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import { createPoll, createPost, deletePost, getComments, getFeed, getFeedById, postComment, takePostAsIssue, updateLikes, votePoll } from "../controllers/postController.js";
const router = Router();

router.get('/', getFeed);

router.get('/:id', getFeedById);

router.post('/', authMiddleware, createPost);

router.post('/poll', authMiddleware, createPoll);

router.patch('/:id/vote', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), votePoll);

router.post('/comment', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), postComment);

router.get('/:id/comment', authMiddleware, getComments);

router.patch('/:id/like', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), updateLikes);

router.delete('/:id/delete', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), deletePost);

router.post('/issue', authMiddleware, authorizeRoles('ADMIN', 'VOLUNTEER', 'CANDIDATE'), takePostAsIssue);

export default router;