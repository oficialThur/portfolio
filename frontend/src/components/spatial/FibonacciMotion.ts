/**
 * Trajetória espacial — calibração inicial dos "Known Gaps" do DESIGN.md.
 *
 * A intenção não é uma espiral matemática perfeita, mas a sensação de
 * proporção e curvatura: o raio decai geometricamente (0.85^|t|, eco da
 * proporção áurea) e cada seção atravessa o palco numa diagonal alternada
 * (arco vertical com sinal próprio), de modo que a travessia Sobre →
 * Projetos → Contato curva o espaço em vez de deslizar em linha reta.
 *
 * t = progress - index
 *   t = 0   → primeiro plano (ativo):  scale 1 · blur 0 · opacity 1
 *   t = -1  → segundo plano (entrando): scale 0.85 · blur 10 · opacity 0.65
 *   t = +1  → saindo; t = ±2 → terceiro plano: scale ~0.72 · blur 20 · opacity ~0.3
 *
 * Blur intensificado a pedido do dono (2026-08-16): planos de fundo bem mais
 * suaves para concentrar a leitura na seção ativa. Teto de 20px respeita o
 * limite de performance do DESIGN.md — nunca mais de duas seções borradas
 * por frame.
 */

export type SpatialPose = {
  /** vw — deslocamento horizontal (entrada pela direita, saída à esquerda) */
  x: number;
  /** vh — arco vertical da trajetória (a curvatura da espiral) */
  y: number;
  scale: number;
  /** px */
  blur: number;
  opacity: number;
  zIndex: number;
};

/** Decaimento geométrico da escala por plano de profundidade. */
const SCALE_FALLOFF = 0.85;
/** Alcance horizontal máximo da trajetória, saturado com a distância. */
const SPREAD_VW = 62;
/** Saturação da posição: planos distantes comprimem em vez de sair de cena. */
const SPREAD_COMPRESSION = 0.55;
/** Blur por plano (10px no segundo plano, teto de 20px no terceiro). */
const BLUR_PER_PLANE = 10;
const BLUR_MAX = 20;
/** Opacidade por plano: 0.65 no segundo, ~0.3 no terceiro, 0 além de ~2.9. */
const OPACITY_PER_PLANE = 0.35;
/** Arco vertical por seção (vh por t) — sinais alternados desenham a curva. */
const ARC_VH = [14, -11, 9];

export function poseFor(index: number, progress: number): SpatialPose {
  const t = progress - index;
  const at = Math.abs(t);
  const direction = Math.sign(t) || 0;

  const saturation = 1 - Math.pow(SPREAD_COMPRESSION, at);
  const x = -direction * SPREAD_VW * saturation;
  const y = ARC_VH[index % ARC_VH.length] * t;

  const scale = Math.pow(SCALE_FALLOFF, at);
  const blur = Math.min(at * BLUR_PER_PLANE, BLUR_MAX);
  const opacity = Math.max(0, 1 - at * OPACITY_PER_PLANE);
  const zIndex = Math.round(100 - at * 10);

  return { x, y, scale, blur, opacity, zIndex };
}

/** A seção "ativa" é a mais próxima do progresso atual. */
export function activeIndexFor(progress: number, count: number): number {
  return Math.min(Math.max(Math.round(progress), 0), count - 1);
}
