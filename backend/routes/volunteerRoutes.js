import { Router } from "express";
const router = Router();
import { authMiddleware } from "../middleware/authMiddleware.js"
import { createVolunteer, getAllVolunteers, updateVolunteerStatus } from "../controllers/volunteerController.js";

//  Create a new volunteer
router.post('/', authMiddleware, createVolunteer);

//  Get all volunteers of a candidate
router.get('/', authMiddleware, getAllVolunteers);

//  Approve or reject a volunteer
router.patch('/:id/status',  authMiddleware, updateVolunteerStatus);

export default router;