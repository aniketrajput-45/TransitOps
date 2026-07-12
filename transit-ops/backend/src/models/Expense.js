import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle reference is required"],
    },
    type: {
      type: String,
      enum: ["Toll", "Permit", "Fine", "Insurance", "Other"],
      required: [true, "Expense type is required"],
    },
    cost: {
      type: Number,
      required: [true, "Expense cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
