"use client";

import { createContext, useContext } from "react";

export type SpatialState = {
  /** Modo espacial ligado (desktop + movimento pleno). */
  enabled: boolean;
  /** Progresso contínuo 0 … count-1. */
  progress: number;
  /** Índice da seção ativa (primeiro plano). */
  activeIndex: number;
  count: number;
  goTo: (index: number) => void;
};

export const SpatialContext = createContext<SpatialState>({
  enabled: false,
  progress: 0,
  activeIndex: 0,
  count: 3,
  goTo: () => {},
});

export function useSpatial(): SpatialState {
  return useContext(SpatialContext);
}
