export interface TiltOptions {
  maxRotateX?: number;
  maxRotateY?: number;
  scale?: number;
  lerp?: number;
}

export class Tilt {
  private element: HTMLElement;
  private maxRotateX: number;
  private maxRotateY: number;
  private scale: number;
  private lerp: number;
  private rect: DOMRect | null = null;
  private isHovered = false;
  
  private targetRotateX = 0;
  private targetRotateY = 0;
  private currentRotateX = 0;
  private currentRotateY = 0;
  
  private rafId: number | null = null;
  private hasReducedMotion = false;

  constructor(element: HTMLElement, options: TiltOptions = {}) {
    this.element = element;
    this.maxRotateX = options.maxRotateX || 6;
    this.maxRotateY = options.maxRotateY || 8;
    this.scale = options.scale || 1.01;
    this.lerp = options.lerp || 0.1;

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
    // We bind to the parent container usually, but here we assume the element itself or a wrapper
    // Actually, usually you track mouse over the element itself or window
    this.element.addEventListener("mouseenter", this.onMouseEnter, { passive: true });
    this.element.addEventListener("mousemove", this.onMouseMove, { passive: true });
    this.element.addEventListener("mouseleave", this.onMouseLeave, { passive: true });
  }

  private onMouseEnter = () => {
    this.isHovered = true;
    this.rect = this.element.getBoundingClientRect();
    this.element.style.willChange = "transform";
    this.startLoop();
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.rect) return;
    const x = e.clientX - this.rect.left;
    const y = e.clientY - this.rect.top;
    
    const xPct = (x / this.rect.width - 0.5) * 2; // -1 to 1
    const yPct = (y / this.rect.height - 0.5) * 2; // -1 to 1

    this.targetRotateY = xPct * this.maxRotateY;
    this.targetRotateX = -yPct * this.maxRotateX;
  };

  private onMouseLeave = () => {
    this.isHovered = false;
    this.targetRotateX = 0;
    this.targetRotateY = 0;
  };

  private startLoop() {
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  private loop = () => {
    this.currentRotateX += (this.targetRotateX - this.currentRotateX) * this.lerp;
    this.currentRotateY += (this.targetRotateY - this.currentRotateY) * this.lerp;

    const scale = this.isHovered ? this.scale : 1;

    this.element.style.transform = `scale(${scale}) rotateX(${this.currentRotateX}deg) rotateY(${this.currentRotateY}deg)`;

    // If not hovered and close to 0, stop loop
    if (!this.isHovered && Math.abs(this.currentRotateX) < 0.01 && Math.abs(this.currentRotateY) < 0.01) {
      this.resetTransform();
      this.rafId = null;
      return;
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  private resetTransform() {
    this.element.style.transform = "";
    this.element.style.willChange = "auto";
  }

  public destroy() {
    this.element.removeEventListener("mouseenter", this.onMouseEnter);
    this.element.removeEventListener("mousemove", this.onMouseMove);
    this.element.removeEventListener("mouseleave", this.onMouseLeave);
    window.matchMedia("(prefers-reduced-motion: reduce)").removeEventListener("change", this.handleMotionChange);
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
