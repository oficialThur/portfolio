import { useEffect, useRef, useState } from "react";
import { useSpatial } from "../spatial/SpatialContext.js";
import { SPATIAL_QUERY } from "../spatial/ScrollController.js";
import { site } from "@/data/site.js";

const FALLBACK_LINKS = [
  { id: "sobre", label: "Sobre", startIndex: 0, endIndex: 0 },
  { id: "projetos", label: "Projetos", startIndex: 1, endIndex: 1 },
  { id: "contato", label: "Contato", startIndex: 2, endIndex: 2 },
];

/**
 * Navegação: nome fixo no topo à esquerda; lista de seções em coluna vertical
 * no canto superior direito (desktop) ou atrás de um hambúrguer de duas
 * linhas (mobile). A seção ativa recebe um único indicador — a linha 16×1px.
 */
export function Navigation() {
  const { enabled, activeIndex, goTo, navItems } = useSpatial();
  const links = navItems.length > 0 ? navItems : FALLBACK_LINKS;
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const mql = window.matchMedia(SPATIAL_QUERY);
    const closeOnSpatial = () => setMenuOpen(false);
    mql.addEventListener("change", closeOnSpatial);
    return () => mql.removeEventListener("change", closeOnSpatial);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () => {
      const links = Array.from(
        overlayRef.current?.querySelectorAll("a") ?? [],
      );
      return toggleRef.current ? [toggleRef.current, ...links] : links;
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const focusFirstLink = () => {
      const first = overlayRef.current?.querySelector("a");
      if (!first) return;
      if (first !== document.activeElement) first.focus();
      if (document.activeElement !== first) {
        requestAnimationFrame(focusFirstLink);
      }
    };
    const frame = requestAnimationFrame(focusFirstLink);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(frame);
    };
  }, [menuOpen]);

  const linkClass = (isActive) =>
    `group relative flex flex-col items-end text-nav-link transition-colors duration-200 ${
      isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary"
    }`;

  const indicator = (isActive) => (
    <span
      aria-hidden="true"
      className={`mt-1 h-px w-4 bg-text-primary transition-opacity duration-200 ${
        isActive ? "opacity-100" : "opacity-0"
      }`}
    />
  );

  const handleClick = (event, index) => {
    const wasOpen = menuOpen;

    if (enabled) {
      event.preventDefault();
      goTo(index);
    }

    setMenuOpen(false);

    // Ao fechar o menu, devolve o foco ao botão que o abriu.
    if (wasOpen) {
      requestAnimationFrame(() => toggleRef.current?.focus());
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[120] bg-background md:bg-transparent">
        <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-6 md:px-12">
          <button
            type="button"
            onClick={() => (enabled ? goTo(0) : window.scrollTo({ top: 0 }))}
            className="w-fit cursor-pointer text-nav-link font-medium text-text-primary"
          >
            {site.name}
          </button>

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="menu-overlay"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 text-text-primary md:hidden"
          >
            <span
              aria-hidden="true"
              className={`h-px w-6 bg-current transition-transform duration-200 ${
                menuOpen ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              aria-hidden="true"
              className={`h-px w-6 bg-current transition-transform duration-200 ${
                menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      <nav
        aria-label="Navegação de seções"
        className="fixed right-6 top-20 z-[110] hidden md:block lg:right-12"
      >
        <ul className="flex flex-col items-end gap-4">
          {links.map((link) => {
            const isActive =
              activeIndex >= link.startIndex && activeIndex <= link.endIndex;
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => handleClick(event, link.startIndex)}
                  className={linkClass(isActive)}
                >
                  {link.label}
                  {indicator(isActive)}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        ref={overlayRef}
        id="menu-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[100] flex flex-col items-start justify-center gap-2 bg-background px-6 transition-[opacity,visibility] duration-200 md:hidden ${
          menuOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      >
        {links.map((link) => {
          const isActive =
            activeIndex >= link.startIndex && activeIndex <= link.endIndex;
          return (
            <a
              key={link.id}
              href={`#${link.id}`}
              aria-current={isActive ? "location" : undefined}
              onClick={(event) => handleClick(event, link.startIndex)}
              tabIndex={menuOpen ? 0 : -1}
              className={`flex min-h-11 items-center text-heading-md transition-colors duration-200 ${
                isActive
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {link.label}
            </a>
          );
        })}
      </div>
    </>
  );
}
