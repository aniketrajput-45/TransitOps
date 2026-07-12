import API from "./api";

const getTrips = async (filters = {}) => {
  const response = await API.get("/trips", { params: filters });
  return response.data;
};

const getTrip = async (id) => {
  const response = await API.get(`/trips/${id}`);
  return response.data;
};

const createTrip = async (tripData) => {
  const response = await API.post("/trips", tripData);
  return response.data;
};

const dispatchTrip = async (id) => {
  const response = await API.put(`/trips/${id}/dispatch`);
  return response.data;
};

const completeTrip = async (id, completionData) => {
  const response = await API.put(`/trips/${id}/complete`, completionData);
  return response.data;
};

const cancelTrip = async (id) => {
  const response = await API.put(`/trips/${id}/cancel`);
  return response.data;
};

const tripService = {
  getTrips,
  getTrip,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};

export default tripService;
