import FuelLog from "../models/FuelLog.js";
import Vehicle from "../models/Vehicle.js";

// @desc    Get all fuel logs
// @route   GET /api/fuel-logs
// @access  Private
export const getAllFuelLogs = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const filter = {};

    if (vehicleId) {
      filter.vehicle = vehicleId;
    }

    const logs = await FuelLog.find(filter)
      .populate("vehicle")
      .populate("trip")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new fuel log manually
// @route   POST /api/fuel-logs
// @access  Private
export const createFuelLog = async (req, res) => {
  try {
    const { vehicle: vehicleId, liters, cost, date } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (!liters || liters <= 0 || !cost || cost <= 0) {
      return res.status(400).json({
        success: false,
        message: "Liters and cost must be positive numbers",
      });
    }

    const log = await FuelLog.create({
      vehicle: vehicleId,
      liters,
      cost,
      date: date || new Date(),
    });

    const populatedLog = await FuelLog.findById(log._id).populate("vehicle");

    res.status(201).json({
      success: true,
      message: "Fuel purchase logged successfully",
      log: populatedLog,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
