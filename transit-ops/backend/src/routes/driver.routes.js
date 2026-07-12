import express from "express";
import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../controllers/driver.controller.js";
import { driverValidation } from "../validations/driver.validation.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router
  .route("/")
  .get(getAllDrivers)
  .post(driverValidation, createDriver);

router
  .route("/:id")
  .get(getDriverById)
  .put(driverValidation, updateDriver)
  .delete(deleteDriver);

export default router;
