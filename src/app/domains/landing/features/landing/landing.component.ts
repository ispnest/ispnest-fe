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
      <!-- ── Navbar ─────────────────────────────────────────────── -->
      <nav
        class="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-a4 bg-neutral-1 px-6 py-4"
      >
        <div class="flex items-center gap-2.5">
          <img src="/img/ispnest-icon.svg" alt="ISPNest" class="size-7 object-contain" />
          <span class="text-lg font-bold tracking-tight text-neutral-12">ISPNest</span>
        </div>
        <div class="flex items-center gap-3">
          <a matButton class="tertiary" routerLink="/portal">Customer Portal</a>
          <a class="primary" matButton routerLink="/login">Admin Login</a>
        </div>
      </nav>

      <main class="flex flex-1 flex-col">
        <!-- ── Hero ───────────────────────────────────────────────── -->
        <section class="relative overflow-hidden">
          <!-- Dot-grid background -->
          <div
            class="pointer-events-none absolute inset-0"
            style="background-image: radial-gradient(circle, var(--color-neutral-a5) 1px, transparent 1px);
                      background-size: 28px 28px;"
          ></div>

          <div
            class="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24"
          >
            <!-- Left: copy -->
            <div class="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
              <span
                class="inline-flex items-center gap-1.5 rounded-full border border-primary-a5 bg-primary-a2 px-3 py-1 text-xs font-semibold text-primary-11"
              >
                <mat-icon svgIcon="wifi" class="size-3.5" />
                ISP Management Platform
              </span>

              <h1
                class="text-4xl font-black leading-tight tracking-tight text-neutral-12 sm:text-5xl lg:text-6xl"
              >
                Run Your ISP<br />
                <span class="text-primary-11">Smarter &amp; Faster</span>
              </h1>

              <p class="max-w-lg text-neutral-11">
                All-in-one platform for PPPoE subscribers, hotspot billing, MikroTik router
                management and automated M-Pesa payments.
              </p>

              <div class="flex flex-wrap gap-3">
                <a class="primary" matButton routerLink="/login">
                  <mat-icon svgIcon="layout-dashboard" />
                  Admin Panel
                </a>
                <a matButton class="tertiary" routerLink="/portal">
                  <mat-icon svgIcon="user-round" />
                  Customer Portal
                </a>
              </div>
            </div>

            <!-- Right: network topology SVG -->
            <div class="flex items-center justify-center">
              <svg
                viewBox="0 0 420 360"
                class="w-full max-w-sm"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Hub → distribution lines (dashed) -->
                <line
                  x1="210"
                  y1="180"
                  x2="80"
                  y2="80"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1.5"
                  stroke-dasharray="5 4"
                />
                <line
                  x1="210"
                  y1="180"
                  x2="340"
                  y2="80"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1.5"
                  stroke-dasharray="5 4"
                />
                <line
                  x1="210"
                  y1="180"
                  x2="80"
                  y2="280"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1.5"
                  stroke-dasharray="5 4"
                />
                <line
                  x1="210"
                  y1="180"
                  x2="340"
                  y2="280"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1.5"
                  stroke-dasharray="5 4"
                />
                <line
                  x1="210"
                  y1="180"
                  x2="210"
                  y2="48"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1.5"
                  stroke-dasharray="5 4"
                />
                <line
                  x1="210"
                  y1="180"
                  x2="210"
                  y2="312"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1.5"
                  stroke-dasharray="5 4"
                />

                <!-- Distribution → edge lines (solid, thin) -->
                <line
                  x1="80"
                  y1="80"
                  x2="28"
                  y2="38"
                  stroke="var(--color-neutral-a4)"
                  stroke-width="1"
                />
                <line
                  x1="80"
                  y1="80"
                  x2="132"
                  y2="33"
                  stroke="var(--color-neutral-a4)"
                  stroke-width="1"
                />
                <line
                  x1="340"
                  y1="80"
                  x2="288"
                  y2="33"
                  stroke="var(--color-neutral-a4)"
                  stroke-width="1"
                />
                <line
                  x1="340"
                  y1="80"
                  x2="392"
                  y2="38"
                  stroke="var(--color-neutral-a4)"
                  stroke-width="1"
                />
                <line
                  x1="80"
                  y1="280"
                  x2="28"
                  y2="322"
                  stroke="var(--color-neutral-a4)"
                  stroke-width="1"
                />
                <line
                  x1="80"
                  y1="280"
                  x2="132"
                  y2="327"
                  stroke="var(--color-neutral-a4)"
                  stroke-width="1"
                />
                <line
                  x1="340"
                  y1="280"
                  x2="288"
                  y2="327"
                  stroke="var(--color-neutral-a4)"
                  stroke-width="1"
                />
                <line
                  x1="340"
                  y1="280"
                  x2="392"
                  y2="322"
                  stroke="var(--color-neutral-a4)"
                  stroke-width="1"
                />

                <!-- Central hub: outer glow rings -->
                <circle
                  cx="210"
                  cy="180"
                  r="62"
                  fill="var(--color-blue-a2)"
                  stroke="var(--color-blue-a4)"
                  stroke-width="1"
                />
                <circle
                  cx="210"
                  cy="180"
                  r="44"
                  fill="var(--color-blue-a3)"
                  stroke="var(--color-blue-a5)"
                  stroke-width="1"
                />

                <!-- Central hub: core -->
                <circle cx="210" cy="180" r="28" fill="var(--color-blue-9)" />
                <!-- Server rack icon -->
                <rect x="199" y="170" width="22" height="4" rx="1.5" fill="white" opacity="0.9" />
                <rect x="199" y="178" width="22" height="4" rx="1.5" fill="white" opacity="0.7" />
                <rect x="199" y="186" width="22" height="4" rx="1.5" fill="white" opacity="0.55" />
                <circle cx="217" cy="172" r="1.3" fill="var(--color-green-9)" />
                <circle cx="217" cy="180" r="1.3" fill="var(--color-amber-9)" />
                <circle cx="217" cy="188" r="1.3" fill="var(--color-red-a9)" />

                <!-- Distribution nodes: top -->
                <circle
                  cx="210"
                  cy="48"
                  r="17"
                  fill="var(--color-teal-a3)"
                  stroke="var(--color-teal-8)"
                  stroke-width="1.5"
                />
                <path
                  d="M204 45 Q210 39 216 45"
                  stroke="var(--color-teal-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <path
                  d="M206.5 48.5 Q210 45 213.5 48.5"
                  stroke="var(--color-teal-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <circle cx="210" cy="51.5" r="1.5" fill="var(--color-teal-11)" />

                <!-- top-left -->
                <circle
                  cx="80"
                  cy="80"
                  r="17"
                  fill="var(--color-indigo-a3)"
                  stroke="var(--color-indigo-8)"
                  stroke-width="1.5"
                />
                <path
                  d="M74 77 Q80 71 86 77"
                  stroke="var(--color-indigo-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <path
                  d="M76.5 80.5 Q80 77 83.5 80.5"
                  stroke="var(--color-indigo-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <circle cx="80" cy="83.5" r="1.5" fill="var(--color-indigo-11)" />

                <!-- top-right -->
                <circle
                  cx="340"
                  cy="80"
                  r="17"
                  fill="var(--color-indigo-a3)"
                  stroke="var(--color-indigo-8)"
                  stroke-width="1.5"
                />
                <path
                  d="M334 77 Q340 71 346 77"
                  stroke="var(--color-indigo-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <path
                  d="M336.5 80.5 Q340 77 343.5 80.5"
                  stroke="var(--color-indigo-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <circle cx="340" cy="83.5" r="1.5" fill="var(--color-indigo-11)" />

                <!-- bottom-left -->
                <circle
                  cx="80"
                  cy="280"
                  r="17"
                  fill="var(--color-violet-a3)"
                  stroke="var(--color-violet-8)"
                  stroke-width="1.5"
                />
                <path
                  d="M74 277 Q80 271 86 277"
                  stroke="var(--color-violet-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <path
                  d="M76.5 280.5 Q80 277 83.5 280.5"
                  stroke="var(--color-violet-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <circle cx="80" cy="283.5" r="1.5" fill="var(--color-violet-11)" />

                <!-- bottom-right -->
                <circle
                  cx="340"
                  cy="280"
                  r="17"
                  fill="var(--color-violet-a3)"
                  stroke="var(--color-violet-8)"
                  stroke-width="1.5"
                />
                <path
                  d="M334 277 Q340 271 346 277"
                  stroke="var(--color-violet-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <path
                  d="M336.5 280.5 Q340 277 343.5 280.5"
                  stroke="var(--color-violet-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <circle cx="340" cy="283.5" r="1.5" fill="var(--color-violet-11)" />

                <!-- bottom -->
                <circle
                  cx="210"
                  cy="312"
                  r="17"
                  fill="var(--color-teal-a3)"
                  stroke="var(--color-teal-8)"
                  stroke-width="1.5"
                />
                <path
                  d="M204 309 Q210 303 216 309"
                  stroke="var(--color-teal-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <path
                  d="M206.5 312.5 Q210 309 213.5 312.5"
                  stroke="var(--color-teal-11)"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <circle cx="210" cy="315.5" r="1.5" fill="var(--color-teal-11)" />

                <!-- Edge device nodes (small circles) -->
                <circle
                  cx="28"
                  cy="38"
                  r="9"
                  fill="var(--color-neutral-a3)"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1"
                />
                <circle
                  cx="132"
                  cy="33"
                  r="9"
                  fill="var(--color-neutral-a3)"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1"
                />
                <circle
                  cx="288"
                  cy="33"
                  r="9"
                  fill="var(--color-neutral-a3)"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1"
                />
                <circle
                  cx="392"
                  cy="38"
                  r="9"
                  fill="var(--color-neutral-a3)"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1"
                />
                <circle
                  cx="28"
                  cy="322"
                  r="9"
                  fill="var(--color-neutral-a3)"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1"
                />
                <circle
                  cx="132"
                  cy="327"
                  r="9"
                  fill="var(--color-neutral-a3)"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1"
                />
                <circle
                  cx="288"
                  cy="327"
                  r="9"
                  fill="var(--color-neutral-a3)"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1"
                />
                <circle
                  cx="392"
                  cy="322"
                  r="9"
                  fill="var(--color-neutral-a3)"
                  stroke="var(--color-neutral-a6)"
                  stroke-width="1"
                />

                <!-- Screen icons in edge nodes -->
                <rect x="23" y="35" width="10" height="7" rx="1" fill="var(--color-neutral-a7)" />
                <rect
                  x="127"
                  cy="30"
                  y="30"
                  width="10"
                  height="7"
                  rx="1"
                  fill="var(--color-neutral-a7)"
                />
                <rect x="283" y="30" width="10" height="7" rx="1" fill="var(--color-neutral-a7)" />
                <rect x="387" y="35" width="10" height="7" rx="1" fill="var(--color-neutral-a7)" />
                <rect x="23" y="319" width="10" height="7" rx="1" fill="var(--color-neutral-a7)" />
                <rect x="127" y="324" width="10" height="7" rx="1" fill="var(--color-neutral-a7)" />
                <rect x="283" y="324" width="10" height="7" rx="1" fill="var(--color-neutral-a7)" />
                <rect x="387" y="319" width="10" height="7" rx="1" fill="var(--color-neutral-a7)" />
              </svg>
            </div>
          </div>
        </section>

        <!-- ── Stats strip ────────────────────────────────────────── -->
        <div class="border-y border-neutral-a4 bg-neutral-a2">
          <div class="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-neutral-a4">
            <div class="px-8 py-5 text-center">
              <div class="text-xl font-black text-neutral-12">PPPoE</div>
              <div class="mt-0.5 text-xs text-neutral-10">Subscriber Management</div>
            </div>
            <div class="px-8 py-5 text-center">
              <div class="text-xl font-black text-neutral-12">M-Pesa</div>
              <div class="mt-0.5 text-xs text-neutral-10">Automated Billing</div>
            </div>
            <div class="px-8 py-5 text-center">
              <div class="text-xl font-black text-neutral-12">MikroTik</div>
              <div class="mt-0.5 text-xs text-neutral-10">Router Integration</div>
            </div>
          </div>
        </div>

        <!-- ── Features ───────────────────────────────────────────── -->
        <section class="px-6 py-16">
          <div class="mx-auto max-w-5xl">
            <h2 class="mb-2 text-center text-2xl font-bold text-neutral-12">
              Everything you need to run your ISP
            </h2>
            <p class="mb-10 text-center text-sm text-neutral-11">
              From customer onboarding to billing and network control.
            </p>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <mat-card appearance="outlined" class="p-5">
                <div class="flex size-9 items-center justify-center rounded-lg bg-primary-a3">
                  <mat-icon svgIcon="users" class="size-4 text-primary-11" />
                </div>
                <div class="mt-3 font-semibold text-neutral-12">Customer Management</div>
                <p class="mt-1 text-sm text-neutral-11">
                  PPPoE and hotspot subscribers, payments, and invoices — all in one place.
                </p>
              </mat-card>

              <mat-card appearance="outlined" class="p-5">
                <div class="flex size-9 items-center justify-center rounded-lg bg-teal-a3">
                  <mat-icon svgIcon="network" class="size-4 text-teal-11" />
                </div>
                <div class="mt-3 font-semibold text-neutral-12">Network Control</div>
                <p class="mt-1 text-sm text-neutral-11">
                  Manage MikroTik routers, IP pools, and bandwidth profiles remotely.
                </p>
              </mat-card>

              <mat-card appearance="outlined" class="p-5">
                <div class="flex size-9 items-center justify-center rounded-lg bg-violet-a3">
                  <mat-icon svgIcon="wifi" class="size-4 text-violet-11" />
                </div>
                <div class="mt-3 font-semibold text-neutral-12">Hotspot Portal</div>
                <p class="mt-1 text-sm text-neutral-11">
                  Self-service captive portal with voucher plans and M-Pesa STK push payments.
                </p>
              </mat-card>
            </div>
          </div>
        </section>
      </main>

      <!-- ── Footer ─────────────────────────────────────────────── -->
      <footer class="border-t border-neutral-a4 px-6 py-4">
        <div class="mx-auto flex max-w-6xl items-center justify-between">
          <div class="flex items-center gap-2">
            <img src="/img/ispnest-icon.svg" alt="ISPNest" class="size-5 object-contain" />
            <span class="text-sm font-semibold text-neutral-12">ISPNest</span>
          </div>
          <p class="text-xs text-neutral-10">© {{ year }} ISPNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
})
export class LandingComponent {
  readonly year = new Date().getFullYear();
}
