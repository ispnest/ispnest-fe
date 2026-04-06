import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatButton, MatIcon, MatCard],
  template: `
    <div class="flex min-h-screen flex-col">
      <!-- Nav -->
      <nav class="flex items-center justify-between border-b px-6 py-4">
        <div class="flex items-center gap-2">
          <img src="/img/ispnest-icon.svg" alt="ISPNest" class="size-7 object-contain" />
          <span class="text-xl font-bold tracking-tight">ISPNest</span>
        </div>
        <div class="flex items-center gap-3">
          <a matButton class="tertiary" routerLink="/portal">Customer Portal</a>
          <a class="primary" matButton routerLink="/login">Admin Login</a>
        </div>
      </nav>

      <!-- Hero -->
      <main class="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
        <div class="flex size-20 items-center justify-center rounded-2xl bg-primary-a3">
          <img src="/img/ispnest-icon.svg" alt="ISPNest" class="size-12 object-contain" />
        </div>
        <div>
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
            ISP Management Made Simple
          </h1>
          <p class="mx-auto mt-4 max-w-xl text-lg text-neutral-a11">
            Manage your customers, billing, routers, and hotspot services from a single powerful platform.
          </p>
        </div>
        <div class="flex flex-wrap justify-center gap-4">
          <a class="primary" matButton routerLink="/login">
            <mat-icon svgIcon="layout-dashboard" />
            Go to Admin Panel
          </a>
          <a matButton class="tertiary" routerLink="/portal">
            <mat-icon svgIcon="user-round" />
            Customer Portal
          </a>
        </div>

        <!-- Feature highlights -->
        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 w-full max-w-3xl">
          <mat-card appearance="filled" class="p-5 text-left">
            <div class="flex size-9 items-center justify-center rounded-lg bg-primary-a3">
              <mat-icon svgIcon="users" class="size-4 text-primary-a11" />
            </div>
            <div class="mt-3 font-semibold">Customer Management</div>
            <p class="mt-1 text-sm text-neutral-a11">PPPoE and hotspot subscribers, payments, invoices.</p>
          </mat-card>
          <mat-card appearance="filled" class="p-5 text-left">
            <div class="flex size-9 items-center justify-center rounded-lg bg-teal-a3">
              <mat-icon svgIcon="network" class="size-4 text-teal-a11" />
            </div>
            <div class="mt-3 font-semibold">Network Control</div>
            <p class="mt-1 text-sm text-neutral-a11">MikroTik routers, IP pools, bandwidth profiles.</p>
          </mat-card>
          <mat-card appearance="filled" class="p-5 text-left">
            <div class="flex size-9 items-center justify-center rounded-lg bg-violet-a3">
              <mat-icon svgIcon="wifi" class="size-4 text-violet-a11" />
            </div>
            <div class="mt-3 font-semibold">Hotspot Portal</div>
            <p class="mt-1 text-sm text-neutral-a11">Captive portal, voucher plans, self-service access.</p>
          </mat-card>
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

