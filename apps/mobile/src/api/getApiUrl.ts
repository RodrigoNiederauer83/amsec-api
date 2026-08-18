import Constants from "expo-constants";

function getDevApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri; // ex: "192.168.1.187:8081"
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3333`;
  }
  return "http://localhost:3333";
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? getDevApiUrl();