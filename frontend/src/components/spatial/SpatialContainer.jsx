import { useEffect, useMemo, useState } from "react";
import { activeIndexFor } from "./FibonacciMotion.js";
import { useScrollProgress, useSpatialEnabled } from "./ScrollController.js";
import { SpatialContext } from "./SpatialContext.js";
import { SpatialSection } from "./SpatialSection.jsx";
import { SpatialArrows } from "./SpatialArrows.jsx";

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

  const value = useMemo(
    () => ({ enabled, progress, activeIndex, count: sections.length, goTo }),
    [enabled, progress, activeIndex, sections.length, goTo],
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
              label={section.label}
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
