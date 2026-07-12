import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Vehicle name/model is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Vehicle type is required"],
      trim: true,
    },
    maxLoadCapacity: {
      type: Number,
      required: [true, "Maximum load capacity is required"],
      min: [0, "Maximum load capacity cannot be negative"],
    },
    odometer: {
      type: Number,
      required: [true, "Odometer reading is required"],
      min: [0, "Odometer reading cannot be negative"],
    },
    acquisitionCost: {
      type: Number,
      required: [true, "Acquisition cost is required"],
      min: [0, "Acquisition cost cannot be negative"],
    },
    region: {
      type: String,
      enum: ["North", "South", "East", "West"],
      default: "North",
    },
    status: {
      type: String,
      enum: ["Available", "On Trip", "In Shop", "Retired"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
