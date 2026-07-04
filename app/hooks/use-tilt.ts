import { useEffect, useRef } from "react";
import { Tilt } from "~/utils/animations/tilt";
import type { TiltOptions } from "~/utils/animations/tilt";

export function useTilt<T extends HTMLElement>(options?: TiltOptions) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    // Only enable on non-touch devices
    const isTouch = matchMedia("(hover: none)").matches;
    if (isTouch) return;

    const tilt = new Tilt(ref.current, options);

    return () => {
      tilt.destroy();
    };
  }, [options]);

  return ref;
}
