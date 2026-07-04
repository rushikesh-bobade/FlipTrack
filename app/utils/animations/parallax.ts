export interface ParallaxOptions {
  distance?: number;
  lerp?: number;
}

export class Parallax {
  private element: HTMLElement;
  private distance: number;
  private lerp: number;
  
  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;
  
  private rafId: number | null = null;
  private hasReducedMotion = false;

  constructor(element: HTMLElement, options: ParallaxOptions = {}) {
    this.element = element;
    this.distance = options.distance || 10;
    this.lerp = options.lerp || 0.05; // slower for almost subconscious movement

    this.checkReducedMotion();
    if (!this.hasReducedMotion) {
      this.init();
    }
  }

  private checkReducedMotion() {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.hasReducedMotion = mediaQuery.matches;
    mediaQuery.addEventListener("change", this.handleMotionChange);
  }

  private handleMotionChange = (e: MediaQueryListEvent) => {
    this.hasReducedMotion = e.matches;
    if (this.hasReducedMotion) {
      this.destroy();
      this.resetTransform();
    } else {
      this.init();
    }
  };

  private init() {
    window.addEventListener("mousemove", this.onMouseMove, { passive: true });
    this.element.style.willChange = "transform";
    this.startLoop();
  }

  private onMouseMove = (e: MouseEvent) => {
    const xPct = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
    const yPct = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

    this.targetX = -xPct * this.distance; // Move opposite to mouse for depth
    this.targetY = -yPct * this.distance;
  };

  private startLoop() {
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  private loop = () => {
    this.currentX += (this.targetX - this.currentX) * this.lerp;
    this.currentY += (this.targetY - this.currentY) * this.lerp;

    this.element.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;

    this.rafId = requestAnimationFrame(this.loop);
  };

  private resetTransform() {
    this.element.style.transform = "";
    this.element.style.willChange = "auto";
  }

  public destroy() {
    window.removeEventListener("mousemove", this.onMouseMove);
    window.matchMedia("(prefers-reduced-motion: reduce)").removeEventListener("change", this.handleMotionChange);
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
