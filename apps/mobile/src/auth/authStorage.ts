import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "secretin_token";

export const authStorage = {
  async getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setToken(token: string) {
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clearToken() {
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};