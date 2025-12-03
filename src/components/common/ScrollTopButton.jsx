// src/components/common/ScrollTopButton.jsx
import { useEffect, useState } from "react";
import "../../styles/layout/_scrollTop.scss"; // o donde prefieras importar estilos

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      // Muestra el botón después de bajar cierto px
      const y = window.scrollY || document.documentElement.scrollTop;
      setVisible(y > 220);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // para estado inicial

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div
      className={
        "scroll-top" + (visible ? " scroll-top--visible" : "")
      }
    >
      <button
        type="button"
        className="scroll-top__btn"
        onClick={handleClick}
        aria-label="Volver al inicio de la página"
      >
        <span className="scroll-top__icon">↑</span>
      </button>
    </div>
  );
}
