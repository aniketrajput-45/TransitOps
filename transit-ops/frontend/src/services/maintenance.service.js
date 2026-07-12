import API from "./api";

const getMaintenanceLogs = async (filters = {}) => {
  const response = await API.get("/maintenance", { params: filters });
  return response.data;
};

const createMaintenanceLog = async (logData) => {
  const response = await API.post("/maintenance", logData);
  return response.data;
};

const closeMaintenanceLog = async (id, closeData) => {
  const response = await API.put(`/maintenance/${id}/close`, closeData);
  return response.data;
};

const maintenanceService = {
  getMaintenanceLogs,
  createMaintenanceLog,
  closeMaintenanceLog,
};

export default maintenanceService;
