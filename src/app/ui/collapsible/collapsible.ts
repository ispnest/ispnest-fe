import {
  afterRenderEffect,
  computed,
  DestroyRef,
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
  input,
  model,
  signal,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { ClassValue } from 'clsx';
import { bui, UniqueId } from '../utils';

// -----------------------------------------------------------------------------
// Collapsible Root
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiCollapsible]',
  exportAs: 'buiCollapsible',
  host: {
    '[id]': 'id',
    '[class]': 'computedClass()',
    '[attr.data-state]': 'state()',
  },
})
export class BuiCollapsible {
  // Dependencies
  private readonly uniqueId = inject(UniqueId);

  // Inputs / Outputs
  readonly expanded = model(false);
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // State
  readonly isInitialRender = signal(true);

  readonly id = this.uniqueId.getId('bui-collapsible-');
  readonly triggerId = `${this.id}-trigger`;
  readonly contentId = `${this.id}-content`;

  // Computed state
  readonly state = computed(() => (this.expanded() ? 'open' : 'closed'));
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-collapsible',

      // User classes
      this.userClass()
    )
  );

  constructor() {
    // Reset initial render after the first render to ensure transitions
    // don't run on the initial render.
    afterRenderEffect(() => {
      if (this.isInitialRender()) {
        this.isInitialRender.set(false);
      }
    });
  }

  toggle() {
    this.expanded.update((v) => !v);
  }
}

// -----------------------------------------------------------------------------
// Collapsible Trigger
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiCollapsibleTrigger]',
  exportAs: 'buiCollapsibleTrigger',
  host: {
    '[id]': 'collapsible.triggerId',
    '[class]': 'computedClass()',
    '[aria-controls]': 'collapsible.contentId',
    '[aria-expanded]': 'collapsible.expanded()',
    '[attr.data-slot]': '"bui-collapsible-trigger"',
    '[attr.data-state]': 'collapsible.state()',
    '(click)': 'toggle()',
    '(keydown.enter)': 'handleKeydown($event)',
    '(keydown.space)': 'handleKeydown($event)',
  },
})
export class BuiCollapsibleTrigger {
  // Dependencies
  protected readonly collapsible = inject(BuiCollapsible);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-collapsible-trigger',
      'cursor-pointer select-none',

      // User classes
      this.userClass()
    )
  );

  protected handleKeydown(event: Event) {
    event.preventDefault();
    this.toggle();
  }

  toggle() {
    this.collapsible.toggle();
  }
}

// -----------------------------------------------------------------------------
// Collapsible Panel
// -----------------------------------------------------------------------------
@Directive({
  selector: 'ng-template[buiCollapsiblePanel]',
  exportAs: 'buiCollapsiblePanel',
})
export class BuiCollapsiblePanel {
  // Dependencies
  protected readonly collapsible = inject(BuiCollapsible);
  private readonly destroyRef = inject(DestroyRef);
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // State
  private currentViewRef: EmbeddedViewRef<unknown> | null = null;
  private isRendered = false;

  constructor() {
    // Watch for changes in the expanded state to render or destroy content
    effect(() => {
      const expanded = this.collapsible.expanded();
      untracked(() => {
        // Render content when expanded, destroy when collapsed
        if (expanded) {
          if (!this.isRendered) {
            this.destroyContent();
            this.currentViewRef = this.viewContainerRef.createEmbeddedView(
              this.templateRef
            );
            this.isRendered = true;
          }
        } else {
          this.destroyContent();
          this.isRendered = false;
        }
      });
    });

    // Ensure content is destroyed when the directive is destroyed
    this.destroyRef.onDestroy(() => {
      this.destroyContent();
    });
  }

  destroyContent() {
    const ref = this.currentViewRef;

    if (ref && !ref.destroyed) {
      ref.destroy();
      this.currentViewRef = null;
    }
  }
}

// -----------------------------------------------------------------------------
// Collapsible Content
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiCollapsibleContent]',
  exportAs: 'buiCollapsibleContent',
  host: {
    role: 'region',
    '[id]': 'collapsible.contentId',
    '[class]': 'computedClass()',
    '[aria-labelledby]': 'collapsible.triggerId',
    '[attr.data-slot]': '"bui-collapsible-content"',
    '[attr.data-state]': 'collapsible.state()',
    '[animate.enter]': 'collapsible.isInitialRender() ? "" : enterAnimation()',
    '[animate.leave]': 'leaveAnimation()',
  },
})
export class BuiCollapsibleContent {
  // Dependencies
  protected readonly collapsible = inject(BuiCollapsible);

  // Inputs / Outputs
  readonly enterAnimation = input('animate-collapsible-down');
  readonly leaveAnimation = input('animate-collapsible-up');
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-collapsible-content',
      'overflow-hidden',

      // Transition
      'transition-all duration-250 ease-out',

      // User classes
      this.userClass()
    )
  );
}
