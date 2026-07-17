import { useEffect, useRef } from "react";
import { Magnetic } from "~/utils/animations/magnetic";
import type { MagneticOptions } from "~/utils/animations/magnetic";

export function useMagnetic<T extends HTMLElement>(options?: MagneticOptions) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    // Only enable on non-touch devices
    const isTouch = matchMedia("(hover: none)").matches;
    if (isTouch) return;

    const magnetic = new Magnetic(ref.current, options);

    return () => {
      magnetic.destroy();
    };
  }, [options]);

  return ref;
}
