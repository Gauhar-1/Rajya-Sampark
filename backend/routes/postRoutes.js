import { Router } from "express"
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createPost } from "../controllers/postController.js";
const router = Router();

router.post('/', authMiddleware, createPost);

export default router;