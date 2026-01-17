import axios from "axios";

// 1. Constant for the storage key to avoid typos across files
export const AUTH_TOKEN_KEY = "retain_auth_token";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

// 2. Request Interceptor
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (adminToken) {
      // Backend expects: "Authorization: Bearer <uuid>"
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Helper to set token (Use this in Landing.tsx and AdminManage.tsx)
export const setAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

// 4. Helper to clear token (Use for Logout)
export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export default api;
