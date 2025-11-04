import { Router } from "express"
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import { createPoll, createPost, deleteIssuePost, deletePost, getComments, getFeed, getFeedById, getIssuePost, getIssuesForCandidate, givePermissionForIssuePost, postComment, takePermissionForIssuePost, takePostAsIssue, updateLikes, votePoll } from "../controllers/postController.js";
const router = Router();

router.get('/', getFeed);

router.get('/issue', authMiddleware, authorizeRoles('ADMIN', 'VOLUNTEER', 'CANDIDATE'), getIssuePost);

router.get('/issue/candidate', authMiddleware, authorizeRoles('ADMIN' , 'CANDIDATE'), getIssuesForCandidate)

router.get('/:id', getFeedById);

router.post('/', authMiddleware, createPost);

router.post('/poll', authMiddleware, createPoll);

router.patch('/:id/vote', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), votePoll);

router.post('/comment', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), postComment);

router.get('/:id/comment', authMiddleware, getComments);

router.patch('/issue/:id', authMiddleware, authorizeRoles('ADMIN', 'VOLUNTEER'), takePermissionForIssuePost);

router.patch('/issue/:id/status', authMiddleware, authorizeRoles('CANDIDATE', 'ADMIN'), givePermissionForIssuePost);

router.patch('/:id/like', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), updateLikes);

router.delete('/issue/:id', authMiddleware, authorizeRoles('ADMIN', 'VOLUNTEER', 'CANDIDATE'), deleteIssuePost);

router.delete('/:id/delete', authMiddleware, authorizeRoles('VOTER', 'ADMIN', 'VOLUNTEER', 'CANDIDATE'), deletePost);

router.post('/issue', authMiddleware, authorizeRoles('ADMIN', 'VOLUNTEER', 'CANDIDATE'), takePostAsIssue);


export default router;