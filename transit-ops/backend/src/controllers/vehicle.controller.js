import Vehicle from "../models/Vehicle.js";
import FuelLog from "../models/FuelLog.js";
import MaintenanceLog from "../models/MaintenanceLog.js";
import Expense from "../models/Expense.js";

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
export const getAllVehicles = async (req, res) => {
  try {
    const { status, type, region, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (region) {
      filter.region = region;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
      ];
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
export const createVehicle = async (req, res) => {
  try {
    const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, region, status } = req.body;

    // Check unique registration number
    const existingVehicle = await Vehicle.findOne({
      registrationNumber: registrationNumber.toUpperCase(),
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "A vehicle with this registration number already exists",
      });
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      name,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      region,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Vehicle registered successfully",
      vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
export const updateVehicle = async (req, res) => {
  try {
    const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, region, status } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // If changing registration number, check uniqueness
    if (registrationNumber && registrationNumber.toUpperCase() !== vehicle.registrationNumber) {
      const existingVehicle = await Vehicle.findOne({
        registrationNumber: registrationNumber.toUpperCase(),
      });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: "A vehicle with this registration number already exists",
        });
      }
      vehicle.registrationNumber = registrationNumber;
    }

    if (name) vehicle.name = name;
    if (type) vehicle.type = type;
    if (maxLoadCapacity !== undefined) vehicle.maxLoadCapacity = maxLoadCapacity;
    if (odometer !== undefined) vehicle.odometer = odometer;
    if (acquisitionCost !== undefined) vehicle.acquisitionCost = acquisitionCost;
    if (region) vehicle.region = region;
    if (status) vehicle.status = status;

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get vehicle total operational cost breakdown
// @route   GET /api/vehicles/:id/operational-cost
// @access  Private
export const getVehicleOperationalCost = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const [fuelLogs, maintenanceLogs, expenses] = await Promise.all([
      FuelLog.find({ vehicle: vehicleId }),
      MaintenanceLog.find({ vehicle: vehicleId }),
      Expense.find({ vehicle: vehicleId }),
    ]);

    const fuelCostSum = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const maintenanceCostSum = maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
    const otherExpenseSum = expenses.reduce((sum, exp) => sum + exp.cost, 0);

    const totalOperationalCost = fuelCostSum + maintenanceCostSum + otherExpenseSum;

    res.status(200).json({
      success: true,
      vehicle: {
        id: vehicle._id,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
      },
      breakdown: {
        fuel: fuelCostSum,
        maintenance: maintenanceCostSum,
        other: otherExpenseSum,
      },
      totalOperationalCost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
