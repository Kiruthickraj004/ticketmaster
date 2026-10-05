import api from "./axios";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register/", userData);
  return response.data;
};

export const loginUser = async (username, password) => {
  const response = await api.post("/auth/login/", {
    username,
    password,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me/");
  return response.data;
};

export const checkOperatorStatus = async (identifier) => {
  const response = await api.post("/auth/operator-status/", {
    identifier,
  });
  return response.data;
};