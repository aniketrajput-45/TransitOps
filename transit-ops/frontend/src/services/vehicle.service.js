import API from "./api";

const getVehicles = async (filters = {}) => {
  const response = await API.get("/vehicles", { params: filters });
  return response.data;
};

const getVehicle = async (id) => {
  const response = await API.get(`/vehicles/${id}`);
  return response.data;
};

const createVehicle = async (vehicleData) => {
  const response = await API.post("/vehicles", vehicleData);
  return response.data;
};

const updateVehicle = async (id, vehicleData) => {
  const response = await API.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};

const deleteVehicle = async (id) => {
  const response = await API.delete(`/vehicles/${id}`);
  return response.data;
};

const getOperationalCost = async (id) => {
  const response = await API.get(`/vehicles/${id}/operational-cost`);
  return response.data;
};

const vehicleService = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getOperationalCost,
};

export default vehicleService;
