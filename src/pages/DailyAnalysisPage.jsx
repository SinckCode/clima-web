import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { getDailyStats } from "../api/statsService";
import "../styles/pages/_daily.scss";

function formatDate(d) {
  return dayjs(d).format("YYYY-MM-DD");
}

export default function DailyAnalysisPage() {
  const [from, setFrom] = useState(
    formatDate(dayjs().subtract(5, "day").toDate())
  );
  const [to, setTo] = useState(formatDate(new Date()));
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchStats() {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getDailyStats({ from, to });
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudieron obtener las estadísticas diarias.");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    fetchStats();
  }

  // Mezclar info BME + DHT por fecha
  const mergedData = useMemo(() => {
    if (!stats) return [];

    const map = new Map();

    for (const row of stats.bme || []) {
      map.set(row._id, {
        date: row._id,
        bmeAvgTemp: row.avgTemp,
        bmeAvgHum: row.avgHum,
        bmeAvgPress: row.avgPress
      });
    }

    for (const row of stats.dhtLight || []) {
      const existing = map.get(row._id) || { date: row._id };
      existing.dhtAvgTemp = row.avgTemp;
      existing.dhtAvgHum = row.avgHum;
      existing.dhtAvgLux = row.avgLux;
      map.set(row._id, existing);
    }

    return Array.from(map.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [stats]);

  const hasData = mergedData.length > 0;

  // Rangos recomendados (para textos y tags)
  const RANGE_TEMP = { min: 23, max: 27 };
  const RANGE_HUM = { min: 40, max: 60 };
  const RANGE_LUX = { min: 300, max: 500 };

  return (
    <div className="daily">
      {/* ===== Header ===== */}
      <div className="daily__header">
        <div>
          <h2>Análisis diario de temperatura, humedad e iluminación</h2>
          <p className="daily__subtitle">
            Se analizan promedios por día utilizando las lecturas del BME680
            (temperatura, humedad, presión) y del conjunto DHT22 + BH1750
            (temperatura/humedad de respaldo e iluminación).
          </p>
        </div>

        <form className="daily__controls" onSubmit={handleSubmit}>
          <div className="daily__field">
            <label>Desde</label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="daily__field">
            <label>Hasta</label>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button className="daily__btn" disabled={loading}>
            {loading ? "Actualizando…" : "Actualizar rango"}
          </button>
        </form>
      </div>

      {errorMsg && <p className="daily__error">{errorMsg}</p>}

      {!hasData && !loading && !errorMsg && (
        <p className="daily__empty">
          No se encontraron datos en el rango seleccionado.
        </p>
      )}

      {hasData && (
        <>
          {/* ===== Grid de gráficas ===== */}
          <div className="daily__charts">
            {/* Temperatura */}
            <section className="daily__chart-card">
              <h3>Temperatura diaria (°C)</h3>
              <p>
                Comparación de temperatura promedio BME680 vs DHT22. Rango
                recomendado ASHRAE: {RANGE_TEMP.min}–{RANGE_TEMP.max} °C.
              </p>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bmeAvgTemp"
                      name="BME680 (°C)"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="dhtAvgTemp"
                      name="DHT22 (°C)"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Humedad */}
            <section className="daily__chart-card">
              <h3>Humedad relativa diaria (%)</h3>
              <p>
                Se contrasta la humedad promedio con el rango recomendado 40–60
                % para confort térmico en aulas (ASHRAE / OMS).
              </p>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mergedData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="bmeAvgHum"
                      name="BME680 (%)"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="dhtAvgHum"
                      name="DHT22 (%)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Luz */}
            <section className="daily__chart-card">
              <h3>Iluminación diaria (lux)</h3>
              <p>
                Niveles promedio de iluminación con referencia a ISO 8995 para
                aulas (≈ {RANGE_LUX.min}–{RANGE_LUX.max} lux).
              </p>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="dhtAvgLux"
                      name="BH1750 (lux)"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Presión */}
            <section className="daily__chart-card">
              <h3>Presión atmosférica diaria (hPa)</h3>
              <p>
                Presión promedio registrada por el BME680, útil para observar
                cambios de clima y estabilidad del sensor.
              </p>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bmeAvgPress"
                      name="BME680 (hPa)"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* ===== Tabla resumen ===== */}
          <section className="daily__table-card">
            <h3>Resumen diario por fecha</h3>
            <p>
              Promedios diarios de temperatura, humedad e iluminación para
              contrastar rápidamente con los rangos recomendados.
            </p>

            <div className="daily__tags">
              <span className="tag tag--ok">
                Temperatura objetivo: {RANGE_TEMP.min}–{RANGE_TEMP.max} °C
              </span>
              <span className="tag tag--ok">
                Humedad objetivo: {RANGE_HUM.min}–{RANGE_HUM.max} %
              </span>
              <span className="tag tag--warn">
                Iluminación referencia: {RANGE_LUX.min}–{RANGE_LUX.max} lux
              </span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Temp BME (°C)</th>
                  <th>Temp DHT (°C)</th>
                  <th>Hum BME (%)</th>
                  <th>Hum DHT (%)</th>
                  <th>Luz (lux)</th>
                  <th>Presión (hPa)</th>
                </tr>
              </thead>
              <tbody>
                {mergedData.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>
                      {row.bmeAvgTemp != null
                        ? row.bmeAvgTemp.toFixed(1)
                        : "—"}
                    </td>
                    <td>
                      {row.dhtAvgTemp != null
                        ? row.dhtAvgTemp.toFixed(1)
                        : "—"}
                    </td>
                    <td>
                      {row.bmeAvgHum != null
                        ? row.bmeAvgHum.toFixed(1)
                        : "—"}
                    </td>
                    <td>
                      {row.dhtAvgHum != null
                        ? row.dhtAvgHum.toFixed(1)
                        : "—"}
                    </td>
                    <td>
                      {row.dhtAvgLux != null
                        ? row.dhtAvgLux.toFixed(0)
                        : "—"}
                    </td>
                    <td>
                      {row.bmeAvgPress != null
                        ? row.bmeAvgPress.toFixed(1)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
