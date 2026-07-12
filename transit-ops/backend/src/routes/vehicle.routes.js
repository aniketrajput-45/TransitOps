import express from "express";
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleOperationalCost,
} from "../controllers/vehicle.controller.js";
import { vehicleValidation } from "../validations/vehicle.validation.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.get("/:id/operational-cost", getVehicleOperationalCost);

router
  .route("/")
  .get(getAllVehicles)
  .post(vehicleValidation, createVehicle);

router
  .route("/:id")
  .get(getVehicleById)
  .put(vehicleValidation, updateVehicle)
  .delete(deleteVehicle);

export default router;
