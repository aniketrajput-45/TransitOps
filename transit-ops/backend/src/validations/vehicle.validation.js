import { body } from "express-validator";
import { handleValidationErrors } from "./auth.validation.js";

// Helper check to validate field only if it's a POST request or if the field is present
const runIfPresentOrCreate = (fieldName) => (value, { req }) => {
  return req.method === "POST" || req.body[fieldName] !== undefined;
};

export const vehicleValidation = [
  body("registrationNumber")
    .if(runIfPresentOrCreate("registrationNumber"))
    .trim()
    .notEmpty()
    .withMessage("Registration number is required")
    .matches(/^[A-Z0-9- ]+$/i)
    .withMessage("Registration number can only contain alphanumeric characters, hyphens, and spaces"),
  body("name")
    .if(runIfPresentOrCreate("name"))
    .trim()
    .notEmpty()
    .withMessage("Vehicle name/model is required"),
  body("type")
    .if(runIfPresentOrCreate("type"))
    .trim()
    .notEmpty()
    .withMessage("Vehicle type is required"),
  body("maxLoadCapacity")
    .if(runIfPresentOrCreate("maxLoadCapacity"))
    .notEmpty()
    .withMessage("Maximum load capacity is required")
    .isFloat({ min: 0 })
    .withMessage("Maximum load capacity must be a positive number"),
  body("odometer")
    .if(runIfPresentOrCreate("odometer"))
    .notEmpty()
    .withMessage("Odometer reading is required")
    .isFloat({ min: 0 })
    .withMessage("Odometer reading must be a positive number"),
  body("acquisitionCost")
    .if(runIfPresentOrCreate("acquisitionCost"))
    .notEmpty()
    .withMessage("Acquisition cost is required")
    .isFloat({ min: 0 })
    .withMessage("Acquisition cost must be a positive number"),
  body("status")
    .optional()
    .isIn(["Available", "On Trip", "In Shop", "Retired"])
    .withMessage("Invalid vehicle status"),
  body("region")
    .optional()
    .isIn(["North", "South", "East", "West"])
    .withMessage("Invalid region designation"),
  handleValidationErrors
];
