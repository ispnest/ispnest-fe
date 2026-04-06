import { Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Media } from '@/app/core/media';
import {
  BuiSidebar, BuiSidebarBody, BuiSidebarButton,
  BuiSidebarFooter, BuiSidebarHeader, BuiSidebarIcon, BuiSidebarLabel,
  BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow,
  BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSpacer,
} from '@/app/ui/sidebar';
import { AuthService } from '../../core/auth/auth.service';

type NavItem = { label: string; icon: string; route: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     icon: 'layout-dashboard',  route: '/admin/dashboard' },
  { label: 'Customers',     icon: 'users',              route: '/admin/customers' },
  { label: 'Payments',      icon: 'credit-card',        route: '/admin/payments' },
  { label: 'Invoices',      icon: 'file-text',          route: '/admin/billing/invoices' },
  { label: 'Credits',       icon: 'wallet',             route: '/admin/billing/credits' },
  { label: 'Plans',         icon: 'layers',             route: '/admin/plans' },
  { label: 'Bandwidths',    icon: 'gauge',              route: '/admin/bandwidths' },
  { label: 'Routers',       icon: 'network',            route: '/admin/routers' },
  { label: 'Pools',         icon: 'database',           route: '/admin/pools' },
  { label: 'Hotspot',       icon: 'wifi',               route: '/admin/hotspot' },
  { label: 'Technician',    icon: 'wrench',             route: '/admin/technician' },
  { label: 'Notifications', icon: 'bell',               route: '/admin/notifications' },
  { label: 'Settings',      icon: 'settings',           route: '/admin/settings' },
];

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent,
    MatDivider, MatMenu, MatMenuItem, MatMenuTrigger,
    BuiSidebar, BuiSidebarHeader, BuiSidebarBody, BuiSidebarFooter,
    BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSpacer,
    BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow,
    BuiSidebarButton, BuiSidebarIcon, BuiSidebarLabel,
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" #sidenav>
        <aside buiSidebar>
          <!-- Header: Logo -->
          <div buiSidebarHeader class="pb-3">
            <div class="flex items-center">
              <img class="-ml-0.5 size-7 object-contain" src="/img/ispnest-icon-white.svg" alt="ISPNest" />
              <div class="ml-3">
                <div class="text-base font-bold leading-tight">ISPNest</div>
                <div class="text-xs text-neutral-a9">Admin Panel</div>
              </div>
            </div>
          </div>

          <!-- Body: Navigation -->
          <div buiSidebarBody>
            <div buiSidebarSection>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  @for (item of navItems; track item.route) {
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton
                           [routerLink]="item.route"
                           routerLinkActive="active"
                           [routerLinkActiveOptions]="{ exact: item.route === '/admin/dashboard' }">
                          <mat-icon buiSidebarIcon [svgIcon]="item.icon" />
                          <span buiSidebarLabel>{{ item.label }}</span>
                        </a>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>
            <div buiSidebarSpacer></div>
          </div>

          <!-- Footer: User menu -->
          <div buiSidebarFooter class="p-3">
            <button class="flex w-full cursor-pointer items-center gap-x-3 rounded-xl p-2 text-left hover:bg-neutral-a3"
                    [matMenuTriggerFor]="userMenu">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-a9 text-white text-sm font-bold select-none">
                {{ userInitial() }}
              </div>
              <div class="flex min-w-0 flex-auto flex-col select-none">
                <div class="truncate font-medium">{{ auth.currentUser()?.username }}</div>
                <div class="truncate text-xs text-neutral-a11">Administrator</div>
              </div>
              <mat-icon class="size-4 shrink-0" svgIcon="ellipsis-vertical" />
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
      <mat-sidenav-content class="flex flex-col">
        <div class="flex shrink-0 items-center gap-x-4 border-b px-4 py-3">
          <button matIconButton (click)="sidenav.toggle()">
            <mat-icon svgIcon="panel-left" />
          </button>
          <span class="flex-1"></span>
          <button matIconButton [matMenuTriggerFor]="topMenu">
            <mat-icon svgIcon="user-round" />
          </button>
          <mat-menu #topMenu="matMenu">
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon svgIcon="log-out" />Logout
            </button>
          </mat-menu>
        </div>
        <main class="flex-1 overflow-auto p-6">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AdminShellComponent {
  readonly auth = inject(AuthService);
  private readonly media = inject(Media);

  protected readonly isMobile = this.media.match('(max-width: 767px)');
  readonly navItems = NAV_ITEMS;
  readonly userInitial = computed(() =>
    (this.auth.currentUser()?.username?.[0] ?? 'A').toUpperCase(),
  );
}


