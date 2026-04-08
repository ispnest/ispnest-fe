import {
  AutoFocusTarget,
  CdkDialogContainer,
  Dialog,
  DialogRef,
  RestoreFocusValue,
} from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  Injectable,
  input,
  model,
  output,
  signal,
  TemplateRef,
  untracked,
} from '@angular/core';
import { ClassValue } from 'clsx';
import { filter } from 'rxjs';
import { bui, UniqueId } from '../utils';

// -----------------------------------------------------------------------------
// Sheet Service
// -----------------------------------------------------------------------------
@Injectable({ providedIn: 'root' })
export class BuiSheetService {
  // State
  readonly openSheetsCount = signal(0);
}

// -----------------------------------------------------------------------------
// Sheet Root
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSheet]',
  exportAs: 'buiSheet',
  host: {
    class: 'contents',
  },
})
export class BuiSheet {
  // Dependencies
  private readonly dialog = inject(Dialog);
  private readonly sheetService = inject(BuiSheetService);
  private readonly overlay = inject(Overlay);
  private readonly uniqueId = inject(UniqueId);

  // Inputs / Outputs
  readonly isOpen = model(false, { alias: 'open' });
  readonly side = input<'top' | 'bottom' | 'start' | 'end'>('end');
  readonly autoFocus = input<AutoFocusTarget | string | undefined>('first-tabbable');
  readonly restoreFocus = input<RestoreFocusValue>(true);
  readonly disableClose = input(false, { transform: booleanAttribute });
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  readonly opened = output();
  readonly closed = output();

  // State
  private dialogRef: DialogRef | null = null;
  readonly portalTemplate = signal<TemplateRef<unknown> | null>(null);
  private readonly pendingAnimations = signal(2);
  readonly isClosing = signal(true);
  readonly hasBackdrop = signal(false);
  readonly hasTitle = signal(false);
  readonly hasDescription = signal(false);

  readonly id = this.uniqueId.getId('bui-sheet-');
  readonly backdropId = `${this.id}-backdrop`;
  readonly triggerId = `${this.id}-trigger`;
  readonly contentId = `${this.id}-content`;
  readonly titleId = `${this.id}-title`;
  readonly descriptionId = `${this.id}-description`;

  // Computed state
  readonly state = computed(() => (this.isOpen() ? 'open' : 'closed'));
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sheet',
      'isolate',

      // Remove the focus outline from dialog container
      '*:[.cdk-dialog-container]:focus:outline-0',
      '*:[.cdk-dialog-container]:focus-visible:outline-0',

      // User classes
      this.userClass(),
    ),
  );

  readonly depth = computed(() => {
    // Get total number of open dialogs from the service
    const totalCount = this.sheetService.openSheetsCount();

    // Bail if this specific dialog isn't open yet
    if (!this.dialogRef) return 0;

    // Find its exact place in the CDK array
    const index = this.dialog.openDialogs.indexOf(this.dialogRef);

    // Calculate depth (0 = top, 1 = one step back, etc.)
    return index === -1 ? 0 : Math.max(0, totalCount - 1 - index);
  });

  constructor() {
    effect((onCleanup) => {
      const isOpen = this.isOpen();
      const template = this.portalTemplate();

      untracked(() => {
        // Open the dialog
        if (isOpen && !this.dialogRef && template) {
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
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy: this.overlay
              .position()
              .global()
              .centerHorizontally()
              .centerVertically(),
          });

          // Update the open sheets count in the service
          this.sheetService.openSheetsCount.set(this.dialog.openDialogs.length);

          // Emit opened event
          this.opened.emit();

          // If disableClose is false, listen for backdrop clicks and
          // escape key presses to close the dialog
          if (!this.disableClose()) {
            const backdropSub = this.dialogRef.backdropClick.subscribe(() => {
              this.isOpen.set(false);
            });

            const keydownSub = this.dialogRef.overlayRef
              .keydownEvents()
              .pipe(filter((event) => event.key === 'Escape'))
              .subscribe(() => {
                this.isOpen.set(false);
              });

            // Cleanup subscriptions when the effect is re-run or destroyed
            onCleanup(() => {
              backdropSub.unsubscribe();
              keydownSub.unsubscribe();
            });
          }
        }
        // Close the dialog
        else if (!isOpen && this.dialogRef && !this.isClosing()) {
          // Set isClosing to true
          this.isClosing.set(true);

          // Set pending animations depending on whether
          // the dialog has a backdrop or not
          this.pendingAnimations.set(this.hasBackdrop() ? 2 : 1);

          // Eagerly decrement the count so the background dialog starts scaling
          // up simultaneously with this one fading out!
          this.sheetService.openSheetsCount.update((count) => count - 1);
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
  }

  toggle() {
    this.isOpen.update((value) => !value);
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  registerAnimationComplete() {
    this.pendingAnimations.update((value) => value - 1);

    // Once all animations have completed, close the dialog, set open dialogs
    // count and emit the closed event
    if (this.pendingAnimations() <= 0 && this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
      this.sheetService.openSheetsCount.set(this.dialog.openDialogs.length);
      this.closed.emit();
    }
  }
}

// -----------------------------------------------------------------------------
// Sheet Trigger
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSheetTrigger]',
  host: {
    role: 'button',
    tabindex: '0',
    '[id]': 'sheet.triggerId',
    '[class]': 'computedClass()',
    '[aria-controls]': 'sheet.isOpen() ? sheet.id : null',
    '[aria-expanded]': 'sheet.isOpen()',
    '[aria-haspopup]': '"dialog"',
    '[attr.data-slot]': '"sheet-trigger"',
    '(click)': 'open()',
    '(keydown.enter)': 'handleKeydown($event)',
    '(keydown.space)': 'handleKeydown($event)',
  },
})
export class BuiSheetTrigger {
  // Dependencies
  protected readonly sheet = inject(BuiSheet);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sheet-trigger',

      // User classes
      this.userClass(),
    ),
  );

  protected handleKeydown(event: Event) {
    event.preventDefault();
    this.open();
  }

  open() {
    this.sheet.open();
  }
}

// -----------------------------------------------------------------------------
// Sheet Close
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSheetClose]',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sheet-close"',
    '(click)': 'close()',
  },
})
export class BuiSheetClose {
  // Dependencies
  private readonly sheet = inject(BuiSheet);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sheet-close',

      // User classes
      this.userClass(),
    ),
  );

  close() {
    this.sheet.close();
  }
}

// -----------------------------------------------------------------------------
// Sheet Portal
// -----------------------------------------------------------------------------
@Directive({
  selector: 'ng-template[buiSheetPortal]',
})
export class BuiSheetPortal {
  private readonly sheet = inject(BuiSheet);
  private readonly templateRef = inject(TemplateRef);

  constructor() {
    this.sheet.portalTemplate.set(this.templateRef);
  }
}

// -----------------------------------------------------------------------------
// Sheet Backdrop
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSheetBackdrop]',
  host: {
    '[id]': 'sheet.backdropId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sheet-backdrop"',
    '[attr.data-state]': 'sheet.state()',
    '(animationend)': 'onAnimationEnd()',
  },
})
export class BuiSheetBackdrop {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  protected readonly sheet = inject(BuiSheet);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sheet-backdrop',
      'pointer-events-none fixed inset-0 z-0',
      'bg-black-a5 backdrop-blur-xs',

      // Animations
      'transition-opacity duration-300',
      'data-[state=open]:animate-in data-[state=open]:fade-in',
      'data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards data-[state=closed]:fade-out',

      // User classes
      this.userClass(),
    ),
  );

  constructor() {
    // Announce existence to the parent sheet
    this.sheet.hasBackdrop.set(true);
    this.destroyRef.onDestroy(() => {
      this.sheet.hasBackdrop.set(false);
    });
  }

  onAnimationEnd() {
    if (this.sheet.isClosing()) {
      this.sheet.registerAnimationComplete();
    }
  }
}

// -----------------------------------------------------------------------------
// Sheet Content
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSheetContent]',
  host: {
    '[id]': 'sheet.contentId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sheet-content"',
    '[attr.data-side]': 'sheet.side()',
    '[attr.data-state]': 'sheet.state()',
    '[style.--nested-sheets]': 'sheet.depth()',
    '(animationend)': 'onAnimationEnd()',
  },
})
export class BuiSheetContent {
  // Dependencies
  protected readonly sheet = inject(BuiSheet);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() => {
    return bui(
      // Base
      'group/bui-sheet-content',
      'fixed z-10 bg-white shadow-2xl transition ease-in-out dark:bg-neutral-3',
      'flex flex-col',

      // Nested sheets
      'transition-[opacity,scale,translate] duration-300',
      'scale-[calc(1-0.05*var(--nested-sheets))]',

      // Animations
      'data-[state=open]:animate-in',
      'data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards',

      // Side: top
      'data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:origin-top',
      'data-[side=top]:data-[state=open]:slide-in-from-top',
      'data-[side=top]:data-[state=closed]:slide-out-to-top',

      // Side: bottom
      'data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:origin-bottom',
      'data-[side=bottom]:data-[state=open]:slide-in-from-bottom',
      'data-[side=bottom]:data-[state=closed]:slide-out-to-bottom',

      // Side: start
      'data-[side=start]:inset-y-0 data-[side=start]:h-full data-[side=start]:w-3/4 data-[side=start]:sm:max-w-sm',

      'ltr:data-[side=start]:left-0 ltr:data-[side=start]:origin-left',
      'ltr:data-[side=start]:data-[state=open]:slide-in-from-left',
      'ltr:data-[side=start]:data-[state=closed]:slide-out-to-left',

      'rtl:data-[side=start]:right-0 rtl:data-[side=start]:origin-right',
      'rtl:data-[side=start]:data-[state=open]:slide-in-from-right',
      'rtl:data-[side=start]:data-[state=closed]:slide-out-to-right',

      // Side: end
      'data-[side=end]:inset-y-0 data-[side=end]:h-full data-[side=end]:w-3/4 data-[side=end]:sm:max-w-sm',

      'ltr:data-[side=end]:right-0 ltr:data-[side=end]:origin-right',
      'ltr:data-[side=end]:data-[state=open]:slide-in-from-right',
      'ltr:data-[side=end]:data-[state=closed]:slide-out-to-right',

      'rtl:data-[side=end]:left-0 rtl:data-[side=end]:origin-left',
      'rtl:data-[side=end]:data-[state=open]:slide-in-from-left',
      'rtl:data-[side=end]:data-[state=closed]:slide-out-to-left',

      // User classes
      this.userClass(),
    );
  });

  onAnimationEnd() {
    if (this.sheet.isClosing()) {
      this.sheet.registerAnimationComplete();
    }
  }
}

// -----------------------------------------------------------------------------
// Sheet Header
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSheetHeader]',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sheet-header"',
  },
})
export class BuiSheetHeader {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sheet-header',
      'flex shrink-0 gap-y-3 p-6 pb-4',

      // User classes
      this.userClass(),
    ),
  );
}

// -----------------------------------------------------------------------------
// Sheet Title
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSheetTitle]',
  host: {
    '[id]': 'sheet.titleId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sheet-title"',
  },
})
export class BuiSheetTitle {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  protected readonly sheet = inject(BuiSheet);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sheet-title',
      'text-lg font-medium',

      // User classes
      this.userClass(),
    ),
  );

  constructor() {
    // Announce existence to the parent sheet
    this.sheet.hasTitle.set(true);
    this.destroyRef.onDestroy(() => {
      this.sheet.hasTitle.set(false);
    });
  }
}

// -----------------------------------------------------------------------------
// Sheet Description
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSheetDescription]',
  host: {
    '[id]': 'sheet.descriptionId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sheet-description"',
  },
})
export class BuiSheetDescription {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  protected readonly sheet = inject(BuiSheet);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sheet-description',
      'text-neutral-a11',

      // User classes
      this.userClass(),
    ),
  );

  constructor() {
    // Announce existence to the parent sheet
    this.sheet.hasDescription.set(true);
    this.destroyRef.onDestroy(() => {
      this.sheet.hasDescription.set(false);
    });
  }
}

// -----------------------------------------------------------------------------
// Sheet Body
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSheetBody]',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sheet-body"',
  },
})
export class BuiSheetBody {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sheet-body',
      'flex-1 overflow-y-auto p-6 py-2',

      // User classes
      this.userClass(),
    ),
  );
}

// -----------------------------------------------------------------------------
// Sheet Footer
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSheetFooter]',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sheet-footer"',
  },
})
export class BuiSheetFooter {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sheet-footer',
      'mt-auto flex shrink-0 items-center justify-end gap-x-3 p-6 pt-4',

      // User classes
      this.userClass(),
    ),
  );
}
