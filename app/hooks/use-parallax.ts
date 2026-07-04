import { useEffect, useRef } from "react";
import { Parallax } from "~/utils/animations/parallax";
import type { ParallaxOptions } from "~/utils/animations/parallax";

export function useParallax<T extends HTMLElement>(options?: ParallaxOptions) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    // Only enable on non-touch devices
    const isTouch = matchMedia("(hover: none)").matches;
    if (isTouch) return;

    const parallax = new Parallax(ref.current, options);

    return () => {
      parallax.destroy();
    };
  }, [options]);

  return ref;
}
