import { Router } from "express";
import { authorizeRoles , authMiddleware} from "../middleware/authMiddleware.js";
import { deleteCandidate, getAllCandidates, getCandidateById, registerCandidate, updateCandidate } from "../controllers/candidateController.js";
const router = Router();

// ✅ Register a new candidate (only Admin can do this)
router.post(
  '/register',
  authMiddleware,
  authorizeRoles('ADMIN'),
  registerCandidate
);

// ✅ Get all candidates (both Admin & Users can view)
router.get(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'VOTER'),
  getAllCandidates
);

// ✅ Get specific candidate by ID (both Admin & Users can view)
router.get(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'VOTER'),
  getCandidateById
);

// ✅ Update candidate info (only Admin can update)
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  updateCandidate
);

// ✅ Delete a candidate (only Admin can delete)
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN'),
  deleteCandidate
);

export default router