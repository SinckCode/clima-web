// src/components/common/StatCard.jsx
import "../../styles/components/_statCard.scss";

const STATUS_LABELS = {
  dentro: "Dentro del rango",
  bajo: "Por debajo del rango",
  alto: "Por encima del rango",
  sin_dato: "Sin dato",
};

export default function StatCard({
  title,
  value,
  unit,
  status = "sin_dato",
  subtitle,
}) {
  const statusClass = `stat-card__status stat-card__status--${status}`;

  return (
    <article className={`stat-card stat-card--${status}`}>
      <header className="stat-card__header">
        <h3>{title}</h3>
        {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
      </header>

      <div className="stat-card__body">
        <span className="stat-card__value">
          {value !== null && value !== undefined ? value : "—"}
        </span>
        {unit && <span className="stat-card__unit">{unit}</span>}
      </div>

      <footer className="stat-card__footer">
        <span className={statusClass}>{STATUS_LABELS[status] || "—"}</span>
      </footer>
    </article>
  );
}
