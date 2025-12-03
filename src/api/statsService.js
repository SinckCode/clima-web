// src/api/statsService.js
import apiClient from "./apiClient";

// Lecturas actuales
export async function getCurrentStats() {
  const res = await apiClient.get("/stats/current");
  return res.data;
}

// Estadísticas diarias
export async function getDailyStats({ from, to } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const res = await apiClient.get("/stats/daily", { params });
  return res.data; // { range, bme, dhtLight }
}

// ⬇️ NUEVO: cumplimiento de rangos
export async function getComplianceStats({ from, to } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const res = await apiClient.get("/stats/compliance", { params });
  return res.data; // { range, temperatureHumidity, light }
}
