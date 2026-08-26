import { useEffect, useMemo, useState } from "react";
import { activeIndexFor } from "./FibonacciMotion.js";
import { useScrollProgress, useSpatialEnabled } from "./ScrollController.js";
import { SpatialContext } from "./SpatialContext.js";
import { SpatialSection } from "./SpatialSection.jsx";
import { SpatialArrows } from "./SpatialArrows.jsx";

/**
 * A nav pública tem três destinos (Sobre · Projetos · Contato). Projetos pode
 * ocupar vários planos no palco — um por item, até 3 — então seções com o
 * mesmo label colapsam num único link, ativo em qualquer índice do intervalo.
 */
function navItemsFromSections(sections) {
  const items = [];
  sections.forEach((section, index) => {
    const previous = items[items.length - 1];
    if (previous && previous.label === section.label) {
      previous.endIndex = index;
      return;
    }
    items.push({
      id: section.id,
      label: section.label,
      startIndex: index,
      endIndex: index,
    });
  });
  return items;
}

/**
 * Palco da navegação espacial: uma trilha de scroll real (uma viewport por
 * seção) alimenta um progresso contínuo que posiciona as seções em três
 * planos de profundidade. No modo plano, tudo vira fluxo vertical comum.
 */
export function SpatialContainer({ navigation, sections }) {
  const enabled = useSpatialEnabled();
  const { progress, goTo } = useScrollProgress(sections.length);
  const activeFromProgress = activeIndexFor(progress, sections.length);
  const [flatActiveIndex, setFlatActiveIndex] = useState(0);

  useEffect(() => {
    if (enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = sections.findIndex(
              (section) => section.id === entry.target.id,
            );
            if (index >= 0) setFlatActiveIndex(index);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element) => element !== null);
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [enabled, sections]);

  useEffect(() => {
    if (enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element) => element !== null);
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [enabled, sections]);

  const activeIndex = enabled ? activeFromProgress : flatActiveIndex;

  const navItems = useMemo(() => navItemsFromSections(sections), [sections]);

  const value = useMemo(
    () => ({
      enabled,
      progress,
      activeIndex,
      count: sections.length,
      navItems,
      goTo,
    }),
    [enabled, progress, activeIndex, sections.length, navItems, goTo],
  );

  return (
    <SpatialContext.Provider value={value}>
      <div
        className="spatial-track"
        style={{ "--section-count": sections.length }}
      >
        {navigation}
        <main className="spatial-viewport">
          {sections.map((section, index) => (
            <SpatialSection
              key={section.id}
              id={section.id}
              label={section.ariaLabel ?? section.label}
              nav={section.label}
              index={index}
              progress={progress}
              enabled={enabled}
              isActive={index === activeIndex}
            >
              {section.node}
            </SpatialSection>
          ))}
        </main>
        <SpatialArrows />
      </div>
    </SpatialContext.Provider>
  );
}
