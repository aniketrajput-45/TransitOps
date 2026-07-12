import Expense from "../models/Expense.js";
import Vehicle from "../models/Vehicle.js";

// @desc    Get all general expenses
// @route   GET /api/expenses
// @access  Private
export const getAllExpenses = async (req, res) => {
  try {
    const { type, vehicleId } = req.query;
    const filter = {};

    if (type) {
      filter.type = type;
    }
    if (vehicleId) {
      filter.vehicle = vehicleId;
    }

    const expenses = await Expense.find(filter)
      .populate("vehicle")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new expense entry manually
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
  try {
    const { vehicle: vehicleId, type, cost, description, date } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (!type || !cost || cost <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid expense type and positive cost are required",
      });
    }

    const expense = await Expense.create({
      vehicle: vehicleId,
      type,
      cost,
      description,
      date: date || new Date(),
    });

    const populatedExpense = await Expense.findById(expense._id).populate("vehicle");

    res.status(201).json({
      success: true,
      message: "Expense logged successfully",
      expense: populatedExpense,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
