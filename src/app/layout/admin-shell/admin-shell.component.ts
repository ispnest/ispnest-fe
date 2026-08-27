import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, computed, effect, inject, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { Media } from '@/app/core/media';
import {
  BuiSidebar,
  BuiSidebarBody,
  BuiSidebarButton,
  BuiSidebarFooter,
  BuiSidebarHeader,
  BuiSidebarIcon,
  BuiSidebarLabel,
  BuiSidebarMenu,
  BuiSidebarMenuItem,
  BuiSidebarMenuRow,
  BuiSidebarSection,
  BuiSidebarSectionContent,
  BuiSidebarSectionHeader,
  BuiSidebarSpacer,
} from '@/app/ui/sidebar';

type NavItem = {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  /** Permission required to see this item (any one suffices). */
  requiredPermission?: string;
  /** Role(s) required to see this item (any one suffices). Admin/SuperAdmin always pass. */
  requiredRoles?: string[];
  /** If true, item is always shown to any authenticated staff. */
  staffOnly?: boolean;
};

type NavGroup = { label: string; items: NavItem[] };

// Admin roles that always have full access
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        icon: 'layout-dashboard',
        route: '/admin/dashboard',
        exact: true,
        requiredRoles: [...ADMIN_ROLES, 'SUPPORT'],
      },
    ],
  },
  {
    label: 'Customers & Finance',
    items: [
      {
        label: 'Customers',
        icon: 'users',
        route: '/admin/customers',
        requiredPermission: 'CUSTOMERS_READ',
      },
      {
        label: 'Payments',
        icon: 'credit-card',
        route: '/admin/payments',
        requiredPermission: 'PAYMENTS_READ',
      },
      {
        label: 'Invoices',
        icon: 'file-text',
        route: '/admin/billing/invoices',
        requiredPermission: 'BILLING_READ',
      },
      {
        label: 'Credits',
        icon: 'wallet',
        route: '/admin/billing/credits',
        requiredPermission: 'BILLING_READ',
      },
      {
        label: 'Cycles',
        icon: 'refresh-cw',
        route: '/admin/billing/cycles',
        requiredPermission: 'BILLING_READ',
      },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { label: 'Plans', icon: 'layers', route: '/admin/plans', requiredPermission: 'PLANS_READ' },
      {
        label: 'Bandwidths',
        icon: 'gauge',
        route: '/admin/bandwidths',
        requiredPermission: 'BANDWIDTHS_READ',
      },
      {
        label: 'Routers',
        icon: 'network',
        route: '/admin/routers',
        requiredPermission: 'ROUTERS_READ',
      },
      { label: 'Pools', icon: 'database', route: '/admin/pools', requiredPermission: 'POOLS_READ' },
      {
        label: 'WireGuard Pool',
        icon: 'key-round',
        route: '/admin/wireguard-pool',
        requiredPermission: 'ROUTERS_READ',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Hotspot', icon: 'wifi', route: '/admin/hotspot', requiredRoles: ADMIN_ROLES },
      { label: 'Technician', icon: 'wrench', route: '/admin/technician', staffOnly: true },
      { label: 'Staff', icon: 'user-cog', route: '/admin/staff', requiredRoles: ADMIN_ROLES },
      {
        label: 'Notifications',
        icon: 'bell',
        route: '/admin/notifications',
        requiredPermission: 'NOTIFICATIONS_READ',
      },
    ],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    label: 'Settings',
    icon: 'settings',
    route: '/admin/settings',
    requiredPermission: 'SETTINGS_READ',
  },
];

/** Items pinned to mobile bottom nav per role (max 4). Derived from filtered nav items. */
const MOBILE_NAV_KEYS_ADMIN = [
  '/admin/dashboard',
  '/admin/customers',
  '/admin/payments',
  '/admin/settings',
];
const MOBILE_NAV_KEYS_TECHNICIAN = [
  '/admin/technician',
  '/admin/customers',
  '/admin/routers',
  '/admin/notifications',
];
const MOBILE_NAV_KEYS_SUPPORT = [
  '/admin/dashboard',
  '/admin/customers',
  '/admin/payments',
  '/admin/notifications',
];
const MOBILE_NAV_KEYS_DEFAULT = [
  '/admin/dashboard',
  '/admin/customers',
  '/admin/routers',
  '/admin/notifications',
];

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CdkScrollable,
    MatIcon,
    MatIconButton,
    MatSidenavModule,
    MatDivider,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    BuiSidebar,
    BuiSidebarHeader,
    BuiSidebarBody,
    BuiSidebarFooter,
    BuiSidebarSection,
    BuiSidebarSectionHeader,
    BuiSidebarSectionContent,
    BuiSidebarSpacer,
    BuiSidebarMenu,
    BuiSidebarMenuItem,
    BuiSidebarMenuRow,
    BuiSidebarButton,
    BuiSidebarIcon,
    BuiSidebarLabel,
  ],
  template: `
    <mat-sidenav-container>
      <!-- Sidebar -->
      <mat-sidenav
        class="border-none"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        [disableClose]="!isMobile()"
        fixedInViewport
        #sidenav
      >
        <aside buiSidebar class="w-auto flex-auto">
          <!-- Header: Logo -->
          <div buiSidebarHeader class="pb-4">
            <div class="flex items-center gap-x-2.5">
              <img class="size-7 object-contain" src="/img/ispnest-icon.svg" alt="ISPNest" />
              <div class="text-3xl font-semibold tracking-tighter">ISPNest</div>
            </div>
          </div>

          <!-- Body: Navigation groups -->
          <div buiSidebarBody>
            @for (group of navGroups(); track group.label) {
              @if (group.items.length > 0) {
                <div buiSidebarSection>
                  <div buiSidebarSectionHeader>
                    <span buiSidebarLabel>{{ group.label }}</span>
                  </div>
                  <div buiSidebarSectionContent>
                    <ul buiSidebarMenu>
                      @for (item of group.items; track item.route) {
                        <li buiSidebarMenuItem>
                          <div buiSidebarMenuRow>
                            <a
                              buiSidebarButton
                              [routerLink]="item.route"
                              routerLinkActive="active"
                              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                            >
                              <mat-icon buiSidebarIcon [svgIcon]="item.icon" />
                              <span buiSidebarLabel>{{ item.label }}</span>
                            </a>
                          </div>
                        </li>
                      }
                    </ul>
                  </div>
                </div>
              }
            }

            <div buiSidebarSpacer></div>

            <!-- Bottom section: Settings (if visible) -->
            @if (bottomItems().length > 0) {
              <div buiSidebarSection>
                <div buiSidebarSectionContent>
                  <ul buiSidebarMenu>
                    @for (item of bottomItems(); track item.route) {
                      <li buiSidebarMenuItem>
                        <div buiSidebarMenuRow>
                          <a buiSidebarButton [routerLink]="item.route" routerLinkActive="active">
                            <mat-icon buiSidebarIcon [svgIcon]="item.icon" />
                            <span buiSidebarLabel>{{ item.label }}</span>
                          </a>
                        </div>
                      </li>
                    }
                  </ul>
                </div>
              </div>
            }
          </div>

          <!-- Footer: User menu -->
          <div buiSidebarFooter class="hidden p-4 lg:block">
            <button
              class="flex w-full cursor-pointer items-center gap-x-3 rounded-xl p-2 text-left hover:bg-neutral-a3 select-none"
              [matMenuTriggerFor]="userMenu"
            >
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-contrast text-sm font-bold"
              >
                {{ userInitial() }}
              </div>
              <div class="flex min-w-0 flex-auto flex-col">
                <div class="truncate text-base font-medium">{{ displayName() }}</div>
                <div class="truncate text-sm text-neutral-a11">{{ userRole() }}</div>
              </div>
              <mat-icon class="size-4 shrink-0 text-neutral-a11" svgIcon="ellipsis-vertical" />
            </button>
            <mat-menu xPosition="before" yPosition="above" #userMenu>
              <button mat-menu-item disabled>
                <mat-icon svgIcon="user-round" />
                {{ userEmail() }}
              </button>
              <mat-divider />
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon svgIcon="log-out" />
                Log out
              </button>
            </mat-menu>
          </div>
        </aside>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="bg-transparent lg:p-2">
        <!-- Inner card — rounded corners via ring; page content scrolls naturally -->
        <div
          class="flex h-full flex-col bg-white shadow-xs lg:rounded-lg lg:ring-1 lg:ring-neutral-a3 dark:bg-neutral-2"
        >
          <!-- Mobile header (only shown on small screens) -->
          <div
            class="flex shrink-0 items-center gap-2 border-b border-neutral-a4 py-3 pr-4 pl-3 lg:hidden"
          >
            <button matIconButton class="shrink-0" (click)="sidenav.toggle()">
              <mat-icon svgIcon="panel-left" />
            </button>
            <div class="flex min-w-0 flex-auto items-center gap-2">
              <img class="size-5 shrink-0 object-contain" src="/img/ispnest-icon.svg" alt="" />
              <span class="truncate text-base font-semibold tracking-tight">ISPNest</span>
            </div>
            <button
              type="button"
              class="flex shrink-0 items-center gap-1 rounded-lg p-1 pr-1.5 active:bg-neutral-a3"
              [matMenuTriggerFor]="mobileMenu"
              aria-label="Account menu"
            >
              <div
                class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-contrast text-xs font-bold"
              >
                {{ userInitial() }}
              </div>
              <mat-icon class="size-4 text-neutral-a11" svgIcon="chevron-down" />
            </button>
            <mat-menu #mobileMenu="matMenu">
              <button mat-menu-item disabled>
                <mat-icon svgIcon="user-round" />
                {{ userEmail() }}
              </button>
              <mat-divider />
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon svgIcon="log-out" />
                Log out
              </button>
            </mat-menu>
          </div>

          <!-- Scrollable page content — extra bottom padding on mobile for the bottom nav bar -->
          <div class="flex flex-auto flex-col overflow-y-auto pb-16 lg:pb-0" cdkScrollable>
            <router-outlet />
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <!-- ── Mobile bottom nav bar ───────────────────────────────────────── -->
    <nav
      class="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch border-t border-neutral-a4 bg-white dark:bg-neutral-2 lg:hidden"
    >
      @for (item of mobileNavItems(); track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="text-primary"
          [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
          class="flex flex-1 flex-col items-center justify-center gap-0.5 text-neutral-a9 transition-colors"
        >
          <mat-icon [svgIcon]="item.icon" class="size-5 shrink-0" />
          <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
})
export class AdminShellComponent {
  readonly auth = inject(AuthService);
  private readonly media = inject(Media);
  private readonly router = inject(Router);

  readonly sidenav = viewChild.required<MatSidenav>('sidenav');
  protected readonly isMobile = this.media.match('(width < 64rem)');

  /** Check if an item should be visible to the current user */
  private isItemVisible(item: NavItem): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;

    // staffOnly: any authenticated staff member can see it
    if (item.staffOnly) return true;

    // If item requires specific roles
    if (item.requiredRoles) {
      if (item.requiredRoles.some((r) => this.auth.hasRole(r))) return true;
    }

    // If item requires a specific permission
    if (item.requiredPermission) {
      return this.auth.hasPermission(item.requiredPermission);
    }

    // No restriction — visible to everyone
    return true;
  }

  /** Filtered navigation groups based on current user's role/permissions */
  readonly navGroups = computed<NavGroup[]>(() => {
    // Trigger on permission/role changes
    this.auth.permissions();
    this.auth.roles();

    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => this.isItemVisible(item)),
    })).filter((group) => group.items.length > 0);
  });

  /** Filtered bottom items */
  readonly bottomItems = computed<NavItem[]>(() => {
    this.auth.permissions();
    this.auth.roles();
    return BOTTOM_ITEMS.filter((item) => this.isItemVisible(item));
  });

  /** 4 items pinned to the mobile bottom nav, chosen by role */
  readonly mobileNavItems = computed<NavItem[]>(() => {
    this.auth.permissions();
    this.auth.roles();

    let keys: string[];
    if (this.auth.hasRole('TECHNICIAN')) {
      keys = MOBILE_NAV_KEYS_TECHNICIAN;
    } else if (this.auth.hasRole('SUPPORT')) {
      keys = MOBILE_NAV_KEYS_SUPPORT;
    } else if (this.auth.hasRole('ADMIN') || this.auth.hasRole('SUPER_ADMIN')) {
      keys = MOBILE_NAV_KEYS_ADMIN;
    } else {
      keys = MOBILE_NAV_KEYS_DEFAULT;
    }

    // Flatten all items (nav groups + bottom items) then pick by route key
    const allItems = [...NAV_GROUPS.flatMap((g) => g.items), ...BOTTOM_ITEMS];

    return keys
      .map((route) => allItems.find((item) => item.route === route))
      .filter((item): item is NavItem => item !== undefined && this.isItemVisible(item));
  });

  /** User's display name or email */
  readonly displayName = computed(() => {
    const user = this.auth.currentUser();
    return user?.displayName || user?.email || 'User';
  });

  /** User's email for menu display */
  readonly userEmail = computed(() => this.auth.currentUser()?.email || '');

  /** User's initial for avatar */
  readonly userInitial = computed(() => {
    const user = this.auth.currentUser();
    const name = user?.displayName || user?.email || 'U';
    return name[0].toUpperCase();
  });

  /** User's role for display */
  readonly userRole = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '';
    if (user.roles.length > 0) {
      return user.roles[0]
        .replace('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return user.userType;
  });

  private routerEvent = toSignal(this.router.events);

  constructor() {
    // Close sidenav on navigation (mobile only)
    effect(() => {
      const event = this.routerEvent();
      const isMobile = untracked(() => this.isMobile());
      if (!(event instanceof NavigationEnd) || !isMobile) return;
      untracked(() => this.sidenav().toggle(false));
    });
  }
}
