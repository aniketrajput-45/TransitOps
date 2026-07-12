import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Driver from "../models/Driver.js";

dotenv.config();

const createDriverProfile = async () => {
  try {
    console.log("Connecting to MongoDB database...");
    await connectDB();

    const email = "driver2@gmail.com";
    console.log(`Searching for user account with email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log(`Found User account: name="${user.name}", role="${user.role}"`);

    // Verify role is indeed Driver
    if (user.role !== "Driver") {
      console.log(`⚠️ Warning: User has role "${user.role}" instead of "Driver". We will still create the profile.`);
    }

    // Check if Driver profile already exists
    const existingDriver = await Driver.findOne({
      name: { $regex: new RegExp("^" + user.name + "$", "i") },
    });

    if (existingDriver) {
      console.log(`✅ A Driver profile already exists with name: "${existingDriver.name}" (ID: ${existingDriver._id})`);
      process.exit(0);
    }

    // Create a new Driver profile
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const driver = await Driver.create({
      name: user.name,
      licenseNumber: `DL-2026-${randomSuffix}`,
      licenseCategory: "Heavy Commercial",
      licenseExpiryDate: "2031-12-31",
      contactNumber: "9876501234",
      safetyScore: 92,
      status: "Available",
    });

    console.log(`✅ Success! Driver profile created for name: "${driver.name}"`);
    console.log(JSON.stringify(driver, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("❌ Error occurred:", error);
    process.exit(1);
  }
};

createDriverProfile();
