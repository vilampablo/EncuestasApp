import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Default API URL (use HTTPS if possible)
const defaultApiUrl = "https://bit-32.com"

// Use environment variable for API URL if set, otherwise fallback to default
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : defaultApiUrl,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
