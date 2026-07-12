import mongoose from "mongoose";

const fuelLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle reference is required"],
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },
    liters: {
      type: Number,
      required: [true, "Fuel quantity in liters is required"],
      min: [0, "Liters cannot be negative"],
    },
    cost: {
      type: Number,
      required: [true, "Fuel cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    date: {
      type: Date,
      required: [true, "Fuel purchase date is required"],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const FuelLog = mongoose.model("FuelLog", fuelLogSchema);

export default FuelLog;
