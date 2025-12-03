// src/pages/ResearchPage.jsx
import { useEffect, useRef, useState } from "react";
import "../styles/pages/_research.scss";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const API_BASE = "https://sensores.angelonesto.com/api";
const PIE_COLORS = ["#34d399", "#f97373"];

export default function ResearchPage() {
  const reportRef = useRef(null);

  const [compliance, setCompliance] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  // ================== Carga de stats reales ==================
  useEffect(() => {
    const loadCompliance = async () => {
      try {
        setLoadingStats(true);
        setErrorStats(null);

        const res = await fetch(`${API_BASE}/stats/compliance`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setCompliance(data);
      } catch (err) {
        console.error("[ResearchPage] Error al cargar compliance:", err);
        setErrorStats("No se pudieron cargar las estadísticas de cumplimiento.");
      } finally {
        setLoadingStats(false);
      }
    };

    loadCompliance();
  }, []);

  // ================== Datos derivados ==================
  const tempOk =
    compliance?.temperatureHumidity?.tempOkPct != null
      ? Number(compliance.temperatureHumidity.tempOkPct)
      : null;
  const humOk =
    compliance?.temperatureHumidity?.humOkPct != null
      ? Number(compliance.temperatureHumidity.humOkPct)
      : null;
  const bothOk =
    compliance?.temperatureHumidity?.bothOkPct != null
      ? Number(compliance.temperatureHumidity.bothOkPct)
      : null;
  const lightOk =
    compliance?.light?.lightOkPct != null
      ? Number(compliance.light.lightOkPct)
      : null;

  const formatPct = (v) =>
    v == null || Number.isNaN(v) ? "N/D" : `${v.toFixed(1)} %`;

  // ================== Datos para Recharts ==================
  const barData = compliance?.temperatureHumidity
    ? [
        {
          name: "Temp",
          value: Number(
            compliance.temperatureHumidity.tempOkPct?.toFixed(1) || 0
          )
        },
        {
          name: "Humedad",
          value: Number(
            compliance.temperatureHumidity.humOkPct?.toFixed(1) || 0
          )
        },
        {
          name: "Temp+Hum",
          value: Number(
            compliance.temperatureHumidity.bothOkPct?.toFixed(1) || 0
          )
        }
      ]
    : [];

  const pieData = compliance?.light
    ? [
        {
          name: "Dentro de rango",
          value: Number(compliance.light.lightOkPct?.toFixed(1) || 0)
        },
        {
          name: "Fuera de rango",
          value: Number(100 - (compliance.light.lightOkPct || 0))
        }
      ]
    : [];

// ================== Exportar a PDF ==================
const handleExportPdf = async () => {
  if (!reportRef.current) return;

  try {
    const root = reportRef.current;
    const sections = Array.from(root.querySelectorAll("section"));

    if (sections.length === 0) {
      alert("No se encontraron secciones para exportar.");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const verticalMargin = 5; // espacio entre secciones dentro de la misma página
    let isFirstPage = true;
    let currentY = 0; // posición actual en la página

    for (const section of sections) {
      const canvas = await html2canvas(section, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#050716"
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // ===== Caso 1: la sección cabe en una página =====
      if (imgHeight <= pageHeight) {
        // ¿Cabe en lo que queda de ESTA página?
        if (!isFirstPage && currentY + imgHeight > pageHeight) {
          pdf.addPage();
          currentY = 0;
        }

        // Primera página ya está creada por defecto en jsPDF
        pdf.addImage(imgData, "PNG", 0, currentY, imgWidth, imgHeight);
        isFirstPage = false;
        currentY += imgHeight + verticalMargin;
      } else {
        // ===== Caso 2: la sección es más alta que una página (hay que "cortarla") =====
        let position = 0;
        let heightLeft = imgHeight;

        while (heightLeft > 0) {
          // siempre arrancamos estos trozos desde arriba de una página
          if (!isFirstPage) {
            pdf.addPage();
          }

          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

          heightLeft -= pageHeight;
          position -= pageHeight;
          isFirstPage = false;
          currentY = pageHeight; // esta página ya quedó ocupada completa
        }

        // obligamos a que la siguiente sección empiece en una página nueva
        pdf.addPage();
        isFirstPage = false;
        currentY = 0;
      }
    }

    pdf.save("reporte_clima_aula.pdf");
  } catch (err) {
    console.error("[ResearchPage] Error al exportar PDF:", err);
    alert("Ocurrió un error al generar el PDF. Revisa la consola para más detalles.");
  }
};



  return (
    <div className="research-page">
      {/* Barra de acciones */}
      <div className="research-page__header">
        <div>
          <h1>Investigación y análisis ambiental del aula</h1>
          <p className="subtitle">
            Estudio basado en datos reales recopilados por sensores ESP32 y almacenados en MongoDB.
          </p>
        </div>

        <button className="btn-export" onClick={handleExportPdf}>
          Exportar reporte a PDF
        </button>
      </div>

      {/* Contenido del reporte (esto es lo que se exporta) */}
      <div className="research" ref={reportRef}>
        {/* =================== 0. Resumen visual =================== */}
        <section className="research__summary">
          <h2>Resumen visual del cumplimiento</h2>

          {loadingStats && <p>Cargando estadísticas desde la API de sensores...</p>}

          {errorStats && <p className="error">{errorStats}</p>}

          {!loadingStats && !errorStats && compliance && (
            <div className="research__summary-grid">
              {/* Cards de porcentajes */}
              <div className="summary-cards">
                <div className="summary-card">
                  <span className="label">Temp OK</span>
                  <span className="value">{formatPct(tempOk)}</span>
                  <p>Porcentaje de lecturas con temperatura dentro de 23–27 °C.</p>
                </div>

                <div className="summary-card">
                  <span className="label">Humedad OK</span>
                  <span className="value">{formatPct(humOk)}</span>
                  <p>Lecturas con humedad entre 40 y 60 %.</p>
                </div>

                <div className="summary-card">
                  <span className="label">Temp+Hum OK</span>
                  <span className="value">{formatPct(bothOk)}</span>
                  <p>
                    Veces en que temperatura y humedad estuvieron
                    simultáneamente en rango de confort.
                  </p>
                </div>

                <div className="summary-card">
                  <span className="label">Luz OK</span>
                  <span className="value">{formatPct(lightOk)}</span>
                  <p>Tiempo con iluminación dentro de 300–500 lux (ISO 8995).</p>
                </div>
              </div>

              {/* Gráficas */}
              <div className="summary-charts">
                <div className="chart-box">
                  <h3>Cumplimiento de confort térmico</h3>
                  <div className="chart-box__inner">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={barData}>
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-box">
                  <h3>Cumplimiento de iluminación</h3>
                  <div className="chart-box__inner">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loadingStats && !errorStats && !compliance && (
            <p>No se encontraron datos de cumplimiento para el rango consultado.</p>
          )}
        </section>

        {/* ========================================================= */}
        {/* 1. Planteamiento del problema */}
        {/* ========================================================= */}
        <section>
          <h2>1. Planteamiento del problema</h2>
          <p>
            En el aula 512, donde se imparte la materia, se instaló un monitor ambiental basado
            en un ESP32 equipado con sensores de temperatura, humedad, iluminación y presión
            atmosférica. El grupo utiliza este salón de lunes a viernes en un horario aproximado
            de 14:00 a 21:00 horas, por lo que el sistema registra tanto los periodos con
            ocupación como los momentos en que el aula permanece vacía.
          </p>
          <p>
            Durante varios días de funcionamiento continuo, el sistema generó cientos de miles
            de lecturas consolidadas en MongoDB, lo que permite analizar el comportamiento
            ambiental del salón a lo largo del día, entre días laborales y fines de semana.
          </p>
          <p>
            A pesar de contar con un conjunto de datos tan amplio, inicialmente no se había evaluado
            si las condiciones ambientales del salón cumplen con los rangos recomendados por
            organismos especializados como la <strong>OMS</strong>, <strong>ASHRAE</strong>,
            <strong>ISO 8995</strong> y la <strong>EPA</strong>.
          </p>
          <p>
            Esta falta de evaluación dificulta determinar si el ambiente del aula favorece el
            aprendizaje, la ergonomía visual y el confort térmico, o si existen riesgos
            ambientales que puedan impactar la salud y el rendimiento académico.
          </p>
        </section>

        {/* ========================================================= */}
        {/* 2. Justificación */}
        {/* ========================================================= */}
        <section>
          <h2>2. Justificación del estudio</h2>
          <p>
            El ambiente térmico y lumínico influye directamente en la concentración, la
            productividad y el bienestar de los estudiantes. Evaluar las condiciones reales del
            salón permite:
          </p>

          <ul>
            <li>Identificar si la temperatura favorece el confort térmico.</li>
            <li>Detectar niveles de humedad que podrían afectar la salud.</li>
            <li>Evaluar la iluminación para asegurar ergonomía visual adecuada.</li>
            <li>Comparar el aula con estándares internacionales de calidad ambiental.</li>
            <li>Generar evidencia que permita sugerir mejoras reales.</li>
          </ul>
        </section>

        {/* ========================================================= */}
        {/* 3. Preguntas de investigación */}
        {/* ========================================================= */}
        <section>
          <h2>3. Preguntas de investigación</h2>

          <ul>
            <li>¿La temperatura registrada se encuentra dentro del rango recomendado para aulas?</li>
            <li>¿La humedad relativa favorece el confort térmico según estándares internacionales?</li>
            <li>¿Los niveles de iluminación cumplen con la norma ISO 8995 para espacios educativos?</li>
            <li>¿Cómo varían las condiciones ambientales a lo largo de distintos días y horas?</li>
            <li>¿Qué patrones o anomalías se observan en las lecturas recopiladas por los sensores?</li>
          </ul>
        </section>

        {/* ========================================================= */}
        {/* 4. Objetivos */}
        {/* ========================================================= */}
        <section>
          <h2>4. Objetivos</h2>

          <h3>Objetivo general</h3>
          <p>
            Evaluar las condiciones ambientales del aula mediante el análisis de datos reales
            almacenados en MongoDB y compararlos con estándares internacionales para determinar
            si el ambiente es óptimo para el aprendizaje.
          </p>

          <h3>Objetivos específicos</h3>
          <ul>
            <li>Depurar y organizar los datos recopilados por el ESP32.</li>
            <li>Aplicar consultas y pipelines de agregación en MongoDB.</li>
            <li>Obtener indicadores diarios, mínimos, máximos y variaciones por hora.</li>
            <li>Detectar valores atípicos y posibles fallas de sensor.</li>
            <li>Comparar los datos reales con las recomendaciones de OMS, ASHRAE, ISO y EPA.</li>
            <li>Generar conclusiones y sugerencias basadas en evidencia.</li>
          </ul>
        </section>

        {/* ========================================================= */}
        {/* 5. Marco normativo */}
        {/* ========================================================= */}
        <section>
          <h2>5. Marco normativo y científico</h2>

          <h3>5.1 Organización Mundial de la Salud (OMS)</h3>
          <p>
            La OMS establece que temperaturas muy elevadas o variaciones frecuentes pueden afectar
            la salud y el bienestar. Para interiores se recomienda una temperatura mínima de
            aproximadamente <strong>18 °C</strong>, y enfatiza el impacto de la humedad en la
            capacidad del cuerpo para regular el calor.
          </p>

          <h3>5.2 ASHRAE (ANSI/ASHRAE 55-2023)</h3>
          <p>
            Este estándar define condiciones ambientales óptimas para ocupación sedentaria en
            espacios educativos. Comúnmente se toman como referencia:
          </p>
          <ul>
            <li><strong>Temperatura ideal: 23–27 °C</strong></li>
            <li><strong>Humedad relativa: 40–60 %</strong></li>
          </ul>

          <h3>5.3 ISO 8995 — Iluminación en lugares de trabajo</h3>
          <p>
            Para aulas, se recomienda un nivel aproximado de <strong>300–500 lux</strong>,
            aunque puede variar según diseño arquitectónico, luz natural y distribución de luminarias.
          </p>

          <h3>5.4 EPA — Calidad del aire interior</h3>
          <p>
            La EPA se centra en ventilación, renovación de aire y reducción de contaminantes.
            Un aula puede tener temperatura correcta, pero si no hay ventilación adecuada,
            la calidad ambiental aún puede verse comprometida.
          </p>
        </section>

        {/* ========================================================= */}
        {/* 6. Desarrollo del estudio y resultados (texto) */}
        {/* ========================================================= */}
        <section>
          <h2>6. Desarrollo del estudio y resultados</h2>
          <p>
            El análisis de los datos se complementa con las herramientas visuales desarrolladas
            en este sistema:
          </p>

          <ul>
            <li>
              <strong>Panorama actual:</strong> muestra los valores más recientes registrados
              por ambos sensores.
            </li>
            <li>
              <strong>Análisis diario:</strong> presenta promedios, mínimos y máximos por día
              con base en miles de lecturas.
            </li>
            <li>
              <strong>Cumplimiento normas:</strong> calcula los porcentajes de cumplimiento según
              las recomendaciones de ASHRAE, OMS e ISO 8995.
            </li>
          </ul>

          <p>
            A partir de los resultados obtenidos se observa que la humedad del aula mantiene
            un alto grado de cumplimiento respecto al rango recomendado, mientras que la
            temperatura solo se encuentra en el intervalo de confort una fracción del tiempo
            y la iluminación presenta un grado de incumplimiento considerable.
          </p>

          <h3>6.1 Comportamiento diario y horario</h3>
          <p>
            El estudio incluyó varios días consecutivos de noviembre y diciembre de 2025,
            comparando tanto días de clase como fines de semana. A nivel diario se
            identificaron los siguientes patrones generales:
          </p>
          <ul>
            <li>
              <strong>Días de clase (lunes a viernes, 14:00–21:00):</strong> se observa un
              incremento claro de temperatura de 1–2 °C durante el horario de ocupación y un
              ligero aumento de humedad (por respiración y presencia de personas), mientras que
              la presión atmosférica se mantiene estable. Fuera de ese horario, la temperatura
              vuelve a valores más bajos y constantes.
            </li>
            <li>
              <strong>Fines de semana y horarios sin uso:</strong> la temperatura se mantiene
              más baja y casi plana alrededor de 21–22 °C, la humedad es extremadamente estable
              y los niveles de luz se acercan a 0 lux casi todo el tiempo, lo que confirma que
              el salón permanece cerrado o con las luces apagadas.
            </li>
            <li>
              <strong>Días “ideales” de medición:</strong> jornadas como el 26 y 29 de
              noviembre o el 2 de diciembre presentan datos muy limpios, sin valores imposibles,
              con humedad casi perfecta (45–50 %) y presión estable, por lo que sirven como
              referencia para el comportamiento normal del salón sin fallas de sensor.
            </li>
            <li>
              <strong>Días con anomalías de sensor:</strong> en algunos días iniciales se
              detectaron outliers evidentes (temperaturas mayores a 200 °C, humedades de 0 % o
              lecturas de gas en 0 Ω), típicos de fallos momentáneos de comunicación I²C o
              configuración incompleta. Estos registros se identificaron y descartaron en la
              interpretación estadística para no distorsionar las conclusiones.
            </li>
          </ul>

          {/* ===== NUEVO: 6.2 Tipología de días según el PDF ===== */}
          <h3>6.2 Tipología de días según el análisis día a día</h3>
          <p>
            Además del comportamiento global, el análisis detallado día por día permitió
            clasificar las jornadas en diferentes tipos, combinando la información del BME680
            (temperatura, humedad y presión) con el DHT22 + BH1750 (temperatura, humedad y luz).
          </p>

          <ul>
            <li>
              <strong>Días calurosos y ligeramente secos (21 de noviembre):</strong> el
              BME680 reportó un promedio cercano a 26.5 °C con humedades alrededor del 33 %,
              lo que indica un ambiente caluroso y seco. El DHT22 confirmó temperaturas altas
              (mediana ≈ 26.8 °C) y humedades por debajo del 40 %, mientras que la iluminación
              se mantuvo muy baja (mediana ≈ 36 lux), lejos del mínimo recomendado de 300 lux.
            </li>
            <li>
              <strong>Días de confort térmico casi perfecto (24–26 de noviembre):</strong> en
              estas fechas la temperatura media del BME680 se estabilizó alrededor de 23 °C y la
              humedad entre 42–48 %, prácticamente dentro del rango ASHRAE durante casi todo el
              día. El DHT22 mostró un patrón muy similar, con medias de ~23 °C y humedades en
              torno al 48–52 %. Estos días son un buen ejemplo de “aula confortable” desde el
              punto de vista térmico.
            </li>
            <li>
              <strong>Días frescos pero confortables (27–29 de noviembre):</strong> la
              temperatura se mantuvo ligeramente por debajo de 23 °C (medias ~22–22.5 °C), con
              un ambiente fresco pero aún cómodo para ocupación ligera. La humedad se mantuvo
              casi ideal (45–50 %), por lo que el confort global seguía siendo aceptable pese a
              estar por debajo del rango ASHRAE en parte del día.
            </li>
            <li>
              <strong>Días de aula prácticamente vacía (30 de noviembre y parte de
              1–2 de diciembre):</strong> en estos días la temperatura fue extremadamente
              estable (≈ 22 °C con variaciones menores a 1.5 °C) y la humedad se mantuvo casi
              constante, señal de que el aula permaneció cerrada, con poca o nula ocupación.
              El patrón lumínico (mediana 0 lux y picos muy bajos) refuerza la idea de un salón
              sin actividad académica.
            </li>
            <li>
              <strong>Días con impacto claro de la ocupación (1 y 2 de diciembre):</strong>{" "}
              aunque la mayor parte del tiempo el aula se mantuvo en torno a 22–22.5 °C, se
              observan aumentos claros de temperatura hasta 23–24 °C durante el horario de
              clases, junto con ligeros incrementos de humedad. Esto muestra cómo la presencia
              de estudiantes modifica el microclima interior sin generar condiciones extremas.
            </li>
            <li>
              <strong>Días críticamente oscuros (22, 28–30 de noviembre, 1–2 de
              diciembre):</strong> en estos días la mediana de iluminación fue literalmente
              0 lux o muy cercana, lo que significa que más de la mitad del tiempo el salón
              estuvo en penumbra total. Incluso los máximos (entre 100 y 270 lux) nunca
              alcanzaron los 300 lux mínimos de la ISO 8995, evidenciando que la falta de
              iluminación es un problema estructural y no un evento aislado.
            </li>
          </ul>

          {/* ===== NUEVO: 6.3 Calidad de datos y tratamiento de outliers ===== */}
          <h3>6.3 Calidad de los datos y tratamiento de outliers</h3>
          <p>
            El análisis diario también permitió evaluar la calidad del conjunto de datos
            generado por los sensores y decidir qué lecturas debían tratarse como ruido o
            errores puntuales:
          </p>

          <ul>
            <li>
              <strong>Outliers evidentes en los primeros días:</strong> en fechas como
              el 24 de noviembre se detectaron temperaturas imposibles (por encima de
              200 °C), humedades de 0 % y valores de presión claramente fuera del rango
              esperado. Estos eventos se asociaron a fallos de comunicación I²C o a
              configuración incompleta del BME680 y se descartaron en el análisis
              estadístico final.
            </li>
            <li>
              <strong>Días totalmente limpios:</strong> a partir del 25 de noviembre
              varios días (25, 26, 27, 28, 29, 30 de noviembre y 1–2 de diciembre) no
              presentaron valores imposibles, ni spikes, ni caídas bruscas. Son los días
              más confiables para comparar directamente contra las normas, porque el
              sensor funcionó sin errores detectables.
            </li>
            <li>
              <strong>Gas / VOC no habilitado:</strong> en prácticamente todas las
              jornadas el valor de <code>gas_resistance_ohms</code> se mantuvo en 0 Ω.
              Esto confirma que el modo de calidad de aire (VOC / IAQ) del BME680 no se
              encontraba activado, por lo que el análisis se centró en temperatura,
              humedad y presión, que sí fueron consistentes.
            </li>
            <li>
              <strong>Diferencias sistemáticas entre BME680 y DHT22:</strong> el DHT22
              tiende a reportar temperaturas 1–2 °C por encima del BME680 y humedades
              ligeramente distintas, algo esperable por las tolerancias de cada sensor.
              Por ello, el análisis se hizo comparando tendencias y no solo valores
              absolutos, confirmando que ambos coinciden en la forma general de las
              curvas (subida con ocupación, estabilidad en fines de semana, etc.).
            </li>
            <li>
              <strong>BH1750 como evidencia de problema real:</strong> el sensor de luz
              (BH1750) mostró consistentemente niveles muy bajos de lux incluso en los
              días donde el resto de variables eran “perfectas”. Al no presentarse
              lecturas absurdas ni ruido electrónico, se concluye que la oscuridad del
              aula es un fenómeno real y no un fallo del hardware.
            </li>
          </ul>
        </section>

        {/* ========================================================= */}
        {/* 7. Tabla comparativa normas vs datos reales */}
        {/* ========================================================= */}
        <section>
          <h2>7. Tabla comparativa entre normas y datos reales</h2>
          <p>
            La siguiente tabla resume la comparación entre los rangos recomendados por
            organismos internacionales y el porcentaje de lecturas reales del aula que
            se encuentran dentro de dichos rangos.
          </p>

          <div className="table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Rango recomendado</th>
                  <th>Resultado real del aula</th>
                  <th>Conclusión</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Temperatura</td>
                  <td>23–27 °C (ASHRAE / OMS)</td>
                  <td>
                    {tempOk == null
                      ? "En espera de datos"
                      : `${tempOk.toFixed(1)} % de lecturas en rango`}
                  </td>
                  <td>
                    {tempOk == null
                      ? "N/D"
                      : tempOk >= 80
                      ? "Cumple la mayor parte del tiempo"
                      : "No cumple la mayor parte del tiempo"}
                  </td>
                </tr>
                <tr>
                  <td>Humedad relativa</td>
                  <td>40–60 % (ASHRAE / OMS / EPA)</td>
                  <td>
                    {humOk == null
                      ? "En espera de datos"
                      : `${humOk.toFixed(1)} % de lecturas en rango`}
                  </td>
                  <td>
                    {humOk == null
                      ? "N/D"
                      : humOk >= 80
                      ? "Cumple ampliamente"
                      : "Cumplimiento parcial"}
                  </td>
                </tr>
                <tr>
                  <td>Iluminación</td>
                  <td>300–500 lux (ISO 8995)</td>
                  <td>
                    {lightOk == null
                      ? "En espera de datos"
                      : `${lightOk.toFixed(1)} % de lecturas en rango`}
                  </td>
                  <td>
                    {lightOk == null
                      ? "N/D"
                      : lightOk >= 80
                      ? "Cumple de forma adecuada"
                      : "Presenta deficiencias importantes"}
                  </td>
                </tr>
                <tr>
                  <td>Temp + Hum simultáneas</td>
                  <td>Temp 23–27 °C y HR 40–60 %</td>
                  <td>
                    {bothOk == null
                      ? "En espera de datos"
                      : `${bothOk.toFixed(1)} % de lecturas con ambas condiciones`}
                  </td>
                  <td>
                    {bothOk == null
                      ? "N/D"
                      : bothOk >= 80
                      ? "Confort térmico estable"
                      : "Confort térmico limitado"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 8. Respuestas a las preguntas de investigación */}
        {/* ========================================================= */}
        <section>
          <h2>8. Respuestas a las preguntas de investigación</h2>

          <p>
            <strong>Pregunta 1 – Temperatura:</strong>{" "}
            {tempOk == null ? (
              "Aún no hay datos suficientes para evaluar la temperatura."
            ) : (
              <>
                solo alrededor del <strong>{tempOk.toFixed(1)} %</strong> de las lecturas se
                encuentra dentro del rango 23–27 °C. Por lo tanto, la temperatura del aula no
                cumple la mayor parte del tiempo con las condiciones de confort establecidas
                por ASHRAE y la OMS, aunque en el horario de clases se observan incrementos
                que acercan más los valores al rango recomendado.
              </>
            )}
          </p>

          <p>
            <strong>Pregunta 2 – Humedad relativa:</strong>{" "}
            {humOk == null ? (
              "Aún no hay datos suficientes para evaluar la humedad relativa."
            ) : (
              <>
                aproximadamente <strong>{humOk.toFixed(1)} %</strong> de las lecturas se sitúan
                dentro del intervalo 40–60 %, lo que indica que la humedad del aula sí favorece
                el confort térmico según los estándares internacionales y se mantiene muy
                estable tanto en días de clase como en fines de semana.
              </>
            )}
          </p>

          <p>
            <strong>Pregunta 3 – Iluminación:</strong>{" "}
            {lightOk == null ? (
              "Aún no hay datos suficientes para evaluar la iluminación."
            ) : lightOk <= 1 ? (
              <>
                el cumplimiento respecto al rango 300–500 lux es prácticamente nulo (
                <strong>{lightOk.toFixed(1)} %</strong>), por lo que el nivel de iluminación no
                es adecuado para actividades académicas, de acuerdo con la referencia de la ISO
                8995. Incluso en los mejores días, la mayoría de lecturas se mantienen muy por
                debajo del mínimo recomendado.
              </>
            ) : (
              <>
                solo alrededor del <strong>{lightOk.toFixed(1)} %</strong> de las lecturas cae
                dentro del rango 300–500 lux, lo que sugiere deficiencias significativas de
                iluminación en el aula.
              </>
            )}
          </p>

          <p>
            <strong>Pregunta 4 – Variaciones entre horas y días:</strong> el análisis diario,
            considerando el horario típico de 14:00 a 21:00, evidencia variaciones claras:
            la temperatura tiende a incrementarse cuando el salón está ocupado y a disminuir
            cuando queda vacío; la humedad se mantiene estable con ligeras subidas durante la
            presencia de estudiantes; y la iluminación presenta valores bajos de forma
            sistemática, con picos breves que rara vez alcanzan el nivel recomendado.
          </p>

          <p>
            <strong>Pregunta 5 – Patrones y anomalías:</strong> se identifican patrones
            consistentes en la estabilidad de la humedad y la fluctuación de la temperatura, así
            como anomalías asociadas principalmente a fallas de comunicación o configuración
            del sensor (lecturas imposibles de temperatura, 0 % de humedad o valores nulos de
            gas). La limpieza de estos outliers fue clave para obtener conclusiones confiables.
          </p>
        </section>

        {/* ========================================================= */}
        {/* 9. Conclusiones técnicas */}
        {/* ========================================================= */}
        <section>
          <h2>9. Conclusiones técnicas</h2>

          <ul>
            <li>
              La humedad relativa del aula presenta un desempeño sobresaliente, con un alto
              porcentaje de lecturas dentro del rango de confort recomendado, lo que indica
              buenas condiciones de ventilación y estabilidad ambiental.
            </li>
            <li>
              La temperatura únicamente se mantiene dentro del rango recomendado una fracción del
              tiempo, especialmente durante el horario de clases; el resto del día el salón tiende
              a estar ligeramente más frío de lo recomendado, aunque aún en un rango confortable
              para la mayoría de las personas.
            </li>
            <li>
              La iluminación muestra el mayor grado de incumplimiento, con un porcentaje muy bajo
              de lecturas en el rango 300–500 lux, lo que puede impactar negativamente la lectura,
              la toma de apuntes y la ergonomía visual de los estudiantes.
            </li>
            <li>
              Se observó una correlación directa entre el horario de uso del salón (14:00–21:00)
              y el aumento ligero de temperatura y humedad, mientras que los fines de semana y
              mañanas sin clase muestran curvas casi planas, lo que valida que los sensores
              reflejan fielmente la ocupación real del aula.
            </li>
            <li>
              Desde el punto de vista de Bases de Datos, MongoDB resultó adecuado para almacenar y
              procesar decenas de miles de documentos en tiempo real, permitiendo aplicar
              pipelines de agregación complejos sin una degradación significativa del rendimiento.
            </li>
            <li>
              La combinación de ESP32, Node.js, MongoDB y React constituye una arquitectura
              flexible para sistemas de monitoreo ambiental que integran captura de datos,
              almacenamiento masivo y visualización analítica.
            </li>
          </ul>
        </section>

        {/* ========================================================= */}
        {/* 10. Recomendaciones */}
        {/* ========================================================= */}
        <section>
          <h2>10. Recomendaciones</h2>
          <ul>
            <li>
              Evaluar mejoras en el sistema de ventilación o climatización del aula para reducir
              el porcentaje de tiempo con temperaturas fuera del rango de confort.
            </li>
            <li>
              Revisar el sistema de iluminación actual e incorporar luminarias que garanticen
              niveles cercanos a 300–500 lux en las zonas de trabajo de los estudiantes.
            </li>
            <li>
              Considerar la instalación de un sensor adicional de CO₂ para completar el análisis
              de calidad del aire interior y detectar posibles problemas de renovación de aire.
            </li>
            <li>
              Implementar mecanismos de detección y filtrado de lecturas atípicas (outliers) en
              el backend, con fines de limpieza y mejora de la calidad del dato.
            </li>
            <li>
              Extender el sistema a otros salones o espacios de la institución para comparar
              condiciones ambientales y priorizar intervenciones donde más se requiera.
            </li>
            <li>
              Realizar campañas de medición en otras épocas del año (invierno/verano) para
              estudiar cómo cambian las condiciones higrotérmicas con la estación y el clima
              exterior.
            </li>
          </ul>
        </section>

        {/* ========================================================= */}
        {/* 11. Conclusión personal */}
        {/* ========================================================= */}
        <section>
          <h2>11. Conclusión personal</h2>
          <p>
            Este proyecto permitió integrar hardware (ESP32), un backend en Node.js, una base de
            datos NoSQL y una interfaz en React para resolver un problema real dentro del aula.
            Trabajar con datos en tiempo real transformó la experiencia de la materia de Bases de
            Datos, pasando de ejemplos teóricos a un caso de uso tangible que puede influir en el
            bienestar de los estudiantes. Además, contrastar los datos con normas de organismos
            como la OMS, ASHRAE, ISO y EPA mostró cómo la tecnología y la estadística se conectan
            con decisiones concretas sobre el entorno educativo y obligan a pensar en términos de
            confort, salud y diseño del espacio, más allá del puro código.
          </p>
        </section>

        {/* ========================================================= */}
        {/* 12. Referencias bibliográficas (resumen) */}
        {/* ========================================================= */}
        <section>
          <h2>12. Referencias bibliográficas</h2>
          <ul>
            <li>
              ANSI/ASHRAE Standard 55-2023. <em>Thermal Environmental Conditions for Human
              Occupancy</em>. American Society of Heating, Refrigerating and Air-Conditioning
              Engineers.
            </li>
            <li>
              ISO 8995-1:2002. <em>Lighting of work places — Part 1: Indoor work places</em>.
              International Organization for Standardization.
            </li>
            <li>
              World Health Organization (WHO). <em>Guidelines for Indoor Temperature</em>. WHO,
              publicaciones sobre salud ambiental y confort térmico.
            </li>
            <li>
              U.S. Environmental Protection Agency (EPA). <em>Indoor Air Quality Tools for
              Schools: Reference Guide</em>. EPA, Office of Air and Radiation.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
