import express from "express";
import {
  getAllFuelLogs,
  createFuelLog,
} from "../controllers/fuel.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router
  .route("/")
  .get(getAllFuelLogs)
  .post(createFuelLog);

export default router;
