import axios from "axios";

function isLocalNetwork(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function resolveApiUrl(): string {
  if (typeof window !== "undefined" && isLocalNetwork(window.location.hostname)) {
    return `http://${window.location.hostname}:3333`;
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
}

export const apiClient = axios.create({
  baseURL: resolveApiUrl(),
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("secretin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});