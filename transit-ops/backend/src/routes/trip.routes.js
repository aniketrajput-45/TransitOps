import express from "express";
import {
  getAllTrips,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from "../controllers/trip.controller.js";
import { tripValidation } from "../validations/trip.validation.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router
  .route("/")
  .get(getAllTrips)
  .post(tripValidation, createTrip);

router.route("/:id").get(getTripById);
router.put("/:id/dispatch", dispatchTrip);
router.put("/:id/complete", completeTrip);
router.put("/:id/cancel", cancelTrip);

export default router;
