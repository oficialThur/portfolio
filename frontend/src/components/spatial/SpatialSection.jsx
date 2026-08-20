import { poseFor } from "./FibonacciMotion.js";

/**
 * Uma seção no palco espacial. No modo plano (mobile / movimento reduzido)
 * renderiza como bloco normal de fluxo; no modo espacial recebe a pose
 * (transform/blur/opacity) derivada do progresso contínuo do scroll.
 */
export function SpatialSection({
  id,
  label,
  index,
  progress,
  enabled,
  isActive,
  children,
}) {
  let style;

  if (enabled) {
    const pose = poseFor(index, progress);
    style = {
      transform: `translate3d(${pose.x}vw, ${pose.y}vh, 0) scale(${pose.scale})`,
      filter: pose.blur > 0.05 ? `blur(${pose.blur.toFixed(2)}px)` : "none",
      opacity: pose.opacity,
      zIndex: pose.zIndex,
      visibility: pose.opacity <= 0.01 ? "hidden" : "visible",
    };
  }

  return (
    <section
      id={id}
      aria-label={label}
      inert={enabled && !isActive}
      className="spatial-section"
      style={style}
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
        {children}
      </div>
    </section>
  );
}
