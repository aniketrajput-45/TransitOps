import { body } from "express-validator";
import { handleValidationErrors } from "./auth.validation.js";

const runIfPresentOrCreate = (fieldName) => (value, { req }) => {
  return req.method === "POST" || req.body[fieldName] !== undefined;
};

export const driverValidation = [
  body("name")
    .if(runIfPresentOrCreate("name"))
    .trim()
    .notEmpty()
    .withMessage("Driver name is required"),
  body("licenseNumber")
    .if(runIfPresentOrCreate("licenseNumber"))
    .trim()
    .notEmpty()
    .withMessage("License number is required"),
  body("licenseCategory")
    .if(runIfPresentOrCreate("licenseCategory"))
    .trim()
    .notEmpty()
    .withMessage("License category is required"),
  body("licenseExpiryDate")
    .if(runIfPresentOrCreate("licenseExpiryDate"))
    .notEmpty()
    .withMessage("License expiry date is required")
    .isISO8601()
    .withMessage("Please enter a valid expiry date (YYYY-MM-DD)"),
  body("contactNumber")
    .if(runIfPresentOrCreate("contactNumber"))
    .trim()
    .notEmpty()
    .withMessage("Contact number is required"),
  body("safetyScore")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Safety score must be an integer between 0 and 100"),
  body("status")
    .optional()
    .isIn(["Available", "On Trip", "Off Duty", "Suspended"])
    .withMessage("Invalid driver status"),
  handleValidationErrors
];
