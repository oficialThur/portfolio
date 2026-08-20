import { createContext, useContext } from "react";

export const SpatialContext = createContext({
  enabled: false,
  progress: 0,
  activeIndex: 0,
  count: 3,
  goTo: () => {},
});

export function useSpatial() {
  return useContext(SpatialContext);
}
