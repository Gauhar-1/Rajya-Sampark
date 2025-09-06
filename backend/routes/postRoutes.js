import { Router } from "express"
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createPoll, createPost } from "../controllers/postController.js";
const router = Router();

router.post('/', authMiddleware, createPost);

router.post('/poll', authMiddleware, createPoll);


export default router;