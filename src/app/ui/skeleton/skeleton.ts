import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
  input,
  numberAttribute,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { ClassValue } from 'clsx';
import { bui } from '../utils/bui';

// -----------------------------------------------------------------------------
// Skeleton repeater
// -----------------------------------------------------------------------------
@Directive({
  selector: 'ng-template[buiSkeletonRepeat]',
  exportAs: 'buiSkeletonRepeat',
})
export class BuiSkeletonRepeat {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

  // State
  private currentViewRef: EmbeddedViewRef<unknown> | null = null;

  // Inputs / Outputs
  readonly count = input(1, {
    alias: 'buiSkeletonRepeat',
    transform: numberAttribute,
  });

  constructor() {
    // Watch for changes in the count to render the appropriate number of skeleton items
    effect(() => {
      const count = this.count();

      this.viewContainerRef.clear();
      for (let i = 0; i < count; i++)
        this.currentViewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, {
          $implicit: i,
          index: i,
          count,
          first: i === 0,
          last: i === count - 1,
          odd: (i + 1) % 2 === 1,
          even: (i + 1) % 2 === 0,
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
// Skeleton
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSkeleton]',
  exportAs: 'buiSkeleton',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-skeleton"',
  },
})
export class BuiSkeleton {
  // Inputs / Outputs
  readonly enabled = input(true, { transform: booleanAttribute });
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-skeleton',

      // Skeleton state
      this.enabled() && [
        'relative isolate overflow-hidden',
        'h-4 w-full rounded-xl',
        'before:pointer-events-none before:absolute before:inset-0 before:z-10',
        'before:animate-shimmer before:text-neutral-a11 before:duration-1800 before:ease-[cubic-bezier(0.33,0,0.67,1)] before:repeat-infinite',
      ],

      // User classes
      this.userClass(),
    ),
  );
}
