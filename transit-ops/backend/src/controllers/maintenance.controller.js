import MaintenanceLog from "../models/MaintenanceLog.js";
import Vehicle from "../models/Vehicle.js";

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Private
export const getAllLogs = async (req, res) => {
  try {
    const { status, vehicleId } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (vehicleId) {
      filter.vehicle = vehicleId;
    }

    const logs = await MaintenanceLog.find(filter)
      .populate("vehicle")
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

// @desc    Create an active maintenance record
// @route   POST /api/maintenance
// @access  Private
export const createLog = async (req, res) => {
  try {
    const { vehicle: vehicleId, description, cost, startDate } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    if (vehicle.status === "Retired") {
      return res.status(400).json({
        success: false,
        message: "Cannot log maintenance for a retired vehicle",
      });
    }

    if (vehicle.status === "On Trip") {
      return res.status(400).json({
        success: false,
        message: "Vehicle is currently on a trip and cannot be placed in shop maintenance",
      });
    }

    if (vehicle.status === "In Shop") {
      return res.status(400).json({
        success: false,
        message: "Vehicle is already in shop maintenance",
      });
    }

    // Create log in Active status
    const log = await MaintenanceLog.create({
      vehicle: vehicleId,
      description,
      cost: cost !== undefined ? cost : 0,
      status: "Active",
      startDate: startDate || new Date(),
    });

    // Automatically switch vehicle status to In Shop
    vehicle.status = "In Shop";
    await vehicle.save();

    const populatedLog = await MaintenanceLog.findById(log._id).populate("vehicle");

    res.status(201).json({
      success: true,
      message: "Vehicle placed in maintenance log successfully",
      log: populatedLog,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Close an active maintenance record
// @route   PUT /api/maintenance/:id/close
// @access  Private
export const closeLog = async (req, res) => {
  try {
    const { cost } = req.body;

    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Maintenance log not found",
      });
    }

    if (log.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Maintenance log is already closed",
      });
    }

    if (cost === undefined || cost === null || cost < 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid final maintenance cost",
      });
    }

    // Close log
    log.status = "Closed";
    log.cost = cost;
    log.endDate = new Date();
    await log.save();

    // Restore vehicle to Available (unless retired)
    const vehicle = await Vehicle.findById(log.vehicle);
    if (vehicle && vehicle.status !== "Retired") {
      vehicle.status = "Available";
      await vehicle.save();
    }

    const populatedLog = await MaintenanceLog.findById(log._id).populate("vehicle");

    res.status(200).json({
      success: true,
      message: "Maintenance log closed and vehicle returned to fleet selection pool",
      log: populatedLog,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
