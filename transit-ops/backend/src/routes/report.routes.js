import express from "express";
import { getReportsData } from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.get("/analytics", getReportsData);

export default router;
