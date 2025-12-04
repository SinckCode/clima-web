// src/pages/DailyHistoryPage.jsx
import { useEffect, useState } from "react";
import "../styles/pages/_dailyHistory.scss";
import {
  fetchDailyBmeStats,
  fetchDailyDhtLightStats,
} from "../api/statsService";
import StatCard from "../components/common/StatCard";

function StatusChip({ status }) {
  if (!status || status === "sin_datos") {
    return <span className="chip chip--neutral">Sin datos</span>;
  }
  if (status === "en_rango") {
    return <span className="chip chip--ok">En rango</span>;
  }
  if (status === "bajo") {
    return <span className="chip chip--low">Bajo</span>;
  }
  if (status === "alto") {
    return <span className="chip chip--high">Alto</span>;
  }
  return <span className="chip chip--neutral">{status}</span>;
}

// calcula % de días con status "en_rango" para una métrica
function calcPercentInRange(days, key) {
  if (!days.length) return 0;
  const inRange = days.filter(
    (d) => d[key] && d[key].status === "en_rango"
  ).length;
  return (inRange / days.length) * 100;
}

export default function DailyHistoryPage() {
  const [bmeDays, setBmeDays] = useState([]);
  const [dhtDays, setDhtDays] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // porcentajes globales para el resumen
  const tempBmePercent = calcPercentInRange(bmeDays, "temperature");
  const humBmePercent = calcPercentInRange(bmeDays, "humidity");
  const tempDhtPercent = calcPercentInRange(dhtDays, "temperature");
  const humDhtPercent = calcPercentInRange(dhtDays, "humidity");
  const lightPercent = calcPercentInRange(dhtDays, "light");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (start) params.start = start;
        if (end) params.end = end;

        const [bme, dht] = await Promise.all([
          fetchDailyBmeStats(params),
          fetchDailyDhtLightStats(params),
        ]);

        setBmeDays(bme);
        setDhtDays(dht);
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error cargando el histórico diario.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [start, end]);

  return (
    <div className="daily-history">
      <header className="daily-history__header">
        <div>
          <h1>Histórico diario</h1>
          <p>
            Resumen día por día de las condiciones del aula (temperatura,
            humedad, presión e iluminación) usando las lecturas de los
            sensores.
          </p>
        </div>

        <div className="daily-history__filters">
          <div className="field">
            <label htmlFor="start">Desde</label>
            <input
              id="start"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="end">Hasta</label>
            <input
              id="end"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Resumen global tipo semáforo */}
      {!loading && !error && (
        <section className="daily-history__summary">
          <div className="summary-card">
            <h2>Resumen normativo</h2>
            <p className="summary-card__caption">
              Porcentaje de días que cumplen con los rangos recomendados.
            </p>
            <div className="summary-card__grid">
              <div className="summary-item">
                <span className="summary-item__label">Temp. BME680</span>
                <span className="summary-item__value">
                  {tempBmePercent.toFixed(1)}%
                </span>
                <StatusChip
                  status={tempBmePercent >= 80 ? "en_rango" : "bajo"}
                />
              </div>

              <div className="summary-item">
                <span className="summary-item__label">Hum. BME680</span>
                <span className="summary-item__value">
                  {humBmePercent.toFixed(1)}%
                </span>
                <StatusChip
                  status={humBmePercent >= 80 ? "en_rango" : "bajo"}
                />
              </div>

              <div className="summary-item">
                <span className="summary-item__label">Temp. DHT22</span>
                <span className="summary-item__value">
                  {tempDhtPercent.toFixed(1)}%
                </span>
                <StatusChip
                  status={tempDhtPercent >= 80 ? "en_rango" : "bajo"}
                />
              </div>

              <div className="summary-item">
                <span className="summary-item__label">Hum. DHT22</span>
                <span className="summary-item__value">
                  {humDhtPercent.toFixed(1)}%
                </span>
                <StatusChip
                  status={humDhtPercent >= 80 ? "en_rango" : "bajo"}
                />
              </div>

              <div className="summary-item">
                <span className="summary-item__label">Luz (BH1750)</span>
                <span className="summary-item__value">
                  {lightPercent.toFixed(1)}%
                </span>
                <StatusChip
                  status={lightPercent >= 80 ? "en_rango" : "bajo"}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {loading && <p className="daily-history__loading">Cargando datos…</p>}
      {error && <p className="daily-history__error">{error}</p>}

      {!loading && !error && (
        <div className="daily-history__content">
          {/* BME680 */}
          <section className="daily-history__section">
            <h2>BME680 – Temperatura, humedad y presión</h2>

            <div className="daily-history__list">
              {bmeDays.map((day) => (
                <article key={day.date} className="daily-history__day-card">
                  <div className="day-card__header">
                    <div className="day-card__date-row">
                      <h3>{day.date}</h3>
                      <div className="day-card__status-row">
                        <StatusChip status={day.temperature.status} />
                        <StatusChip status={day.humidity.status} />
                      </div>
                    </div>
                    <span className="day-card__count">
                      {day.count} lecturas
                    </span>
                  </div>

                  <div className="day-card__grid">
                    <StatCard
                      title="Temperatura (°C)"
                      value={`${day.temperature.avg.toFixed(2)} °C`}
                      subtitle={`Mín: ${day.temperature.min.toFixed(
                        2
                      )} · Máx: ${day.temperature.max.toFixed(2)}`}
                      extra={<StatusChip status={day.temperature.status} />}
                    />
                    <StatCard
                      title="Humedad relativa (%)"
                      value={`${day.humidity.avg.toFixed(2)} %`}
                      subtitle={`Mín: ${day.humidity.min.toFixed(
                        2
                      )} · Máx: ${day.humidity.max.toFixed(2)}`}
                      extra={<StatusChip status={day.humidity.status} />}
                    />
                    <StatCard
                      title="Presión (hPa)"
                      value={`${day.pressure.avg.toFixed(2)} hPa`}
                      subtitle={`Mín: ${day.pressure.min.toFixed(
                        2
                      )} · Máx: ${day.pressure.max.toFixed(2)}`}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* DHT22 + Luz */}
          <section className="daily-history__section">
            <h2>DHT22 + BH1750 – Temperatura, humedad e iluminación</h2>

            <div className="daily-history__list">
              {dhtDays.map((day) => (
                <article key={day.date} className="daily-history__day-card">
                  <div className="day-card__header">
                    <div className="day-card__date-row">
                      <h3>{day.date}</h3>
                      <div className="day-card__status-row">
                        <StatusChip status={day.temperature.status} />
                        <StatusChip status={day.humidity.status} />
                        <StatusChip status={day.light.status} />
                      </div>
                    </div>
                    <span className="day-card__count">
                      {day.count} lecturas
                    </span>
                  </div>

                  <div className="day-card__grid">
                    <StatCard
                      title="Temperatura DHT (°C)"
                      value={`${day.temperature.avg.toFixed(2)} °C`}
                      subtitle={`Mín: ${day.temperature.min.toFixed(
                        2
                      )} · Máx: ${day.temperature.max.toFixed(2)}`}
                      extra={<StatusChip status={day.temperature.status} />}
                    />
                    <StatCard
                      title="Humedad DHT (%)"
                      value={`${day.humidity.avg.toFixed(2)} %`}
                      subtitle={`Mín: ${day.humidity.min.toFixed(
                        2
                      )} · Máx: ${day.humidity.max.toFixed(2)}`}
                      extra={<StatusChip status={day.humidity.status} />}
                    />
                    <StatCard
                      title="Iluminación (lux)"
                      value={`${day.light.avg.toFixed(2)} lx`}
                      subtitle={`Mín: ${day.light.min.toFixed(
                        2
                      )} · Máx: ${day.light.max.toFixed(2)}`}
                      extra={<StatusChip status={day.light.status} />}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
