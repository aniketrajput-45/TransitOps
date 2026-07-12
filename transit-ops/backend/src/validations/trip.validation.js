import { body } from "express-validator";
import { handleValidationErrors } from "./auth.validation.js";

export const tripValidation = [
  body("source")
    .trim()
    .notEmpty()
    .withMessage("Source location is required"),
  body("destination")
    .trim()
    .notEmpty()
    .withMessage("Destination location is required"),
  body("vehicle")
    .isMongoId()
    .withMessage("A valid vehicle ID must be assigned"),
  body("driver")
    .isMongoId()
    .withMessage("A valid driver ID must be assigned"),
  body("cargoWeight")
    .notEmpty()
    .withMessage("Cargo weight is required")
    .isFloat({ min: 0 })
    .withMessage("Cargo weight must be a positive number"),
  body("plannedDistance")
    .notEmpty()
    .withMessage("Planned distance is required")
    .isFloat({ min: 0 })
    .withMessage("Planned distance must be a positive number"),
  body("revenue")
    .notEmpty()
    .withMessage("Trip revenue is required")
    .isFloat({ min: 0 })
    .withMessage("Trip revenue must be a positive number"),
  handleValidationErrors
];
