import API from "./api";

const getDrivers = async (filters = {}) => {
  const response = await API.get("/drivers", { params: filters });
  return response.data;
};

const getDriver = async (id) => {
  const response = await API.get(`/drivers/${id}`);
  return response.data;
};

const createDriver = async (driverData) => {
  const response = await API.post("/drivers", driverData);
  return response.data;
};

const updateDriver = async (id, driverData) => {
  const response = await API.put(`/drivers/${id}`, driverData);
  return response.data;
};

const deleteDriver = async (id) => {
  const response = await API.delete(`/drivers/${id}`);
  return response.data;
};

const driverService = {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
};

export default driverService;
