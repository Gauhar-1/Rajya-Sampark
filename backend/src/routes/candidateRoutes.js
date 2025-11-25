import { Router } from "express";
import { authorizeRoles , authMiddleware} from "../middlewares/authMiddleware.js";
import { deleteCandidate, getAllCandidates, getCandidateById, registerCandidate, updateCandidate } from "../controllers/candidateController.js";
const router = Router();

// ✅ Register a new candidate (only Admin can do this)
router.post(
  '/register',
  authMiddleware,
  authorizeRoles('ADMIN'),
  registerCandidate
);

// ✅ Get all candidates 
router.get(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'VOTER','VOLUNTEER','CANDIDATE'),
  getAllCandidates
);

// ✅ Get specific candidate by ID 
router.get(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'VOTER','VOLUNTEER','CANDIDATE'),
  getCandidateById
);

// ✅ Update candidate info 
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  updateCandidate
);

// ✅ Delete a candidate 
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  deleteCandidate
);

export default router
