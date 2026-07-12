import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

// Models
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import Trip from "../models/Trip.js";
import FuelLog from "../models/FuelLog.js";
import MaintenanceLog from "../models/MaintenanceLog.js";
import Expense from "../models/Expense.js";

dotenv.config();

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB Database...");
    await connectDB();

    console.log("\n--- Cleaning Existing Operational Data ---");
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Trip.deleteMany({});
    await FuelLog.deleteMany({});
    await MaintenanceLog.deleteMany({});
    await Expense.deleteMany({});
    console.log("Operational collections cleaned successfully.");

    console.log("\n--- Seeding Fleet Vehicles ---");
    const vehiclesList = [
      {
        registrationNumber: "MH-12-TR-9901",
        name: "Tata Prima 4923.S",
        type: "Truck",
        maxLoadCapacity: 25000,
        odometer: 15400,
        acquisitionCost: 45000,
        region: "North",
        status: "On Trip",
      },
      {
        registrationNumber: "MH-12-TR-8822",
        name: "Mahindra Blazo X 35",
        type: "Truck",
        maxLoadCapacity: 18000,
        odometer: 8200,
        acquisitionCost: 38000,
        region: "South",
        status: "Available",
      },
      {
        registrationNumber: "MH-12-VN-3004",
        name: "Force Traveller 3050",
        type: "Van",
        maxLoadCapacity: 4000,
        odometer: 32000,
        acquisitionCost: 15000,
        region: "East",
        status: "In Shop",
      },
      {
        registrationNumber: "MH-12-SD-5001",
        name: "Toyota Camry Hybrid",
        type: "Sedan",
        maxLoadCapacity: 600,
        odometer: 11000,
        acquisitionCost: 32000,
        region: "West",
        status: "Available",
      },
      {
        registrationNumber: "MH-12-SV-7007",
        name: "Ford Endeavour 3.2",
        type: "SUV",
        maxLoadCapacity: 900,
        odometer: 24000,
        acquisitionCost: 40000,
        region: "North",
        status: "Available",
      },
    ];
    const seededVehicles = await Vehicle.insertMany(vehiclesList);
    console.log(`Seeded ${seededVehicles.length} vehicles.`);

    console.log("\n--- Seeding Driver Profiles ---");
    // Date formats relative to today
    const dateInFuture = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split("T")[0];
    };
    const dateInPast = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d.toISOString().split("T")[0];
    };

    const driversList = [
      {
        name: "Rajesh Kumar",
        licenseNumber: "DL-1420210099881",
        licenseCategory: "Class A",
        licenseExpiryDate: dateInFuture(700), // Valid
        contactNumber: "+91 9876543210",
        safetyScore: 92,
        status: "On Trip",
      },
      {
        name: "Suresh Patil",
        licenseNumber: "DL-1420220077662",
        licenseCategory: "Class A",
        licenseExpiryDate: dateInFuture(450), // Valid
        contactNumber: "+91 9876543211",
        safetyScore: 88,
        status: "Available",
      },
      {
        name: "Amit Sharma",
        licenseNumber: "DL-1420200055443",
        licenseCategory: "Class B",
        licenseExpiryDate: dateInFuture(15), // Expiring in 15 days (Orange alarm)
        contactNumber: "+91 9876543212",
        safetyScore: 95,
        status: "Available",
      },
      {
        name: "Vikram Singh",
        licenseNumber: "DL-1420190033224",
        licenseCategory: "Class A",
        licenseExpiryDate: dateInPast(45), // Expired 45 days ago (Red alarm)
        contactNumber: "+91 9876543213",
        safetyScore: 78,
        status: "Available",
      },
    ];
    const seededDrivers = await Driver.insertMany(driversList);
    console.log(`Seeded ${seededDrivers.length} drivers.`);

    console.log("\n--- Seeding Fleet Dispatched & Draft Trips ---");
    const vMap = {};
    seededVehicles.forEach(v => { vMap[v.registrationNumber] = v._id; });

    const dMap = {};
    seededDrivers.forEach(d => { dMap[d.name] = d._id; });

    const tripsList = [
      {
        source: "Mumbai Port",
        destination: "Pune Logistics Hub",
        vehicle: vMap["MH-12-TR-9901"],
        driver: dMap["Rajesh Kumar"],
        cargoWeight: 12000,
        plannedDistance: 150,
        actualDistance: 150,
        revenue: 2800,
        status: "Completed",
        startDate: dateInPast(3),
        endDate: dateInPast(3),
      },
      {
        source: "Delhi Cargo Terminal",
        destination: "Jaipur Depot",
        vehicle: vMap["MH-12-TR-8822"],
        driver: dMap["Suresh Patil"],
        cargoWeight: 8000,
        plannedDistance: 270,
        actualDistance: 270,
        revenue: 4200,
        status: "Completed",
        startDate: dateInPast(5),
        endDate: dateInPast(5),
      },
      {
        source: "Kolkata Port",
        destination: "Bhubaneswar Warehouse",
        vehicle: vMap["MH-12-VN-3004"],
        driver: dMap["Amit Sharma"],
        cargoWeight: 2500,
        plannedDistance: 440,
        actualDistance: 450,
        revenue: 5500,
        status: "Completed",
        startDate: dateInPast(8),
        endDate: dateInPast(8),
      },
      {
        source: "Chennai HQ",
        destination: "Bangalore Depot",
        vehicle: vMap["MH-12-SV-7007"],
        driver: dMap["Suresh Patil"],
        cargoWeight: 500,
        plannedDistance: 350,
        actualDistance: 350,
        revenue: 3100,
        status: "Completed",
        startDate: dateInPast(10),
        endDate: dateInPast(10),
      },
      {
        source: "Mumbai Warehouse",
        destination: "Nashik Retail Store",
        vehicle: vMap["MH-12-TR-9901"],
        driver: dMap["Rajesh Kumar"],
        cargoWeight: 14000,
        plannedDistance: 180,
        revenue: 2200,
        status: "Dispatched",
        startDate: dateInPast(1),
      },
      {
        source: "Delhi Hub",
        destination: "Gurugram Hub",
        vehicle: vMap["MH-12-SD-5001"],
        driver: dMap["Vikram Singh"],
        cargoWeight: 400,
        plannedDistance: 45,
        revenue: 600,
        status: "Draft",
      },
    ];

    const seededTrips = await Trip.insertMany(tripsList);
    console.log(`Seeded ${seededTrips.length} trips.`);

    const tMap = {};
    seededTrips.forEach(t => { tMap[t.source] = t._id; });

    console.log("\n--- Seeding Fuel Transactions ---");
    const fuelLogsList = [
      {
        vehicle: vMap["MH-12-TR-9901"],
        trip: tMap["Mumbai Port"],
        liters: 45,
        cost: 90,
        date: dateInPast(3),
      },
      {
        vehicle: vMap["MH-12-TR-8822"],
        trip: tMap["Delhi Cargo Terminal"],
        liters: 65,
        cost: 130,
        date: dateInPast(5),
      },
      {
        vehicle: vMap["MH-12-VN-3004"],
        trip: tMap["Kolkata Port"],
        liters: 110,
        cost: 220,
        date: dateInPast(8),
      },
      {
        vehicle: vMap["MH-12-SV-7007"],
        trip: tMap["Chennai HQ"],
        liters: 30,
        cost: 60,
        date: dateInPast(10),
      },
      // Manual fuel logs
      {
        vehicle: vMap["MH-12-TR-9901"],
        liters: 35,
        cost: 72,
        date: dateInPast(1),
      },
      {
        vehicle: vMap["MH-12-SD-5001"],
        liters: 12,
        cost: 24,
        date: dateInPast(2),
      },
    ];
    await FuelLog.insertMany(fuelLogsList);
    console.log("Seeded fuel purchase transactions.");

    console.log("\n--- Seeding Repair Shop Workorders ---");
    const maintenanceLogsList = [
      {
        vehicle: vMap["MH-12-VN-3004"],
        description: "Brake pad replacement and wheel alignment",
        cost: 350,
        startDate: dateInPast(12),
        endDate: dateInPast(11),
        status: "Closed",
      },
      {
        vehicle: vMap["MH-12-VN-3004"],
        description: "Radiator leak & coolant pump repair",
        cost: 0,
        startDate: dateInPast(2),
        status: "Active",
      },
    ];
    await MaintenanceLog.insertMany(maintenanceLogsList);
    console.log("Seeded active and closed maintenance workorders.");

    console.log("\n--- Seeding Operational Fees Ledger ---");
    const expensesList = [
      {
        vehicle: vMap["MH-12-TR-9901"],
        type: "Toll",
        cost: 45,
        description: "Mumbai-Pune expressway toll plaza charges",
        date: dateInPast(3),
      },
      {
        vehicle: vMap["MH-12-TR-9901"],
        type: "Permit",
        cost: 120,
        description: "Commercial interstate highway permit fee",
        date: dateInPast(6),
      },
      {
        vehicle: vMap["MH-12-TR-8822"],
        type: "Fine",
        cost: 100,
        description: "NH-8 highway overspeeding fine ticket",
        date: dateInPast(5),
      },
      {
        vehicle: vMap["MH-12-VN-3004"],
        type: "Insurance",
        cost: 600,
        description: "Yearly comprehensive commercial auto insurance premium",
        date: dateInPast(15),
      },
    ];
    await Expense.insertMany(expensesList);
    console.log("Seeded general operational expenses (tolls/permits/insurance).");

    console.log("\n✅ Database Successfully Seeded with Cohort Fleet Data!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding failed with error:", error);
    mongoose.connection.close();
  }
};

seedData();
