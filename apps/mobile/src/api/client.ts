import axios from "axios";
import { authStorage } from "../auth/authStorage";
import { API_URL } from "./getApiUrl";

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});