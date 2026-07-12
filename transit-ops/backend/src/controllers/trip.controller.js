import Trip from "../models/Trip.js";
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import FuelLog from "../models/FuelLog.js";

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
export const getAllTrips = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (req.user.role === "Driver") {
      const driverProfile = await Driver.findOne({
        name: { $regex: new RegExp("^" + req.user.name + "$", "i") },
      });
      if (driverProfile) {
        filter.driver = driverProfile._id;
      } else {
        return res.status(200).json({
          success: true,
          count: 0,
          trips: [],
        });
      }
    }

    const trips = await Trip.find(filter)
      .populate("vehicle")
      .populate("driver")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("vehicle")
      .populate("driver");

    if (req.user.role === "Driver") {
      const driverProfile = await Driver.findOne({
        name: { $regex: new RegExp("^" + req.user.name + "$", "i") },
      });
      if (!driverProfile || trip.driver._id.toString() !== driverProfile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not assigned to this trip",
        });
      }
    }

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new trip (Draft or Dispatched)
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req, res) => {
  try {
    const { source, destination, vehicle: vehicleId, driver: driverId, cargoWeight, plannedDistance, revenue, status } = req.body;

    // 1. Fetch and validate vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Assigned vehicle not found",
      });
    }

    if (vehicle.status === "Retired" || vehicle.status === "In Shop") {
      return res.status(400).json({
        success: false,
        message: `Vehicle is currently in '${vehicle.status}' status and cannot be assigned`,
      });
    }

    if (vehicle.status === "On Trip") {
      return res.status(400).json({
        success: false,
        message: "Vehicle is currently assigned to another active trip",
      });
    }

    if (cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({
        success: false,
        message: `Cargo weight (${cargoWeight} kg) exceeds vehicle's maximum capacity (${vehicle.maxLoadCapacity} kg)`,
      });
    }

    // 2. Fetch and validate driver
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Assigned driver not found",
      });
    }

    if (driver.status === "Suspended" || driver.status === "Off Duty") {
      return res.status(400).json({
        success: false,
        message: `Driver status is '${driver.status}' and cannot be assigned`,
      });
    }

    if (driver.status === "On Trip") {
      return res.status(400).json({
        success: false,
        message: "Driver is currently assigned to another active trip",
      });
    }

    // Check license expiry
    const today = new Date();
    if (new Date(driver.licenseExpiryDate) < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign driver: commercial driver license is expired",
      });
    }

    // Determine target status
    const targetStatus = status === "Dispatched" ? "Dispatched" : "Draft";

    // 3. Create trip
    const trip = await Trip.create({
      source,
      destination,
      vehicle: vehicleId,
      driver: driverId,
      cargoWeight,
      plannedDistance,
      revenue,
      status: targetStatus,
    });

    // 4. Update statuses if dispatched directly
    if (targetStatus === "Dispatched") {
      vehicle.status = "On Trip";
      driver.status = "On Trip";
      await vehicle.save();
      await driver.save();
    }

    // Populate references to return rich data
    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    res.status(201).json({
      success: true,
      message: targetStatus === "Dispatched" ? "Trip dispatched successfully" : "Trip draft created successfully",
      trip: populatedTrip,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Dispatch a draft trip
// @route   PUT /api/trips/:id/dispatch
// @access  Private
export const dispatchTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message: `Trip is in '${trip.status}' status and cannot be dispatched`,
      });
    }

    // Get vehicle and driver
    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    if (!vehicle || !driver) {
      return res.status(404).json({
        success: false,
        message: "Assigned vehicle or driver not found",
      });
    }

    // Ensure they are still available
    if (vehicle.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: `Vehicle is not available (status: ${vehicle.status})`,
      });
    }

    if (driver.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: `Driver is not available (status: ${driver.status})`,
      });
    }

    // License expiry check again in case of delay
    if (new Date(driver.licenseExpiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot dispatch: driver's license has expired since creation",
      });
    }

    // Perform state changes
    trip.status = "Dispatched";
    vehicle.status = "On Trip";
    driver.status = "On Trip";

    await trip.save();
    await vehicle.save();
    await driver.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    res.status(200).json({
      success: true,
      message: "Trip dispatched successfully",
      trip: populatedTrip,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Complete a dispatched trip
// @route   PUT /api/trips/:id/complete
// @access  Private
export const completeTrip = async (req, res) => {
  try {
    const { finalOdometer, fuelConsumedLiters, fuelCost, actualDistance } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.status !== "Dispatched") {
      return res.status(400).json({
        success: false,
        message: `Only dispatched trips can be completed. Current status: ${trip.status}`,
      });
    }

    // Get vehicle and driver
    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    if (!vehicle || !driver) {
      return res.status(404).json({
        success: false,
        message: "Assigned vehicle or driver not found",
      });
    }

    // Validate odometer reading
    if (finalOdometer === undefined || finalOdometer === null) {
      return res.status(400).json({
        success: false,
        message: "Final odometer reading is required to complete the trip",
      });
    }

    if (finalOdometer < vehicle.odometer) {
      return res.status(400).json({
        success: false,
        message: `Final odometer (${finalOdometer} km) cannot be less than vehicle's current odometer (${vehicle.odometer} km)`,
      });
    }

    // Update trip details
    trip.status = "Completed";
    trip.actualDistance = actualDistance !== undefined ? actualDistance : trip.plannedDistance;
    trip.completedAt = new Date();

    if (fuelConsumedLiters !== undefined) trip.fuelConsumedLiters = fuelConsumedLiters;
    if (fuelCost !== undefined) trip.fuelCost = fuelCost;

    // Update vehicle
    vehicle.odometer = finalOdometer;
    vehicle.status = "Available";

    // Update driver
    driver.status = "Available";

    await trip.save();
    await vehicle.save();
    await driver.save();

    // Create a Fuel Log entry if fuel data was recorded
    if (fuelConsumedLiters && fuelCost) {
      await FuelLog.create({
        vehicle: vehicle._id,
        trip: trip._id,
        liters: fuelConsumedLiters,
        cost: fuelCost,
        date: new Date(),
      });
    }

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    res.status(200).json({
      success: true,
      message: "Trip completed and vehicle/driver logs updated",
      trip: populatedTrip,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel a draft or dispatched trip
// @route   PUT /api/trips/:id/cancel
// @access  Private
export const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.status === "Completed" || trip.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a trip that is already ${trip.status}`,
      });
    }

    // Restore vehicle and driver to Available if it was Dispatched
    if (trip.status === "Dispatched") {
      const vehicle = await Vehicle.findById(trip.vehicle);
      const driver = await Driver.findById(trip.driver);

      if (vehicle) {
        vehicle.status = "Available";
        await vehicle.save();
      }
      if (driver) {
        driver.status = "Available";
        await driver.save();
      }
    }

    trip.status = "Cancelled";
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    res.status(200).json({
      success: true,
      message: "Trip cancelled successfully",
      trip: populatedTrip,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
