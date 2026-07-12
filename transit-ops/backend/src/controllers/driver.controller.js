import Driver from "../models/Driver.js";

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
export const getAllDrivers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { licenseNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (req.user.role === "Driver") {
      filter.name = { $regex: new RegExp("^" + req.user.name + "$", "i") };
    }

    const drivers = await Driver.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single driver by ID
// @route   GET /api/drivers/:id
// @access  Private
export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    if (req.user.role === "Driver" && driver.name.toLowerCase() !== req.user.name.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Access denied: you cannot view other driver profiles",
      });
    }

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new driver
// @route   POST /api/drivers
// @access  Private
export const createDriver = async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

    // Check unique license number
    const existingDriver = await Driver.findOne({
      licenseNumber: licenseNumber.toUpperCase(),
    });

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "A driver with this license number already exists",
      });
    }

    const driver = await Driver.create({
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Driver profile created successfully",
      driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a driver
// @route   PUT /api/drivers/:id
// @access  Private
export const updateDriver = async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Check unique license number if changing it
    if (licenseNumber && licenseNumber.toUpperCase() !== driver.licenseNumber) {
      const existingDriver = await Driver.findOne({
        licenseNumber: licenseNumber.toUpperCase(),
      });
      if (existingDriver) {
        return res.status(400).json({
          success: false,
          message: "A driver with this license number already exists",
        });
      }
      driver.licenseNumber = licenseNumber;
    }

    if (name) driver.name = name;
    if (licenseCategory) driver.licenseCategory = licenseCategory;
    if (licenseExpiryDate) driver.licenseExpiryDate = licenseExpiryDate;
    if (contactNumber) driver.contactNumber = contactNumber;
    if (safetyScore !== undefined) driver.safetyScore = safetyScore;
    if (status) driver.status = status;

    await driver.save();

    res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a driver
// @route   DELETE /api/drivers/:id
// @access  Private
export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    await Driver.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Driver profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
