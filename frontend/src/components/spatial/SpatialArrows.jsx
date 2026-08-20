import { useSpatial } from "./SpatialContext.js";

/**
 * Indicadores de direção espacial (não são controles de página "up/down").
 * Finos e discretos; desaparecem nas extremidades da trajetória.
 * Só existem no modo espacial — no fluxo plano o scroll já é natural.
 */
export function SpatialArrows() {
  const { enabled, activeIndex, count, goTo } = useSpatial();

  if (!enabled) return null;

  const base =
    "fixed top-1/2 z-[105] flex h-11 w-11 -translate-y-1/2 items-center justify-center text-text-muted transition-[color,opacity] duration-200 ease-out hover:text-text-primary";
  const hidden = "pointer-events-none opacity-0";

  return (
    <>
      <button
        type="button"
        onClick={() => goTo(activeIndex - 1)}
        disabled={activeIndex === 0}
        aria-label="Seção anterior"
        className={`${base} left-5 lg:left-10 ${activeIndex === 0 ? hidden : ""}`}
      >
        <svg
          width="28"
          height="12"
          viewBox="0 0 28 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M28 6H2M6 1L1 6l5 5"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => goTo(activeIndex + 1)}
        disabled={activeIndex === count - 1}
        aria-label="Próxima seção"
        className={`${base} right-5 lg:right-10 ${activeIndex === count - 1 ? hidden : ""}`}
      >
        <svg
          width="28"
          height="12"
          viewBox="0 0 28 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 6h26M22 1l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </button>
    </>
  );
}
