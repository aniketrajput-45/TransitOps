import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import Trip from "../models/Trip.js";

// @desc    Get dashboard summary statistics & KPIs
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const { type, status, region } = req.query;

    // Build filter for vehicles
    const vehicleFilter = {};
    if (type) vehicleFilter.type = type;
    if (status) vehicleFilter.status = status;
    if (region) vehicleFilter.region = region;

    // Fetch filtered vehicles and overall counts
    const filteredVehicles = await Vehicle.find(vehicleFilter);
    const allDrivers = await Driver.find({});
    const allTrips = await Trip.find({});

    const totalFleet = filteredVehicles.length;
    const available = filteredVehicles.filter(v => v.status === "Available").length;
    const activeVehicles = filteredVehicles.filter(v => v.status === "On Trip").length;
    const inShop = filteredVehicles.filter(v => v.status === "In Shop").length;
    const retired = filteredVehicles.filter(v => v.status === "Retired").length;

    // Fleet utilization: active / (total - retired) * 100
    const nonRetiredCount = totalFleet - retired;
    const utilizationRate = nonRetiredCount > 0 ? (activeVehicles / nonRetiredCount) * 100 : 0;

    // Trips KPI
    const activeTrips = allTrips.filter(t => t.status === "Dispatched").length;
    const pendingTrips = allTrips.filter(t => t.status === "Draft").length;

    // Drivers KPI
    const driversOnDuty = allDrivers.filter(d => d.status === "On Trip").length;

    res.status(200).json({
      success: true,
      stats: {
        totalFleet,
        available,
        activeVehicles,
        inShop,
        retired,
        utilizationRate,
        activeTrips,
        pendingTrips,
        driversOnDuty,
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
