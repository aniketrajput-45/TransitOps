import API from "./api";

const getStats = async (filters = {}) => {
  const response = await API.get("/dashboard/stats", { params: filters });
  return response.data;
};

const dashboardService = {
  getStats,
};

export default dashboardService;
