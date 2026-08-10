import {
  AutoFocusTarget,
  CdkDialogContainer,
  Dialog,
  DialogRef,
  RestoreFocusValue,
} from '@angular/cdk/dialog';
import { ConnectedPosition, Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import {
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  TemplateRef,
  untracked,
} from '@angular/core';
import { ClassValue } from 'clsx';
import { filter, Subscription } from 'rxjs';
import { bui, UniqueId } from '../utils';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type PopoverPosition =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'start'
  | 'start-top'
  | 'start-bottom'
  | 'end'
  | 'end-top'
  | 'end-bottom';

export type PopoverAnchor = BuiPopoverAnchor | ElementRef | Element | { x: number; y: number };

// -----------------------------------------------------------------------------
// Position Mappings
// -----------------------------------------------------------------------------
const POSITION_MAP: Record<PopoverPosition, ConnectedPosition> = {
  top: {
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom',
  },
  'top-start': {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  'top-end': {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
  bottom: {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
  },
  'bottom-start': {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  'bottom-end': {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
  start: {
    originX: 'start',
    originY: 'center',
    overlayX: 'end',
    overlayY: 'center',
  },
  'start-top': {
    originX: 'start',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'top',
  },
  'start-bottom': {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'bottom',
  },
  end: {
    originX: 'end',
    originY: 'center',
    overlayX: 'start',
    overlayY: 'center',
  },
  'end-top': {
    originX: 'end',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'top',
  },
  'end-bottom': {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'bottom',
  },
};

const FALLBACK_POSITIONS: Record<PopoverPosition, PopoverPosition[]> = {
  top: ['bottom'],
  'top-start': ['bottom-start'],
  'top-end': ['bottom-end'],

  bottom: ['top'],
  'bottom-start': ['top-start'],
  'bottom-end': ['top-end'],

  start: ['end'],
  'start-top': ['end-top'],
  'start-bottom': ['end-bottom'],

  end: ['start'],
  'end-top': ['start-top'],
  'end-bottom': ['start-bottom'],
};

// -----------------------------------------------------------------------------
// Popover Root
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiPopover]',
  exportAs: 'buiPopover',
  host: {
    class: 'contents',
  },
})
export class BuiPopover {
  // Dependencies
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  private readonly scrollDispatcher = inject(ScrollDispatcher);
  private readonly uniqueId = inject(UniqueId);

  // Inputs / Outputs
  readonly isOpen = model(false, { alias: 'open' });
  readonly anchor = input<PopoverAnchor | null>(null);
  readonly position = input<PopoverPosition>('bottom');
  readonly offset = input(4, { transform: numberAttribute });
  readonly closeOnScroll = input(false);
  readonly autoFocus = input<AutoFocusTarget | string | undefined>('first-tabbable');
  readonly restoreFocus = input<RestoreFocusValue>(true);
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  readonly opened = output();
  readonly closed = output();

  // State
  private dialogRef: DialogRef | null = null;
  readonly portalTemplate = signal<TemplateRef<unknown> | null>(null);
  readonly internalAnchor = signal<PopoverAnchor | null>(null);
  private readonly pendingAnimations = signal(1);
  readonly isClosing = signal(true);
  readonly hasTitle = signal(false);
  readonly hasDescription = signal(false);
  private scrollSubscription?: Subscription;

  readonly id = this.uniqueId.getId('bui-popover-');
  readonly triggerId = `${this.id}-trigger`;
  readonly contentId = `${this.id}-content`;
  readonly titleId = `${this.id}-title`;
  readonly descriptionId = `${this.id}-description`;

  // Computed state
  readonly state = computed(() => (this.isOpen() ? 'open' : 'closed'));
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-popover',
      'isolate',
      'w-60',

      // Remove the focus outline from dialog container
      '*:[.cdk-dialog-container]:focus:outline-0',
      '*:[.cdk-dialog-container]:focus-visible:outline-0',

      // User classes
      this.userClass(),
    ),
  );
  private readonly positions = computed<ConnectedPosition[]>(() => {
    const primary = this.position();
    const offsetVal = this.offset();
    const fallbacks = FALLBACK_POSITIONS[primary];

    // Apply the correct directional offset
    const applyOffset = (position: PopoverPosition): ConnectedPosition => {
      const basePosition = { ...POSITION_MAP[position] };

      if (position.startsWith('top')) {
        basePosition.offsetY = -offsetVal; // Push it up
      } else if (position.startsWith('bottom')) {
        basePosition.offsetY = offsetVal; // Push it down
      } else if (position.startsWith('start')) {
        basePosition.offsetX = -offsetVal; // Push it left
      } else if (position.startsWith('end')) {
        basePosition.offsetX = offsetVal; // Push it right
      }

      return basePosition;
    };

    // Return the primary position + fallbacks with the offsets applied
    return [applyOffset(primary), ...fallbacks.map(applyOffset)];
  });
  private readonly activeAnchor = computed(() => {
    const anchor = this.anchor() ?? this.internalAnchor();

    if (anchor instanceof BuiPopoverAnchor) {
      return anchor.elementRef;
    }

    return anchor;
  });

  constructor() {
    effect(() => {
      const isOpen = this.isOpen();
      const template = this.portalTemplate();
      const anchor = this.activeAnchor();
      const closeOnScroll = this.closeOnScroll();

      untracked(() => {
        // Open the dialog
        if (isOpen && !this.dialogRef && anchor && template) {
          // Set isClosing to false
          this.isClosing.set(false);

          // Open the dialog and save the reference
          this.dialogRef = this.dialog.open(template, {
            id: this.id,
            hasBackdrop: true,
            disableClose: true,
            autoFocus: this.autoFocus(),
            restoreFocus: this.restoreFocus(),
            backdropClass: ['cdk-overlay-transparent-backdrop'],
            panelClass: this.computedClass().split(' '),
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            positionStrategy: this.overlay
              .position()
              .flexibleConnectedTo(anchor)
              .withPositions(this.positions())
              .withFlexibleDimensions(false)
              .withPush(true),
          });

          // Emit opened event
          this.opened.emit();

          // Listen for backdrop clicks and escape key presses
          // to close the dialog
          this.dialogRef.backdropClick.subscribe(() => this.isOpen.set(false));
          this.dialogRef.overlayRef
            .keydownEvents()
            .pipe(filter((event) => event.key === 'Escape'))
            .subscribe(() => this.isOpen.set(false));

          // Subscribe to scroll events if closeOnScroll is true
          if (closeOnScroll) {
            this.scrollSubscription = this.scrollDispatcher.scrolled().subscribe(() => {
              if (this.isOpen()) {
                this.isOpen.set(false);
              }
            });
          }
        }
        // Close the dialog
        else if (!isOpen && this.dialogRef && !this.isClosing()) {
          // Set isClosing to true
          this.isClosing.set(true);

          // Content is the only thing animating
          this.pendingAnimations.set(1);

          // Unsubscribe from scroll events
          this.scrollSubscription?.unsubscribe();
          this.scrollSubscription = undefined;
        }
      });
    });

    // This is a bit hacky, but the CdkDialogContainer doesn't provide
    // a stable way to set aria-labelledby and aria-describedby after the
    // dialog has been opened.
    effect(() => {
      const hasTitle = this.hasTitle();
      const hasDescription = this.hasDescription();

      untracked(() => {
        if (!this.dialogRef) {
          return;
        }

        const container = this.dialogRef.containerInstance as CdkDialogContainer;
        if (!container) {
          return;
        }

        if (hasTitle) {
          container._addAriaLabelledBy(this.titleId);
        } else {
          container._removeAriaLabelledBy(this.titleId);
        }

        this.dialogRef.config.ariaDescribedBy = hasDescription ? this.descriptionId : null;
      });
    });

    // Reposition the overlay whenever the active anchor OR the position/offset changes
    effect(() => {
      const anchor = this.activeAnchor();
      const positions = this.positions();

      untracked(() => {
        if (!anchor || !this.isOpen() || !this.dialogRef || this.isClosing()) {
          return;
        }

        // Update the position strategy with the new anchor and trigger a reposition
        this.dialogRef.overlayRef.updatePositionStrategy(
          this.overlay
            .position()
            .flexibleConnectedTo(anchor)
            .withPositions(positions)
            .withFlexibleDimensions(false)
            .withPush(true),
        );
      });
    });
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  registerAnimationComplete() {
    this.pendingAnimations.update((value) => value - 1);

    // Once all animations have completed,
    // close the dialog and emit the closed event
    if (this.pendingAnimations() <= 0 && this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
      this.closed.emit();
    }
  }
}

// -----------------------------------------------------------------------------
// Popover Trigger
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiPopoverTrigger]',
  exportAs: 'buiPopoverTrigger',
  host: {
    role: 'button',
    tabindex: '0',
    '[id]': 'popover.triggerId',
    '[class]': 'computedClass()',
    '[aria-controls]': 'popover.isOpen() ? popover.contentId : null',
    '[aria-expanded]': 'popover.isOpen()',
    '[aria-haspopup]': '"dialog"',
    '[attr.data-slot]': '"bui-popover-trigger"',
    '(click)': 'toggle()',
    '(keydown.enter)': 'handleKeydown($event)',
    '(keydown.space)': 'handleKeydown($event)',
  },
})
export class BuiPopoverTrigger {
  // Dependencies
  protected readonly popover = inject(BuiPopover);
  private readonly elementRef = inject(ElementRef);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-popover-trigger',

      // User classes
      this.userClass(),
    ),
  );

  constructor() {
    // Register this element as the internal anchor for the Overlay
    this.popover.internalAnchor.set(this.elementRef);
  }

  protected handleKeydown(event: Event) {
    event.preventDefault();
    this.toggle();
  }

  toggle() {
    this.popover.toggle();
  }
}

// -----------------------------------------------------------------------------
// Popover Close
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiPopoverClose]',
  exportAs: 'buiPopoverClose',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-popover-close"',
    '(click)': 'close()',
  },
})
export class BuiPopoverClose {
  // Dependencies
  private readonly popover = inject(BuiPopover);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-popover-close',

      // User classes
      this.userClass(),
    ),
  );

  close() {
    this.popover.close();
  }
}

// -----------------------------------------------------------------------------
// Popover Anchor
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiPopoverAnchor]',
  exportAs: 'buiPopoverAnchor',
})
export class BuiPopoverAnchor {
  readonly elementRef = inject(ElementRef);
}

// -----------------------------------------------------------------------------
// Popover Portal
// -----------------------------------------------------------------------------
@Directive({
  selector: 'ng-template[buiPopoverPortal]',
  exportAs: 'buiPopoverPortal',
})
export class BuiPopoverPortal {
  private readonly popover = inject(BuiPopover);
  private readonly templateRef = inject(TemplateRef);

  constructor() {
    this.popover.portalTemplate.set(this.templateRef);
  }
}

// -----------------------------------------------------------------------------
// Popover Content
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiPopoverContent]',
  exportAs: 'buiPopoverContent',
  host: {
    '[id]': 'popover.contentId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-popover-content"',
    '[attr.data-state]': 'popover.state()',
    '(animationend)': 'onAnimationEnd()',
  },
})
export class BuiPopoverContent {
  // Dependencies
  protected readonly popover = inject(BuiPopover);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-popover-content',
      'relative z-10 max-h-dvh sm:max-h-[85dvh]',
      'flex flex-col gap-y-1 p-4',
      'rounded-[var(--theme-border-radius)] border border-transparent',

      // Border color as the background to avoid corner rendering issues and
      // better shadow/background-color blending
      'bg-neutral-a4 dark:bg-neutral-a5',

      // Background implemented as the 'before' pseudo-element
      'before:pointer-events-none before:absolute before:inset-0 before:-z-10',
      'before:rounded-[calc(var(--theme-border-radius)-1px)]',
      'before:bg-white dark:before:bg-neutral-3',
      'before:shadow-lg',

      // Animations
      'transition-[opacity,scale] duration-100',
      'data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in',
      'data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out',

      // User classes
      this.userClass(),
    ),
  );

  onAnimationEnd() {
    if (this.popover.isClosing()) {
      this.popover.registerAnimationComplete();
    }
  }
}

// -----------------------------------------------------------------------------
// Popover Title
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiPopoverTitle]',
  exportAs: 'buiPopoverTitle',
  host: {
    '[id]': 'popover.titleId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-popover-title"',
  },
})
export class BuiPopoverTitle {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  protected readonly popover = inject(BuiPopover);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-popover-title',
      'text-lg font-medium',

      // User classes
      this.userClass(),
    ),
  );

  constructor() {
    // Announce existence to the parent popover
    this.popover.hasTitle.set(true);
    this.destroyRef.onDestroy(() => this.popover.hasTitle.set(false));
  }
}

// -----------------------------------------------------------------------------
// Popover Description
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiPopoverDescription]',
  exportAs: 'buiPopoverDescription',
  host: {
    '[id]': 'popover.descriptionId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-popover-description"',
  },
})
export class BuiPopoverDescription {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  protected readonly popover = inject(BuiPopover);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-popover-description',
      'text-neutral-a11',

      // User classes
      this.userClass(),
    ),
  );

  constructor() {
    // Announce existence to the parent popover
    this.popover.hasDescription.set(true);
    this.destroyRef.onDestroy(() => this.popover.hasDescription.set(false));
  }
}
