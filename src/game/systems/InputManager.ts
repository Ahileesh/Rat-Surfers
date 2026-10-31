export type InputAction = 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE' | 'PAUSE' | 'START';

export class InputManager {
  private queuedActions: InputAction[] = [];
  private startX: number = 0;
  private startY: number = 0;
  private isInteracting: boolean = false;
  private isInteractiveTarget: boolean = false;
  private hasTriggeredGesture: boolean = false;
  private isInitialized: boolean = false;
  private onActionCallback?: (action: InputAction) => void;

  constructor(callback?: (action: InputAction) => void) {
    this.init(callback);
  }

  private isElementInteractive(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest('button, [data-interactive="true"], a, input, select, textarea')
    );
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Ignore key repeat to prevent jumping through all 3 lanes on hold
    if (e.repeat) return;

    // Ignore if typing in an input element
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    let action: InputAction | null = null;

    const code = e.code;
    const key = e.key;

    if (code === 'ArrowLeft' || key === 'ArrowLeft' || code === 'KeyA' || key === 'a' || key === 'A') {
      action = 'LEFT';
    } else if (code === 'ArrowRight' || key === 'ArrowRight' || code === 'KeyD' || key === 'd' || key === 'D') {
      action = 'RIGHT';
    } else if (code === 'ArrowUp' || key === 'ArrowUp' || code === 'KeyW' || key === 'w' || key === 'W' || code === 'Space' || key === ' ') {
      action = 'JUMP';
    } else if (code === 'ArrowDown' || key === 'ArrowDown' || code === 'KeyS' || key === 's' || key === 'S') {
      action = 'SLIDE';
    } else if (code === 'Escape' || key === 'Escape' || code === 'KeyP' || key === 'p' || key === 'P') {
      action = 'PAUSE';
    } else if (code === 'Enter' || key === 'Enter') {
      action = 'START';
    }

    if (action) {
      // Prevent browser scroll or spacebar page jump
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', ' '].includes(code) || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(key)) {
        e.preventDefault();
      }
      this.queuedActions.push(action);
      this.onActionCallback?.(action);
    }
  };

  private startGesture(clientX: number, clientY: number, target: EventTarget | null) {
    if (this.isElementInteractive(target)) {
      this.isInteractiveTarget = true;
      this.isInteracting = false;
      this.hasTriggeredGesture = false;
      return;
    }

    this.isInteractiveTarget = false;
    this.startX = clientX;
    this.startY = clientY;
    this.isInteracting = true;
    this.hasTriggeredGesture = false;
  }

  private moveGesture(clientX: number, clientY: number) {
    if (!this.isInteracting || this.isInteractiveTarget || this.hasTriggeredGesture) return;

    const deltaX = clientX - this.startX;
    const deltaY = clientY - this.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Fast, crisp threshold for immediate responsiveness (22px)
    const threshold = 22;
    if (absX >= threshold || absY >= threshold) {
      let action: InputAction;
      if (absX > absY) {
        action = deltaX > 0 ? 'RIGHT' : 'LEFT';
      } else {
        action = deltaY < 0 ? 'JUMP' : 'SLIDE';
      }

      this.queuedActions.push(action);
      this.onActionCallback?.(action);

      this.hasTriggeredGesture = true;
      this.isInteracting = false;
    }
  }

  private endGesture(clientX: number, clientY: number) {
    if (this.hasTriggeredGesture || !this.isInteracting || this.isInteractiveTarget) {
      this.isInteracting = false;
      this.isInteractiveTarget = false;
      this.hasTriggeredGesture = false;
      return;
    }
    this.isInteracting = false;

    const deltaX = clientX - this.startX;
    const deltaY = clientY - this.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const minDist = 16;

    if (absX >= minDist || absY >= minDist) {
      let action: InputAction;
      if (absX > absY) {
        action = deltaX > 0 ? 'RIGHT' : 'LEFT';
      } else {
        action = deltaY < 0 ? 'JUMP' : 'SLIDE';
      }
      this.queuedActions.push(action);
      this.onActionCallback?.(action);
    }
    this.hasTriggeredGesture = false;
  }

  // Pointer event listeners (desktop mice, trackpads, stylus)
  private handlePointerDown = (e: PointerEvent) => {
    this.startGesture(e.clientX, e.clientY, e.target);
  };

  private handlePointerMove = (e: PointerEvent) => {
    this.moveGesture(e.clientX, e.clientY);
  };

  private handlePointerUp = (e: PointerEvent) => {
    this.endGesture(e.clientX, e.clientY);
  };

  private handlePointerCancel = () => {
    this.isInteracting = false;
    this.isInteractiveTarget = false;
    this.hasTriggeredGesture = false;
  };

  // Direct touch event listeners (mobile phones, tablets, iframe touchscreens)
  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.startGesture(touch.clientX, touch.clientY, e.target);
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.moveGesture(touch.clientX, touch.clientY);
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      this.endGesture(touch.clientX, touch.clientY);
    } else {
      this.handlePointerCancel();
    }
  };

  public init(callback?: (action: InputAction) => void) {
    if (callback) this.onActionCallback = callback;
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Attach keyboard listener
    window.addEventListener('keydown', this.handleKeyDown, { passive: false });

    // Attach pointer listeners
    window.addEventListener('pointerdown', this.handlePointerDown, { passive: true });
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('pointerup', this.handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', this.handlePointerCancel, { passive: true });

    // Attach touch listeners for iframe & mobile robustness
    window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.handlePointerCancel, { passive: true });
  }

  public popAction(): InputAction | undefined {
    return this.queuedActions.shift();
  }

  public triggerAction(action: InputAction) {
    this.queuedActions.push(action);
    this.onActionCallback?.(action);
  }

  public clear() {
    this.queuedActions = [];
  }

  public destroy() {
    this.isInitialized = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerCancel);

    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('touchcancel', this.handlePointerCancel);
  }
}
