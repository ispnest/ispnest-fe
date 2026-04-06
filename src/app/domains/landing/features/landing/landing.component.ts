import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatButton, MatIcon],
  template: `
    <div class="flex min-h-screen flex-col">
      <!-- Nav -->
      <nav class="flex items-center justify-between border-b px-6 py-4">
        <div class="text-2xl font-bold tracking-tight">ISPNest</div>
        <div class="flex items-center gap-3">
          <a matButton routerLink="/portal">Customer Portal</a>
          <a class="primary" matButton routerLink="/login">Admin Login</a>
        </div>
      </nav>

      <!-- Hero -->
      <main class="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <div class="flex size-20 items-center justify-center rounded-2xl bg-primary-a3">
          <mat-icon svgIcon="wifi" class="size-10 text-primary-a11" />
        </div>
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
          ISP Management Made Simple
        </h1>
        <p class="max-w-xl text-lg text-neutral-a11">
          Manage your customers, billing, routers, and hotspot services from a single powerful platform.
        </p>
        <div class="flex gap-4">
          <a class="primary" matButton routerLink="/login">
            <mat-icon svgIcon="layout-dashboard" />
            Go to Admin Panel
          </a>
          <a matButton routerLink="/portal">
            <mat-icon svgIcon="user-round" />
            Customer Portal
          </a>
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t p-4 text-center text-sm text-neutral-a9">
        © {{ year }} ISPNest. All rights reserved.
      </footer>
    </div>
  `,
})
export class LandingComponent {
  readonly year = new Date().getFullYear();
}

