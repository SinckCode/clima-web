// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { getCurrentStats } from "../api/statsService";
import StatCard from "../components/common/StatCard";
import "../styles/pages/_dashboard.scss";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchData() {
    try {
      setErrorMsg("");
      const res = await getCurrentStats();
      setData(res);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudieron obtener las lecturas actuales.");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10_000); // cada 10s
    return () => clearInterval(id);
  }, []);

  const derived = data?.derived;
  const sources = data?.sources;

  const lastBmeAt = sources?.bmeLatest?.createdAt
    ? new Date(sources.bmeLatest.createdAt)
    : null;
  const lastDhtAt = sources?.dhtLatest?.createdAt
    ? new Date(sources.dhtLatest.createdAt)
    : null;

  const formatTime = (d) =>
    d?.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

  return (
    <div className="dashboard">
      {/* ===== Header ===== */}
      <div className="dashboard__header">
        <div className="dashboard__title-block">
          <h2>Panorama actual del aula</h2>
          <p className="dashboard__subtitle">
            Lecturas en tiempo casi real de temperatura, humedad, luz y presión
            obtenidas desde el ESP32 y evaluadas contra rangos de confort.
          </p>
        </div>

        <div className="dashboard__meta">
          <span className="tag tag--muted">Actualización automática cada 10 s</span>

          {loading && <span className="tag tag--info">Cargando datos...</span>}

          {errorMsg && <span className="tag tag--error">{errorMsg}</span>}

          {lastUpdate && !loading && !errorMsg && (
            <span className="tag tag--muted">
              Última actualización del panel: {formatTime(lastUpdate)}
            </span>
          )}
        </div>
      </div>

      {/* ===== Info de origen de datos ===== */}
      <div className="dashboard__sources">
        <div className="dashboard__source-chip">
          <span className="dashboard__source-label">BME680</span>
          <span className="dashboard__source-text">
            Última lectura:{" "}
            {lastBmeAt ? formatTime(lastBmeAt) : "sin datos aún"}
          </span>
        </div>

        <div className="dashboard__source-chip">
          <span className="dashboard__source-label">DHT22 + BH1750</span>
          <span className="dashboard__source-text">
            Última lectura:{" "}
            {lastDhtAt ? formatTime(lastDhtAt) : "sin datos aún"}
          </span>
        </div>
      </div>

      {/* ===== Grid de tarjetas ===== */}
      <div className="dashboard__grid">
        <StatCard
          title="Temperatura (BME680)"
          value={
            derived?.temperature?.value != null
              ? derived.temperature.value.toFixed(1)
              : null
          }
          unit={derived?.temperature?.unit}
          status={derived?.temperature?.status}
          subtitle="Comparada con rango ASHRAE 23–27 °C"
        />

        <StatCard
          title="Humedad relativa (BME680)"
          value={
            derived?.humidity?.value != null
              ? derived.humidity.value.toFixed(1)
              : null
          }
          unit={derived?.humidity?.unit}
          status={derived?.humidity?.status}
          subtitle="Rango recomendado 40–60 %"
        />

        <StatCard
          title="Iluminación (BH1750)"
          value={
            derived?.light?.value != null
              ? derived.light.value.toFixed(0)
              : null
          }
          unit={derived?.light?.unit}
          status={derived?.light?.status}
          subtitle="Referencia ISO 8995: 300–500 lux"
        />

        <StatCard
          title="Presión atmosférica"
          value={
            derived?.pressure?.value != null
              ? derived.pressure.value.toFixed(1)
              : null
          }
          unit={derived?.pressure?.unit}
          status="sin_dato"
          subtitle="Dato informativo ligado a la altitud del campus"
        />
      </div>

      <p className="dashboard__note">
        Este panel se alimenta desde las rutas{" "}
        <code>/api/stats/current</code>, <code>/api/bme-readings/latest</code>{" "}
        y <code>/api/dht-light-readings/latest</code>, que exponen las últimas
        lecturas unificadas del BME680, DHT22 y BH1750 para el aula. Los
        valores se comparan contra los rangos sugeridos por OMS, ASHRAE e ISO
        8995 para identificar rápidamente condiciones fuera de confort.
      </p>
    </div>
  );
}
