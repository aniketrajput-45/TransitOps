import Vehicle from "../models/Vehicle.js";
import Trip from "../models/Trip.js";
import FuelLog from "../models/FuelLog.js";
import MaintenanceLog from "../models/MaintenanceLog.js";
import Expense from "../models/Expense.js";

// @desc    Get aggregated operational report statistics & vehicle analytics
// @route   GET /api/reports/analytics
// @access  Private
export const getReportsData = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: { $ne: "Retired" } });

    const reportEntries = await Promise.all(
      vehicles.map(async (v) => {
        // Query related details
        const [completedTrips, fuelLogs, maintenanceLogs, expenses] = await Promise.all([
          Trip.find({ vehicle: v._id, status: "Completed" }),
          FuelLog.find({ vehicle: v._id }),
          MaintenanceLog.find({ vehicle: v._id, status: "Closed" }),
          Expense.find({ vehicle: v._id }),
        ]);

        // Accumulate values
        const totalDistance = completedTrips.reduce(
          (sum, t) => sum + (t.actualDistance || t.plannedDistance || 0),
          0
        );

        const totalRevenue = completedTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);
        const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + (f.liters || 0), 0);
        const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0);
        const totalMaintenanceCost = maintenanceLogs.reduce((sum, m) => sum + (m.cost || 0), 0);
        const totalOtherCost = expenses.reduce((sum, e) => sum + (e.cost || 0), 0);

        // Calculations
        const fuelEfficiency = totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;
        const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalOtherCost;
        
        // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
        const divisor = v.acquisitionCost || 1;
        const roi = (totalRevenue - (totalMaintenanceCost + totalFuelCost)) / divisor;

        return {
          vehicle: {
            id: v._id,
            registrationNumber: v.registrationNumber,
            name: v.name,
            type: v.type,
            acquisitionCost: v.acquisitionCost,
            status: v.status,
          },
          totalDistance,
          totalRevenue,
          totalFuelLiters,
          totalFuelCost,
          totalMaintenanceCost,
          totalOtherCost,
          totalOperationalCost,
          fuelEfficiency,
          roi: roi * 100, // as percentage
        };
      })
    );

    // Fleet level totals
    const fleetTotals = {
      totalRevenue: reportEntries.reduce((sum, entry) => sum + entry.totalRevenue, 0),
      totalFuelCost: reportEntries.reduce((sum, entry) => sum + entry.totalFuelCost, 0),
      totalMaintenanceCost: reportEntries.reduce((sum, entry) => sum + entry.totalMaintenanceCost, 0),
      totalOtherCost: reportEntries.reduce((sum, entry) => sum + entry.totalOtherCost, 0),
      totalOperationalCost: reportEntries.reduce((sum, entry) => sum + entry.totalOperationalCost, 0),
    };

    // Averages
    const vehiclesWithFuel = reportEntries.filter(e => e.totalFuelLiters > 0);
    const avgFuelEfficiency = vehiclesWithFuel.length > 0 
      ? vehiclesWithFuel.reduce((sum, e) => sum + e.fuelEfficiency, 0) / vehiclesWithFuel.length 
      : 0;

    const avgROI = reportEntries.reduce((sum, e) => sum + e.roi, 0) / reportEntries.length;

    res.status(200).json({
      success: true,
      summary: {
        totals: fleetTotals,
        averages: {
          avgFuelEfficiency,
          avgROI,
        }
      },
      reports: reportEntries,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
