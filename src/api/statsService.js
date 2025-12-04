// src/api/statsService.js
import apiClient from "./apiClient";

const API_BASE_URL = "https://sensores.angelonesto.com";

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


export async function fetchDailyBmeStats({ start, end } = {}) {
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end) params.append("end", end);

  const res = await fetch(
    `${API_BASE_URL}/api/dayle-stats/daily-bme?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("No se pudo cargar el historial diario BME680");
  }

  const json = await res.json();
  return json.data; // [{ date, count, temperature: {...}, humidity: {...}, pressure: {...} }]
}

export async function fetchDailyDhtLightStats({ start, end } = {}) {
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end) params.append("end", end);

  const res = await fetch(
    `${API_BASE_URL}/api/dayle-stats/daily-dht-light?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("No se pudo cargar el historial diario DHT + Luz");
  }

  const json = await res.json();
  return json.data; // [{ date, count, temperature, humidity, light }]
}
