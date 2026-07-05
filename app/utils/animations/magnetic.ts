export interface MagneticOptions {
  distance?: number;
  scale?: number;
  lerp?: number;
}

export class Magnetic {
  private element: HTMLElement;
  private distance: number;
  private scale: number;
  private lerp: number;
  private rect: DOMRect | null = null;
  
  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;
  private isHovered = false;
  
  private rafId: number | null = null;
  private hasReducedMotion = false;

  constructor(element: HTMLElement, options: MagneticOptions = {}) {
    this.element = element;
    this.distance = options.distance || 8;
    this.scale = options.scale || 1.02;
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
    // We bind to the window to detect distance around the element
    window.addEventListener("mousemove", this.onMouseMove, { passive: true });
  }

  private onMouseMove = (e: MouseEvent) => {
    this.rect = this.element.getBoundingClientRect();
    
    // Calculate center of element
    const centerX = this.rect.left + this.rect.width / 2;
    const centerY = this.rect.top + this.rect.height / 2;
    
    // Distance from cursor to center
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    // If within ~120px radius, magnetize
    const triggerDistance = 120;
    
    if (distance < triggerDistance) {
      if (!this.isHovered) {
        this.isHovered = true;
        this.element.style.willChange = "transform";
        this.startLoop();
      }
      // Max displacement
      const maxDisplacementX = this.distance;
      const maxDisplacementY = this.distance;
      
      // Calculate pull (stronger closer to center, up to maxDisplacement)
      const pullX = (distX / triggerDistance) * maxDisplacementX;
      const pullY = (distY / triggerDistance) * maxDisplacementY;
      
      this.targetX = pullX;
      this.targetY = pullY;
    } else {
      if (this.isHovered) {
        this.isHovered = false;
        this.targetX = 0;
        this.targetY = 0;
      }
    }
  };

  private startLoop() {
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  private loop = () => {
    this.currentX += (this.targetX - this.currentX) * this.lerp;
    this.currentY += (this.targetY - this.currentY) * this.lerp;

    const scale = this.isHovered ? this.scale : 1;

    this.element.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) scale(${scale})`;

    // If not hovered and returned to origin, stop loop
    if (!this.isHovered && Math.abs(this.currentX) < 0.01 && Math.abs(this.currentY) < 0.01) {
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
    window.removeEventListener("mousemove", this.onMouseMove);
    window.matchMedia("(prefers-reduced-motion: reduce)").removeEventListener("change", this.handleMotionChange);
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
