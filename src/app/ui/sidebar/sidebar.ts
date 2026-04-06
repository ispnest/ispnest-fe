import { Directive, computed, input } from '@angular/core';
import { ClassValue } from 'clsx';
import { bui } from '../utils/bui';

// -----------------------------------------------------------------------------
// Sidebar Root
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebar]',
  exportAs: 'buiSidebar',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar"',
  },
})
export class BuiSidebar {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar',
      'flex flex-col',
      'w-full',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Header
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarHeader]',
  exportAs: 'buiSidebarHeader',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-header"',
  },
})
export class BuiSidebarHeader {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-header',
      'p-6',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Body
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarBody]',
  exportAs: 'buiSidebarBody',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-body"',
  },
})
export class BuiSidebarBody {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-body',
      'flex flex-auto flex-col overflow-auto',
      'min-h-0 gap-y-4 p-2',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Footer
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarFooter]',
  exportAs: 'buiSidebarFooter',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-footer"',
  },
})
export class BuiSidebarFooter {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-footer',
      'p-6',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Section
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarSection]',
  exportAs: 'buiSidebarSection',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-section"',
  },
})
export class BuiSidebarSection {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-section',
      'flex flex-col',
      'px-2',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Section Header
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarSectionHeader]',
  exportAs: 'buiSidebarSectionHeader',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-section-header"',
  },
})
export class BuiSidebarSectionHeader {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-section-header',
      'relative isolate flex w-full items-center',
      'rounded-md select-none',
      'h-8 gap-x-1 px-1.5',

      // Label
      '**:[[buiSidebarLabel]]:text-sm **:[[buiSidebarLabel]]:font-medium **:[[buiSidebarLabel]]:text-neutral-a11',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Section Content
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarSectionContent]',
  exportAs: 'buiSidebarSectionContent',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-section-content"',
  },
})
export class BuiSidebarSectionContent {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-section-content',
      'flex flex-col',
      'mt-1 gap-y-1',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Menu
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarMenu]',
  exportAs: 'buiSidebarMenu',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-menu"',
  },
})
export class BuiSidebarMenu {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-menu',
      'flex flex-col',
      'gap-y-1',

      // Nested menus
      '[&_[buiSidebarMenu]>[buiSidebarMenuItem]_[buiSidebarMenuRow]:not(:has([buiSidebarButton]:first-child))]:ps-7.5',
      '[&_[buiSidebarMenu]_[buiSidebarMenu]>[buiSidebarMenuItem]_[buiSidebarMenuRow]:not(:has([buiSidebarButton]:first-child))]:ps-13.5',
      '[&_[buiSidebarMenu]_[buiSidebarMenu]_[buiSidebarMenu]>[buiSidebarMenuItem]_[buiSidebarMenuRow]:not(:has([buiSidebarButton]:first-child))]:ps-19.5',

      '[&_[buiSidebarMenu]>[buiSidebarMenuItem]_[buiSidebarMenuRow]:has([buiSidebarButton]:first-child)_[buiSidebarButton]]:ps-7.5',
      '[&_[buiSidebarMenu]_[buiSidebarMenu]>[buiSidebarMenuItem]_[buiSidebarMenuRow]:has([buiSidebarButton]:first-child)_[buiSidebarButton]]:ps-13.5',
      '[&_[buiSidebarMenu]_[buiSidebarMenu]_[buiSidebarMenu]>[buiSidebarMenuItem]_[buiSidebarMenuRow]:has([buiSidebarButton]:first-child)_[buiSidebarButton]]:ps-19.5',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Menu Item
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarMenuItem]',
  exportAs: 'buiSidebarMenuItem',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-menu-item"',
  },
})
export class BuiSidebarMenuItem {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-menu-item',
      'flex flex-col gap-y-1',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Menu Row
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarMenuRow]',
  exportAs: 'buiSidebarMenuRow',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-menu-row"',
  },
})
export class BuiSidebarMenuRow {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-menu-row',
      'relative isolate flex w-full items-center',
      'rounded-md select-none',
      'h-8 gap-x-1 px-1.5',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Button
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarButton]',
  exportAs: 'buiSidebarButton',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-button"',
  },
})
export class BuiSidebarButton {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-menu-button',
      'flex min-w-0 flex-1 cursor-pointer items-center rounded-md select-none',
      'h-8 gap-x-1',

      // Alignment for button being first or last child
      'first:-ms-1.5 first:ps-1.5',
      'last:-me-1.5 last:pe-1.5',

      // ::before pseudo-element for active and hover states
      'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:hidden',
      'before:rounded-md before:bg-neutral-a3',

      // Highlight button when section header or menu row is hovered
      'group-hover/bui-sidebar-menu-row:before:flex',
      'group-hover/bui-sidebar-section-header:before:flex',

      // Highlight button when active
      '[&.active]:before:flex',

      // Focus ring adjustments
      '-outline-offset-2',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Action
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarAction]',
  exportAs: 'buiSidebarAction',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-action"',
  },
})
export class BuiSidebarAction {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-action',
      'flex cursor-pointer items-center justify-center rounded',
      'size-5 shrink-0 gap-x-2',

      // Active and hover states
      'hover:bg-neutral-a3',

      // Sidebar icon
      '**:[[buiSidebarIcon]]:text-neutral-a9',
      'hover:**:[[buiSidebarIcon]]:text-neutral-12',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Icon
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarIcon]',
  exportAs: 'buiSidebarIcon',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-icon"',
  },
})
export class BuiSidebarIcon {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-icon',
      'pointer-events-none flex items-center justify-center',
      'size-5 shrink-0 p-0.5',
      'text-neutral-a11',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Label
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarLabel]',
  exportAs: 'buiSidebarLabel',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-label"',
  },
})
export class BuiSidebarLabel {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-label',
      'flex-auto',
      'px-0.5',
      'truncate text-left',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Badge
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarBadge]',
  exportAs: 'buiSidebarBadge',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-badge"',
  },
})
export class BuiSidebarBadge {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-badge',
      'pointer-events-none flex items-center justify-center rounded',
      'px-1 py-0.5',
      'text-xs font-medium tabular-nums',
      'bg-neutral-a3',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Divider
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarDivider]',
  exportAs: 'buiSidebarDivider',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-divider"',
  },
})
export class BuiSidebarDivider {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-divider',
      'flex-auto',
      'h-px grow-0',
      'bg-neutral-a4',

      // User classes
      this.userClass()
    )
  );
}

// -----------------------------------------------------------------------------
// Sidebar Spacer
// -----------------------------------------------------------------------------
@Directive({
  selector: '[buiSidebarSpacer]',
  exportAs: 'buiSidebarSpacer',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-slot]': '"bui-sidebar-spacer"',
  },
})
export class BuiSidebarSpacer {
  // Inputs / Outputs
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  // Computed state
  protected readonly computedClass = computed(() =>
    bui(
      // Base
      'group/bui-sidebar-spacer',
      'flex-auto',

      // User classes
      this.userClass()
    )
  );
}
