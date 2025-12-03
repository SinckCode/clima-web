// src/api/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://sensores.angelonesto.com/api",
  timeout: 10000,
});

// (Opcional) interceptor para loguear errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API ERROR]", error?.response || error?.message);
    return Promise.reject(error);
  }
);

export default apiClient;
