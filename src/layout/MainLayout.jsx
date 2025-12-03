// src/layout/MainLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import "../styles/layout/_layout.scss";
import ScrollTopButton from "../components/common/ScrollTopButton"; // 👈 importar

const NAV_ITEMS = [
  { to: "/", label: "Panorama actual", end: true },
  { to: "/daily", label: "Análisis diario" },
  { to: "/compliance", label: "Cumplimiento normas" },
  { to: "/research", label: "Investigación" },
  { to: "/research-extended", label: "Investigación extendida" }
];

export default function MainLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="app-shell">
      {/* Backdrop móvil */}
      <div
        className={
          "app-shell__backdrop" +
          (mobileNavOpen ? " app-shell__backdrop--visible" : "")
        }
        onClick={closeMobileNav}
      />

      {/* Sidebar */}
      <aside
        className={
          "app-shell__sidebar" +
          (mobileNavOpen ? " app-shell__sidebar--open" : "")
        }
      >
        <div className="sidebar__brand">
          <span className="brand__dot" />
          <span className="brand__text">Clima Aula</span>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                "nav-item" + (isActive ? " nav-item--active" : "")
              }
              onClick={closeMobileNav}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <footer className="sidebar__footer">
          <span>ESP32 · MongoDB · Aula 512</span>
        </footer>
      </aside>

      {/* Main */}
      <main className="app-shell__main">
        <header className="app-shell__header">
          <div className="app-shell__header-left">
            <button
              type="button"
              className="app-shell__menu-toggle"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label="Abrir menú de navegación"
            >
              <span />
              <span />
            </button>

            <div>
              <h1>Monitor Ambiental del Aula</h1>
              <p>Estudio de datos en tiempo real con contraste normativo.</p>
            </div>
          </div>
        </header>

        <section className="app-shell__content">
          <Outlet />
        </section>
      </main>

      {/* 👇 Botón global para volver arriba */}
      <ScrollTopButton />
    </div>
  );
}
