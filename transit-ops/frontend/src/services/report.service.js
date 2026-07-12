import API from "./api";

const getAnalytics = async () => {
  const response = await API.get("/reports/analytics");
  return response.data;
};

const reportService = {
  getAnalytics,
};

export default reportService;
