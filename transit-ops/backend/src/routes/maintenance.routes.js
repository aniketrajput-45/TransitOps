import express from "express";
import {
  getAllLogs,
  createLog,
  closeLog,
} from "../controllers/maintenance.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router
  .route("/")
  .get(getAllLogs)
  .post(createLog);

router.put("/:id/close", closeLog);

export default router;
