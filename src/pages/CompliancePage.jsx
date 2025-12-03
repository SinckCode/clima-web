import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { getComplianceStats } from "../api/statsService";
import "../styles/pages/_compliance.scss";

const RANGE_TEMP = { min: 23, max: 27 }; // ASHRAE
const RANGE_HUM = { min: 40, max: 60 }; // ASHRAE / OMS
const RANGE_LUX = { min: 300, max: 500 }; // ISO 8995

const COLORS = ["#4caf50", "#2196f3", "#ff9800", "#9e9e9e"];

function formatDate(d) {
  return dayjs(d).format("YYYY-MM-DD");
}

function formatPct(value) {
  if (value == null || Number.isNaN(value)) return "N/D";
  return `${value.toFixed(1)} %`;
}

function classifyKpi(pct) {
  if (pct == null) return "neutral";
  if (pct >= 80) return "good";
  if (pct >= 40) return "mid";
  return "bad";
}

export default function CompliancePage() {
  const [from, setFrom] = useState(
    formatDate(dayjs().subtract(5, "day").toDate())
  );
  const [to, setTo] = useState(formatDate(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastCalc, setLastCalc] = useState(null);

  async function fetchCompliance() {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getComplianceStats({ from, to });
      setData(res);
      setLastCalc(new Date());
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudo obtener el cumplimiento de rangos.");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompliance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    fetchCompliance();
  }

  const th = data?.temperatureHumidity;
  const light = data?.light;

  const tempOk = th?.tempOkPct ?? null;
  const humOk = th?.humOkPct ?? null;
  const bothOk = th?.bothOkPct ?? null;
  const lightOk = light?.lightOkPct ?? null;

  const barData = [
    {
      name: "Temperatura",
      cumplimiento: tempOk ?? 0
    },
    {
      name: "Humedad",
      cumplimiento: humOk ?? 0
    },
    {
      name: "Temp+Hum",
      cumplimiento: bothOk ?? 0
    }
  ];

  const lightPieData = light
    ? [
        {
          name: "Dentro de rango",
          value: lightOk ?? 0
        },
        {
          name: "Fuera de rango",
          value: 100 - (lightOk ?? 0)
        }
      ]
    : [];

  // Textos para resumen
  const tempDesc =
    tempOk != null
      ? `La temperatura del aula se ha mantenido dentro del rango recomendado (≈ ${RANGE_TEMP.min}–${RANGE_TEMP.max} °C) en aproximadamente ${tempOk.toFixed(
          1
        )} % del tiempo analizado.`
      : "Aún no se cuenta con información suficiente de temperatura para este rango.";

  const humDesc =
    humOk != null
      ? `La humedad relativa ha permanecido entre ${RANGE_HUM.min} y ${RANGE_HUM.max} % en cerca de ${humOk.toFixed(
          1
        )} % del periodo, lo cual es importante para el confort térmico y la salud.`
      : "No hay datos suficientes de humedad para calcular el cumplimiento.";

  const bothDesc =
    bothOk != null
      ? `En aproximadamente ${bothOk.toFixed(
          1
        )} % del tiempo la combinación simultánea de temperatura y humedad se ha mantenido dentro de los rangos de confort, lo que es un indicador directo de calidad ambiental para el aprendizaje.`
      : "No se pudo evaluar la combinación temperatura + humedad para este rango.";

  const lightDesc =
    lightOk != null
      ? `La iluminación medida por el sensor BH1750 se ha encontrado en torno al rango de referencia para aulas (≈ ${RANGE_LUX.min}–${RANGE_LUX.max} lux) en cerca de ${lightOk.toFixed(
          1
        )} % del tiempo. El resto del tiempo se presenta como niveles inferiores o superiores a lo recomendado, lo que podría afectar la ergonomía visual.`
      : "No hay suficiente información sobre iluminación para evaluar el cumplimiento.";

  return (
    <div className="compliance">
      {/* ===== Header ===== */}
      <div className="compliance__header">
        <div className="compliance__title-block">
          <h2>Cumplimiento con normas internacionales</h2>
          <p className="compliance__subtitle">
            Se calcula el porcentaje de lecturas que cumplen con los rangos
            recomendados de temperatura, humedad e iluminación para aulas,
            según referencias de ASHRAE, OMS e ISO 8995.
          </p>
        </div>

        <form className="compliance__controls" onSubmit={handleSubmit}>
          <div className="compliance__field">
            <label>Desde</label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="compliance__field">
            <label>Hasta</label>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button className="compliance__btn" disabled={loading}>
            {loading ? "Calculando…" : "Actualizar rango"}
          </button>
        </form>
      </div>

      {/* Meta tags */}
      <div className="compliance__meta">
        {loading && <span className="tag tag--info">Calculando…</span>}
        {errorMsg && <span className="tag tag--error">{errorMsg}</span>}
        {!loading && !errorMsg && data && (
          <span className="tag tag--muted">
            Basado en {th?.total ?? 0} lecturas BME680 y{" "}
            {light?.total ?? 0} lecturas de iluminación.
          </span>
        )}
        {lastCalc && !loading && !errorMsg && (
          <span className="tag tag--muted">
            Último cálculo:{" "}
            {lastCalc.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            })}
          </span>
        )}
      </div>

      {/* Mensajes vacíos */}
      {!data && !loading && !errorMsg && (
        <p className="compliance__empty">
          Aún no hay datos suficientes para calcular el cumplimiento en el
          rango seleccionado.
        </p>
      )}

      {data && (
        <>
          {/* ===== KPIs principales ===== */}
          <div className="compliance__kpi-grid">
            <div
              className={`compliance__kpi-card compliance__kpi-card--${classifyKpi(
                tempOk
              )}`}
            >
              <span className="compliance__kpi-label">Temperatura OK</span>
              <span className="compliance__kpi-value">
                {formatPct(tempOk)}
              </span>
              <span className="compliance__kpi-hint">
                Lecturas en {RANGE_TEMP.min}–{RANGE_TEMP.max} °C
              </span>
            </div>

            <div
              className={`compliance__kpi-card compliance__kpi-card--${classifyKpi(
                humOk
              )}`}
            >
              <span className="compliance__kpi-label">Humedad OK</span>
              <span className="compliance__kpi-value">
                {formatPct(humOk)}
              </span>
              <span className="compliance__kpi-hint">
                Lecturas en {RANGE_HUM.min}–{RANGE_HUM.max} %
              </span>
            </div>

            <div
              className={`compliance__kpi-card compliance__kpi-card--${classifyKpi(
                bothOk
              )}`}
            >
              <span className="compliance__kpi-label">Temp + Hum OK</span>
              <span className="compliance__kpi-value">
                {formatPct(bothOk)}
              </span>
              <span className="compliance__kpi-hint">
                Confort térmico simultáneo
              </span>
            </div>

            <div
              className={`compliance__kpi-card compliance__kpi-card--${classifyKpi(
                lightOk
              )}`}
            >
              <span className="compliance__kpi-label">Luz OK</span>
              <span className="compliance__kpi-value">
                {formatPct(lightOk)}
              </span>
              <span className="compliance__kpi-hint">
                Lecturas en {RANGE_LUX.min}–{RANGE_LUX.max} lux
              </span>
            </div>
          </div>

          {/* Tags de rangos */}
          <div className="compliance__tags">
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

          {/* ===== Gráficas ===== */}
          <div className="compliance__top">
            {/* Barras de cumplimiento Temp/Hum */}
            <section className="compliance__card">
              <h3>Cumplimiento de temperatura y humedad</h3>
              <p>
                Porcentaje de lecturas que se encuentran dentro del rango de
                confort térmico recomendado para aulas (ASHRAE / OMS).
              </p>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="cumplimiento"
                      name="Cumplimiento (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Pie de iluminación */}
            <section className="compliance__card">
              <h3>Cumplimiento de iluminación</h3>
              <p>
                Porcentaje de tiempo en que la iluminación medida se sitúa
                dentro del rango de referencia para aulas, según ISO 8995.
              </p>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lightPieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {lightPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* ===== Resumen interpretativo ===== */}
          <section className="compliance__summary">
            <h3>Interpretación de resultados</h3>
            <p>
              Estos porcentajes son la base para responder a las preguntas del
              proyecto: si el aula se mantiene en condiciones adecuadas para el
              aprendizaje y cómo se compara frente a las recomendaciones de los
              organismos internacionales.
            </p>
            <ul>
              <li>{tempDesc}</li>
              <li>{humDesc}</li>
              <li>{bothDesc}</li>
              <li>{lightDesc}</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
