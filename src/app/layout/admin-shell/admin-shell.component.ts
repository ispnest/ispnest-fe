import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule,
    MatButtonModule, MatListModule, MatMenuModule
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <!-- Sidebar -->
      <mat-sidenav
        #sidenav
        [opened]="sidebarOpen()"
        mode="side"
        class="w-64"
        style="background: #1a1a2e; color: white;">
        <!-- Logo -->
        <div class="flex items-center gap-3 p-4 border-b border-white/10">
          <img src="/img/ispnest-icon-white.svg" alt="ISPNest" class="w-8 h-8 object-contain"
               onerror="this.style.display='none'">
          <div>
            <img src="/img/ispnest-logo.svg" alt="ISPNest" class="h-5 object-contain brightness-0 invert"
                 onerror="this.outerHTML='<div class=&quot;font-bold text-white text-sm&quot;>ISPNest</div>'">
            <div class="text-xs text-gray-400 mt-0.5">Admin Panel</div>
          </div>
        </div>

        <!-- Nav Items -->
        <mat-nav-list class="mt-2">
          @for (item of navItems; track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="bg-blue-600/20 text-blue-400"
               class="rounded-lg mx-2 mb-1 text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <!-- User info at bottom -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {{ userInitial() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-white truncate">{{ auth.currentUser()?.username }}</div>
              <div class="text-xs text-gray-400">Administrator</div>
            </div>
            <button mat-icon-button (click)="auth.logout()" title="Logout" class="text-gray-400 hover:text-white">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="flex flex-col bg-gray-50">
        <!-- Topbar -->
        <mat-toolbar class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <button mat-icon-button (click)="sidebarOpen.update(v => !v)">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="flex-1"></span>
          <button mat-icon-button>
            <mat-icon>notifications_none</mat-icon>
          </button>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Page content -->
        <main class="flex-1 overflow-auto p-6">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class AdminShellComponent {
  readonly auth = inject(AuthService);
  readonly sidebarOpen = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Customers', icon: 'people', route: '/admin/customers' },
    { label: 'Payments', icon: 'payments', route: '/admin/payments' },
    { label: 'Invoices', icon: 'receipt', route: '/admin/billing/invoices' },
    { label: 'Credits', icon: 'account_balance_wallet', route: '/admin/billing/credits' },
    { label: 'Plans', icon: 'inventory_2', route: '/admin/plans' },
    { label: 'Bandwidths', icon: 'speed', route: '/admin/bandwidths' },
    { label: 'Routers', icon: 'router', route: '/admin/routers' },
    { label: 'Pools', icon: 'pool', route: '/admin/pools' },
    { label: 'Hotspot', icon: 'wifi', route: '/admin/hotspot' },
    { label: 'Technician', icon: 'engineering', route: '/admin/technician' },
    { label: 'Notifications', icon: 'notifications', route: '/admin/notifications' },
    { label: 'Settings', icon: 'settings', route: '/admin/settings' },
  ];

  userInitial(): string {
    return (this.auth.currentUser()?.username?.[0] ?? 'A').toUpperCase();
  }
}


