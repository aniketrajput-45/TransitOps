import mongoose from "mongoose";

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle reference is required"],
    },
    description: {
      type: String,
      required: [true, "Maintenance description is required"],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, "Maintenance cost is required"],
      min: [0, "Cost cannot be negative"],
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const MaintenanceLog = mongoose.model("MaintenanceLog", maintenanceLogSchema);

export default MaintenanceLog;
