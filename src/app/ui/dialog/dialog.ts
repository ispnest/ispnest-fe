import {
  AutoFocusTarget,
  CdkDialogContainer,
  Dialog,
  DialogRef,
  DialogRole,
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
// Dialog Service
// -----------------------------------------------------------------------------
@Injectable({ providedIn: 'root' })
export class BuiDialogService {
  // State
  readonly openDialogsCount = signal(0);
}

// -----------------------------------------------------------------------------
// Dialog Root
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiDialog]',
  exportAs: 'buiDialog',
  host: {
    class: 'contents',
  },
})
export class BuiDialog {
  // Dependencies
  private readonly dialog = inject(Dialog);
  private readonly dialogService = inject(BuiDialogService);
  private readonly overlay = inject(Overlay);
  private readonly uniqueId = inject(UniqueId);

  // Inputs / Outputs
  readonly isOpen = model(false, { alias: 'open' });
  readonly autoFocus = input<AutoFocusTarget | string | undefined>('first-tabbable');
  readonly restoreFocus = input<RestoreFocusValue>(true);
  readonly disableClose = input(false, {
    transform: booleanAttribute,
  });
  readonly role = input<DialogRole>('dialog');
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

  readonly id = this.uniqueId.getId('bui-dialog-');
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
      'group/bui-dialog',
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
    const totalCount = this.dialogService.openDialogsCount();

    // Bail if this specific dialog isn't open yet
    if (!this.dialogRef) return 0;

    // Find its exact place in the CDK array
    const index = this.dialog.openDialogs.indexOf(this.dialogRef);

    // Calculate depth (0 = top, 1 = one step back, etc.)
    return index === -1 ? 0 : Math.max(0, totalCount - 1 - index);
  });

  constructor() {
    effect(() => {
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
            role: this.role(),
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

          // Update the open dialogs count in the service
          this.dialogService.openDialogsCount.set(this.dialog.openDialogs.length);

          // Emit opened event
          this.opened.emit();

          // If disableClose is false, listen for backdrop clicks and
          // escape key presses to close the dialog
          if (!this.disableClose()) {
            this.dialogRef.backdropClick.subscribe(() => {
              this.isOpen.set(false);
            });

            this.dialogRef.overlayRef
              .keydownEvents()
              .pipe(filter((event) => event.key === 'Escape'))
              .subscribe(() => {
                this.isOpen.set(false);
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
          this.dialogService.openDialogsCount.update((count) => count - 1);
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
      this.dialogService.openDialogsCount.set(this.dialog.openDialogs.length);
      this.closed.emit();
    }
  }
}

// -----------------------------------------------------------------------------
// Dialog Trigger
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiDialogTrigger]',
  exportAs: 'buiDialogTrigger',
  host: {
    role: 'button',
    tabindex: '0',
    '[id]': 'dialog.triggerId',
    '[class]': 'computedClass()',
    '[aria-controls]': 'dialog.isOpen() ? dialog.id : null',
    '[aria-expanded]': 'dialog.isOpen()',
    '[aria-haspopup]': '"dialog"',
    '[attr.data-slot]': '"bui-dialog-trigger"',
    '(click)': 'open()',
    '(keydown.enter)': 'handleKeydown($event)',
    '(keydown.space)': 'handleKeydown($event)',
  },
})
export class BuiDialogTrigger {
  // Dependencies
  protected readonly dialog = inject(BuiDialog);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-dialog-trigger',

      // User classes
      this.userClass(),
    ),
  );

  protected handleKeydown(event: Event) {
    event.preventDefault();
    this.open();
  }

  open() {
    this.dialog.open();
  }
}

// -----------------------------------------------------------------------------
// Dialog Close
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiDialogClose]',
  exportAs: 'buiDialogClose',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-dialog-content"',
    '(click)': 'close()',
  },
})
export class BuiDialogClose {
  // Dependencies
  private readonly dialog = inject(BuiDialog);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-dialog-close',

      // User classes
      this.userClass(),
    ),
  );

  close() {
    this.dialog.close();
  }
}

// -----------------------------------------------------------------------------
// Dialog Portal
// -----------------------------------------------------------------------------
@Directive({
  selector: 'ng-template[buiDialogPortal]',
  exportAs: 'buiDialogPortal',
})
export class BuiDialogPortal {
  // Dependencies
  private readonly dialog = inject(BuiDialog);
  private readonly templateRef = inject(TemplateRef);

  constructor() {
    this.dialog.portalTemplate.set(this.templateRef);
  }
}

// -----------------------------------------------------------------------------
// Dialog Backdrop
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiDialogBackdrop]',
  exportAs: 'buiDialogBackdrop',
  host: {
    '[id]': 'dialog.backdropId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-dialog-backdrop"',
    '[attr.data-state]': 'dialog.state()',
    '(animationend)': 'onAnimationEnd()',
  },
})
export class BuiDialogBackdrop {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  protected readonly dialog = inject(BuiDialog);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-dialog-backdrop',
      'pointer-events-none fixed inset-0 z-0',
      'bg-black-a5 backdrop-blur-xs',

      // Animations
      'transition-opacity duration-100',
      'data-[state=open]:animate-in data-[state=open]:fade-in',
      'data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards data-[state=closed]:fade-out',

      // User classes
      this.userClass(),
    ),
  );

  constructor() {
    // Announce existence to the parent dialog
    this.dialog.hasBackdrop.set(true);
    this.destroyRef.onDestroy(() => {
      this.dialog.hasBackdrop.set(false);
    });
  }

  onAnimationEnd() {
    if (this.dialog.isClosing()) {
      this.dialog.registerAnimationComplete();
    }
  }
}

// -----------------------------------------------------------------------------
// Dialog Content
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiDialogContent]',
  exportAs: 'buiDialogContent',
  host: {
    '[id]': 'dialog.contentId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-dialog-content"',
    '[attr.data-state]': 'dialog.state()',
    '[style.--nested-dialogs]': 'dialog.depth()',
    '(animationend)': 'onAnimationEnd()',
  },
})
export class BuiDialogContent {
  // Dependencies
  protected readonly dialog = inject(BuiDialog);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-dialog-content',
      'relative z-10',
      'flex max-h-[calc(100dvh-4rem)] w-full max-w-md flex-col gap-y-6 p-6 sm:max-h-[85dvh]',
      'rounded-[calc(var(--theme-border-radius)*2)] border border-transparent',

      // Border color as the background to avoid corner rendering issues and
      // better shadow/background-color blending
      'bg-neutral-a4 dark:bg-neutral-a5',

      // Background implemented as the 'before' pseudo-element
      'before:pointer-events-none before:absolute before:inset-0 before:-z-10',
      'before:rounded-[calc(var(--theme-border-radius)*2-1px)]',
      'before:bg-white dark:before:bg-neutral-3',
      'before:shadow-lg',

      // Nested dialogs
      'transition-[opacity,scale,translate] duration-100',
      'scale-[calc(1-0.1*var(--nested-dialogs))]',
      '[translate:0_calc(0px+1.25rem*var(--nested-dialogs))]',

      // Animations
      'data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in',
      'data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out',

      // User classes
      this.userClass(),
    ),
  );

  onAnimationEnd() {
    if (this.dialog.isClosing()) {
      this.dialog.registerAnimationComplete();
    }
  }
}

// -----------------------------------------------------------------------------
// Dialog Header
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiDialogHeader]',
  exportAs: 'buiDialogHeader',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-dialog-header"',
  },
})
export class BuiDialogHeader {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-dialog-header',
      'flex flex-col gap-y-3',

      // User classes
      this.userClass(),
    ),
  );
}

// -----------------------------------------------------------------------------
// Dialog Title
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiDialogTitle]',
  exportAs: 'buiDialogTitle',
  host: {
    '[id]': 'dialog.titleId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-dialog-title"',
  },
})
export class BuiDialogTitle {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  protected readonly dialog = inject(BuiDialog);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-dialog-title',
      'text-lg font-medium',

      // User classes
      this.userClass(),
    ),
  );

  constructor() {
    // Announce existence to the parent dialog
    this.dialog.hasTitle.set(true);
    this.destroyRef.onDestroy(() => {
      this.dialog.hasTitle.set(false);
    });
  }
}

// -----------------------------------------------------------------------------
// Dialog Description
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiDialogDescription]',
  exportAs: 'buiDialogDescription',
  host: {
    '[id]': 'dialog.descriptionId',
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-dialog-description"',
  },
})
export class BuiDialogDescription {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  protected readonly dialog = inject(BuiDialog);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-dialog-description',
      'text-neutral-a11',

      // User classes
      this.userClass(),
    ),
  );

  constructor() {
    // Announce existence to the parent dialog
    this.dialog.hasDescription.set(true);
    this.destroyRef.onDestroy(() => {
      this.dialog.hasDescription.set(false);
    });
  }
}

// -----------------------------------------------------------------------------
// Dialog Body
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiDialogBody]',
  exportAs: 'buiDialogBody',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-dialog-body"',
  },
})
export class BuiDialogBody {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-dialog-body',
      'flex-1 overflow-y-auto',

      // User classes
      this.userClass(),
    ),
  );
}

// -----------------------------------------------------------------------------
// Dialog Footer
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiDialogFooter]',
  exportAs: 'buiDialogFooter',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-dialog-footer"',
  },
})
export class BuiDialogFooter {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-dialog-title',
      'flex items-center justify-end gap-x-3',

      // User classes
      this.userClass(),
    ),
  );
}
