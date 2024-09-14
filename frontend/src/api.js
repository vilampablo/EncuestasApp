import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Default API URL (use HTTPS if possible)
// const defaultApiUrl = "https://bit-32.com"
const defaultApiUrl = "http://localhost:8000";

// Create an Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : defaultApiUrl,
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        // Check if the request URL requires authorization
        // Adjust this condition based on your URL structure and endpoints
        if (!config.url.startsWith('/api/forms/')) {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
