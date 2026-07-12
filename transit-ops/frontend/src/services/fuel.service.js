import API from "./api";

const getFuelLogs = async (filters = {}) => {
  const response = await API.get("/fuel-logs", { params: filters });
  return response.data;
};

const createFuelLog = async (logData) => {
  const response = await API.post("/fuel-logs", logData);
  return response.data;
};

const fuelService = {
  getFuelLogs,
  createFuelLog,
};

export default fuelService;
