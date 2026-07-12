import API from "./api";

const getExpenses = async (filters = {}) => {
  const response = await API.get("/expenses", { params: filters });
  return response.data;
};

const createExpense = async (expenseData) => {
  const response = await API.post("/expenses", expenseData);
  return response.data;
};

const expenseService = {
  getExpenses,
  createExpense,
};

export default expenseService;
