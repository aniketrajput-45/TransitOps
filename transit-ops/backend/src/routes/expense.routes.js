import express from "express";
import {
  getAllExpenses,
  createExpense,
} from "../controllers/expense.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router
  .route("/")
  .get(getAllExpenses)
  .post(createExpense);

export default router;
