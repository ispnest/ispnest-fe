import { Component, computed, effect, inject, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Media } from '@/app/core/media';
import {
  BuiSidebar, BuiSidebarBody, BuiSidebarButton,
  BuiSidebarFooter, BuiSidebarHeader, BuiSidebarIcon, BuiSidebarLabel,
  BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow,
  BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSectionHeader,
  BuiSidebarSpacer,
} from '@/app/ui/sidebar';
import { AuthService } from '../../core/auth/auth.service';

type NavItem  = { label: string; icon: string; route: string; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin/dashboard', exact: true },
    ],
  },
  {
    label: 'Customers & Finance',
    items: [
      { label: 'Customers',  icon: 'users',       route: '/admin/customers' },
      { label: 'Payments',   icon: 'credit-card', route: '/admin/payments' },
      { label: 'Invoices',   icon: 'file-text',   route: '/admin/billing/invoices' },
      { label: 'Credits',    icon: 'wallet',      route: '/admin/billing/credits' },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { label: 'Plans',      icon: 'layers',   route: '/admin/plans' },
      { label: 'Bandwidths', icon: 'gauge',    route: '/admin/bandwidths' },
      { label: 'Routers',    icon: 'network',  route: '/admin/routers' },
      { label: 'Pools',      icon: 'database', route: '/admin/pools' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Hotspot',       icon: 'wifi',   route: '/admin/hotspot' },
      { label: 'Technician',    icon: 'wrench', route: '/admin/technician' },
      { label: 'Notifications', icon: 'bell',   route: '/admin/notifications' },
    ],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Settings', icon: 'settings', route: '/admin/settings' },
];

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIcon, MatIconButton, MatSidenavModule,
    MatDivider, MatMenu, MatMenuItem, MatMenuTrigger,
    BuiSidebar, BuiSidebarHeader, BuiSidebarBody, BuiSidebarFooter,
    BuiSidebarSection, BuiSidebarSectionHeader, BuiSidebarSectionContent,
    BuiSidebarSpacer,
    BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow,
    BuiSidebarButton, BuiSidebarIcon, BuiSidebarLabel,
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
            @for (group of navGroups; track group.label) {
              <div buiSidebarSection>
                <div buiSidebarSectionHeader>
                  <span buiSidebarLabel>{{ group.label }}</span>
                </div>
                <div buiSidebarSectionContent>
                  <ul buiSidebarMenu>
                    @for (item of group.items; track item.route) {
                      <li buiSidebarMenuItem>
                        <div buiSidebarMenuRow>
                          <a buiSidebarButton
                             [routerLink]="item.route"
                             routerLinkActive="active"
                             [routerLinkActiveOptions]="{ exact: item.exact ?? false }">
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

            <div buiSidebarSpacer></div>

            <!-- Bottom section: Settings -->
            <div buiSidebarSection>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  @for (item of bottomItems; track item.route) {
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton
                           [routerLink]="item.route"
                           routerLinkActive="active">
                          <mat-icon buiSidebarIcon [svgIcon]="item.icon" />
                          <span buiSidebarLabel>{{ item.label }}</span>
                        </a>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer: User menu -->
          <div buiSidebarFooter class="hidden p-4 lg:block">
            <button
              class="flex w-full cursor-pointer items-center gap-x-3 rounded-xl p-2 text-left hover:bg-neutral-a3 select-none"
              [matMenuTriggerFor]="userMenu"
            >
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-contrast text-sm font-bold">
                {{ userInitial() }}
              </div>
              <div class="flex min-w-0 flex-auto flex-col">
                <div class="truncate text-base font-medium">{{ auth.currentUser()?.username }}</div>
                <div class="truncate text-sm text-neutral-a11">Administrator</div>
              </div>
              <mat-icon class="size-4 shrink-0 text-neutral-a11" svgIcon="ellipsis-vertical" />
            </button>
            <mat-menu xPosition="before" yPosition="above" #userMenu>
              <button mat-menu-item disabled>
                <mat-icon svgIcon="user-round" />
                {{ auth.currentUser()?.username }}
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
        <!-- Inner card — overflow-hidden clips rounded corners; inner div scrolls -->
        <div class="flex h-full flex-col overflow-hidden bg-white shadow-xs lg:rounded-lg lg:ring-1 lg:ring-neutral-a3 dark:bg-neutral-2">

          <!-- Mobile header (only shown on small screens) -->
          <div class="flex shrink-0 items-center py-3 pr-5 pl-4 lg:hidden">
            <button matIconButton (click)="sidenav.toggle()">
              <mat-icon svgIcon="panel-left" />
            </button>
            <div class="flex-auto"></div>
            <button matIconButton [matMenuTriggerFor]="mobileMenu">
              <div class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-contrast text-xs font-bold">
                {{ userInitial() }}
              </div>
            </button>
            <mat-menu #mobileMenu="matMenu">
              <button mat-menu-item disabled>
                <mat-icon svgIcon="user-round" />
                {{ auth.currentUser()?.username }}
              </button>
              <mat-divider />
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon svgIcon="log-out" />
                Log out
              </button>
            </mat-menu>
          </div>

          <!-- Scrollable page content -->
          <div class="flex flex-auto flex-col overflow-y-auto">
            <router-outlet />
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AdminShellComponent {
  readonly auth = inject(AuthService);
  private readonly media = inject(Media);
  private readonly router = inject(Router);

  readonly sidenav = viewChild.required<MatSidenav>('sidenav');
  protected readonly isMobile = this.media.match('(width < 64rem)');
  readonly navGroups = NAV_GROUPS;
  readonly bottomItems = BOTTOM_ITEMS;
  readonly userInitial = computed(() =>
    (this.auth.currentUser()?.username?.[0] ?? 'A').toUpperCase(),
  );

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
