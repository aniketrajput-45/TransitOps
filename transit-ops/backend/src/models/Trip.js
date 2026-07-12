import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, "Source location is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination location is required"],
      trim: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle assignment is required"],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: [true, "Driver assignment is required"],
    },
    cargoWeight: {
      type: Number,
      required: [true, "Cargo weight is required"],
      min: [0, "Cargo weight cannot be negative"],
    },
    plannedDistance: {
      type: Number,
      required: [true, "Planned distance is required"],
      min: [0, "Planned distance cannot be negative"],
    },
    revenue: {
      type: Number,
      required: [true, "Trip revenue is required"],
      min: [0, "Trip revenue cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Draft", "Dispatched", "Completed", "Cancelled"],
      default: "Draft",
    },
    actualDistance: {
      type: Number,
      min: [0, "Actual distance cannot be negative"],
    },
    fuelConsumedLiters: {
      type: Number,
      min: [0, "Fuel consumed cannot be negative"],
    },
    fuelCost: {
      type: Number,
      min: [0, "Fuel cost cannot be negative"],
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
