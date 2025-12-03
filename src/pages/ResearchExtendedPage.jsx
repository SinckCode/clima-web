// src/pages/ResearchExtendedPage.jsx
import "../styles/pages/_researchExtended.scss";

export default function ResearchExtendedPage() {
  return (
    <div className="research-extended">
      <header className="research-extended__header">
        <h2>Investigación extendida del clima del aula</h2>
        <p>
          Este apartado desarrolla en formato más académico la fundamentación,
          metodología, discusión y propuestas del proyecto de monitoreo
          ambiental del aula 512, basado en sensores ESP32, BME680, DHT22 y
          BH1750 con almacenamiento en MongoDB.
        </p>
      </header>

      <section>
        <h3>1. Introducción general</h3>
        <p>
          El presente estudio analiza las condiciones reales del aula 512
          mediante un sistema de monitoreo ambiental construido con un ESP32 y
          sensores de temperatura, humedad, presión e iluminación. Los datos se
          almacenan en una base de datos MongoDB y se visualizan en un
          dashboard desarrollado en React. El objetivo principal es evaluar si
          el salón cumple con los rangos de confort y calidad ambiental
          recomendados por organismos como <strong>ASHRAE</strong>, la{" "}
          <strong>OMS</strong> y la norma <strong>ISO 8995</strong>, y traducir
          estos datos en conclusiones prácticas para el aprendizaje.
        </p>
      </section>

      <section>
        <h3>2. Marco normativo: tabla comparativa</h3>
        <p>
          La siguiente tabla resume los rangos de referencia utilizados para
          interpretar las lecturas de los sensores:
        </p>

        <div className="research-extended__table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Norma / organismo</th>
                <th>Variable</th>
                <th>Rango recomendado</th>
                <th>Contexto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ASHRAE 55</td>
                <td>Temperatura del aire</td>
                <td>23–27 °C</td>
                <td>Confort térmico en ocupación sedentaria</td>
              </tr>
              <tr>
                <td>ASHRAE 55 / OMS</td>
                <td>Humedad relativa</td>
                <td>40–60 %</td>
                <td>Confort y reducción de riesgos para la salud</td>
              </tr>
              <tr>
                <td>ISO 8995</td>
                <td>Iluminación</td>
                <td>300–500 lux</td>
                <td>Aulas y puestos de trabajo con lectura/escritura</td>
              </tr>
              <tr>
                <td>OMS / EPA</td>
                <td>Calidad del aire interior</td>
                <td>
                  Depende de ventilación, ocupación y control de contaminantes
                </td>
                <td>Salud respiratoria y confort general</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Estos rangos se utilizaron como referencia para interpretar los
          porcentajes de cumplimiento calculados en la API de estadísticas del
          sistema (<code>/api/stats/compliance</code>).
        </p>
      </section>

      <section>
        <h3>3. Justificación científica del estudio</h3>
        <p>
          La literatura científica muestra que las condiciones físicas del
          entorno de aprendizaje influyen directamente en el rendimiento
          académico. Temperaturas elevadas o muy bajas pueden afectar la
          concentración y la velocidad de procesamiento; la humedad relativa
          fuera de rango aumenta la sensación de incomodidad e incluso favorece
          la proliferación de microorganismos; y una iluminación deficiente
          incrementa la fatiga visual y el esfuerzo cognitivo requerido para
          leer o tomar apuntes.
        </p>
        <p>
          Desde esta perspectiva, el aula no es solo un espacio físico, sino un
          sistema donde el confort térmico, la ergonomía visual y la calidad
          del aire condicionan la experiencia de los estudiantes. Por ello,
          disponer de mediciones continuas basadas en sensores y compararlas
          contra normas internacionales convierte a este proyecto en un
          ejercicio real de aplicación de bases de datos, IoT y análisis de
          datos al servicio del bienestar y del aprendizaje.
        </p>
      </section>

      <section>
        <h3>4. Metodología científica aplicada</h3>
        <p>
          El diseño metodológico del estudio puede describirse como un estudio{" "}
          <strong>observacional, cuantitativo y longitudinal</strong>, en el
          que se monitoriza el ambiente del aula durante varios días y se
          analizan tendencias y patrones.
        </p>
        <ul>
          <li>
            <strong>Tipo de estudio:</strong> observacional (no se interviene
            directamente en el ambiente), cuantitativo (se trabaja con datos
            numéricos) y longitudinal (se observa la evolución en el tiempo).
          </li>
          <li>
            <strong>Instrumentación:</strong> ESP32 con sensores BME680, DHT22
            y BH1750, conectados por I²C y alimentados con fuentes reguladas.
          </li>
          <li>
            <strong>Frecuencia de muestreo:</strong> envío de lecturas al
            backend aproximadamente cada 10 segundos.
          </li>
          <li>
            <strong>Almacenamiento:</strong> MongoDB, con documentos que
            incluyen timestamp y valores de cada variable ambiental.
          </li>
          <li>
            <strong>Procesamiento:</strong> uso de pipelines de agregación para
            obtener promedios diarios, mínimos, máximos y porcentajes de
            cumplimiento.
          </li>
          <li>
            <strong>Tratamiento de outliers:</strong> se descartan lecturas
            con valores imposibles (por ejemplo, temperaturas &lt; 0 °C o &gt;
            60 °C, humedades de 0 % constantes, etc.), normalmente originadas
            por fallos momentáneos de comunicación con el sensor.
          </li>
        </ul>
      </section>

      <section>
        <h3>5. Selección y justificación técnica de los sensores</h3>
        <p>
          La elección de los sensores no fue arbitraria, sino que responde a
          criterios de precisión, estabilidad y disponibilidad.
        </p>
        <ul>
          <li>
            <strong>BME680:</strong> sensor avanzado que mide temperatura,
            humedad, presión y gas (relacionado con calidad de aire). Es ideal
            para proyectos de monitoreo ambiental porque ofrece buena
            resolución y estabilidad en lecturas prolongadas.
          </li>
          <li>
            <strong>DHT22:</strong> se emplea como respaldo de temperatura y
            humedad. Permite comparar lecturas con el BME680 y detectar
            posibles descalibraciones o fallos de uno de los sensores.
          </li>
          <li>
            <strong>BH1750:</strong> sensor digital de luz diseñado
            específicamente para medir iluminancia en <em>lux</em>, con un
            rango amplio y alta sensibilidad, adecuado para evaluar si la
            iluminación en el aula se aproxima a los valores de la norma ISO
            8995.
          </li>
        </ul>
      </section>

      <section>
        <h3>6. Arquitectura del sistema de monitoreo</h3>
        <p>
          El sistema completo se basa en una arquitectura típica de IoT,
          donde los datos fluyen desde los sensores hacia la nube y luego se
          visualizan en un dashboard web.
        </p>

        <pre className="research-extended__diagram">
{`[Sensores: BME680, DHT22, BH1750]
              │
              ▼
            ESP32
              │  (HTTP POST cada ~10 s)
              ▼
   API Node.js / Express (sensores.angelonesto.com)
              │
              ▼
          MongoDB (lecturas)
              │
              ▼
  Endpoints /api/stats/* para análisis
              │
              ▼
    Frontend React (Clima Aula Dashboard)`}
        </pre>

        <p>
          Esta arquitectura ofrece varias ventajas: desacopla la captura de
          datos del análisis, permite escalar a más salones simplemente
          agregando más nodos ESP32, y facilita la construcción de vistas
          especializadas como el panel de panorama actual, el análisis diario y
          la sección de cumplimiento de normas.
        </p>
      </section>

      <section>
        <h3>7. Discusión general de resultados</h3>
        <p>
          A partir de las gráficas y porcentajes obtenidos en las otras
          secciones del dashboard, se pueden destacar varios puntos clave:
        </p>
        <ul>
          <li>
            <strong>Temperatura:</strong> en muchos rangos de tiempo la
            temperatura se mantiene en valores cercanos al rango 23–27 °C, lo
            que indica que el aula suele ser térmicamente confortable, aunque
            existen periodos más fríos o ligeramente fuera del rango recomendado.
          </li>
          <li>
            <strong>Humedad relativa:</strong> la humedad tiende a ser más
            estable y, con frecuencia, se mantiene dentro o cerca del 40–60 %,
            lo que favorece el confort y reduce problemas de resequedad o
            excesiva condensación.
          </li>
          <li>
            <strong>Iluminación:</strong> en los análisis de lux se observan
            periodos con niveles inferiores a los 300 lux recomendados, lo que
            sugiere que la iluminación artificial o la entrada de luz natural
            podrían ser insuficientes en ciertos horarios o zonas del aula.
          </li>
          <li>
            <strong>Presión atmosférica:</strong> la presión se mantiene
            estable, como era de esperarse, pero resulta útil para verificar la
            consistencia del sensor BME680 y para correlacionar cambios
            bruscos con variaciones de clima exterior.
          </li>
        </ul>
      </section>

      <section>
        <h3>8. Propuestas de mejora para el aula</h3>
        <p>
          A partir de la comparación entre datos reales y normas, se pueden
          plantear sugerencias concretas:
        </p>
        <ul>
          <li>
            <strong>Mejorar la iluminación:</strong> revisar el número y tipo
            de luminarias, considerar la instalación de iluminación LED de
            mayor rendimiento y estudiar la distribución de luz en las zonas de
            trabajo de los estudiantes.
          </li>
          <li>
            <strong>Optimizar el confort térmico:</strong> aunque la
            temperatura suele ser aceptable, podría complementarse con sistemas
            de ventilación controlados o con una mejor gestión de ventanas y
            cortinas, según la época del año.
          </li>
          <li>
            <strong>Extender el monitoreo:</strong> replicar el sistema en
            otros salones para comparar ambientes y priorizar intervenciones en
            aquellos con condiciones menos favorables.
          </li>
          <li>
            <strong>Monitorear CO₂:</strong> añadir un sensor de CO₂ permitiría
            evaluar con más precisión la calidad del aire interior y el nivel
            de ventilación, especialmente en horarios de alta ocupación.
          </li>
        </ul>
      </section>

      <section>
        <h3>9. Conclusiones y limitaciones del estudio</h3>
        <p>
          En términos generales, el aula 512 presenta condiciones ambientales
          razonablemente adecuadas para la realización de actividades
          académicas, con una temperatura y humedad que frecuentemente se
          acercan a los rangos normativos. No obstante, en el caso de la
          iluminación se identifican oportunidades de mejora importantes, ya
          que los niveles de lux no siempre alcanzan el intervalo recomendado
          por ISO 8995.
        </p>
        <p>
          Como principal limitación, el sistema utiliza un solo punto de
          medición, por lo que no capta posibles diferencias entre distintas
          zonas del salón (por ejemplo, cerca de ventanas o en la parte trasera
          del aula). Además, el estudio se realizó en un periodo concreto del
          año, por lo que sería útil repetir la medición en otras estaciones
          para analizar el impacto del clima exterior.
        </p>
      </section>

      <section>
        <h3>10. Línea futura: predicción y alertas con IA</h3>
        <p>
          Una posible evolución del proyecto consiste en incorporar modelos
          predictivos que, a partir de los datos históricos del aula, puedan
          anticipar el comportamiento de la temperatura o de la humedad en los
          próximos minutos. Por ejemplo, un modelo de regresión podría
          estimar la temperatura futura como una combinación de la temperatura
          actual, la humedad, la hora del día y el día de la semana.
        </p>
        <p>
          Aunque en este trabajo la idea se plantea sólo de forma conceptual,
          abre la puerta a sistemas de alerta que notifiquen cuando se espera
          que el aula salga de los rangos de confort, o que recomienden
          acciones como encender ventiladores, ajustar cortinas o encender
          cierta cantidad de luminarias.
        </p>
      </section>
    </div>
  );
}
