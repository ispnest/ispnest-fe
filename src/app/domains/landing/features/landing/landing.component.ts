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
          <a matButton class="tertiary" routerLink="/login">Sign In</a>
          <a class="primary" matButton routerLink="/onboard">Get Started</a>
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
                Multi-Tenant ISP Platform
              </span>

              <h1
                class="text-4xl font-black leading-tight tracking-tight text-neutral-12 sm:text-5xl lg:text-6xl"
              >
                Launch Your ISP<br />
                <span class="text-primary-11">In Minutes</span>
              </h1>

              <p class="max-w-lg text-neutral-11">
                Create your own ISP management platform with automated billing, PPPoE subscriber
                management, MikroTik router control, and hotspot portals — all multi-tenant and
                ready to scale.
              </p>

              <div class="flex flex-wrap gap-3">
                <a class="primary" matButton routerLink="/onboard">
                  <mat-icon svgIcon="rocket" />
                  Start Free Trial
                </a>
                <a matButton class="tertiary" routerLink="/login">
                  <mat-icon svgIcon="layout-dashboard" />
                  Admin Panel
                </a>
              </div>
            </div>

            <!-- Right: multi-tenant illustration SVG -->
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

                <!-- Central hub: core (ISPNest platform) -->
                <circle cx="210" cy="180" r="28" fill="var(--color-blue-9)" />
                <rect x="199" y="170" width="22" height="4" rx="1.5" fill="white" opacity="0.9" />
                <rect x="199" y="178" width="22" height="4" rx="1.5" fill="white" opacity="0.7" />
                <rect x="199" y="186" width="22" height="4" rx="1.5" fill="white" opacity="0.55" />
                <circle cx="217" cy="172" r="1.3" fill="var(--color-green-9)" />
                <circle cx="217" cy="180" r="1.3" fill="var(--color-amber-9)" />
                <circle cx="217" cy="188" r="1.3" fill="var(--color-red-a9)" />

                <!-- Tenant nodes (ISPs) -->
                <circle
                  cx="210"
                  cy="48"
                  r="17"
                  fill="var(--color-teal-a3)"
                  stroke="var(--color-teal-8)"
                  stroke-width="1.5"
                />
                <text
                  x="210"
                  y="53"
                  text-anchor="middle"
                  font-size="10"
                  fill="var(--color-teal-11)"
                  font-weight="bold"
                >
                  T1
                </text>

                <circle
                  cx="80"
                  cy="80"
                  r="17"
                  fill="var(--color-indigo-a3)"
                  stroke="var(--color-indigo-8)"
                  stroke-width="1.5"
                />
                <text
                  x="80"
                  y="85"
                  text-anchor="middle"
                  font-size="10"
                  fill="var(--color-indigo-11)"
                  font-weight="bold"
                >
                  T2
                </text>

                <circle
                  cx="340"
                  cy="80"
                  r="17"
                  fill="var(--color-indigo-a3)"
                  stroke="var(--color-indigo-8)"
                  stroke-width="1.5"
                />
                <text
                  x="340"
                  y="85"
                  text-anchor="middle"
                  font-size="10"
                  fill="var(--color-indigo-11)"
                  font-weight="bold"
                >
                  T3
                </text>

                <circle
                  cx="80"
                  cy="280"
                  r="17"
                  fill="var(--color-violet-a3)"
                  stroke="var(--color-violet-8)"
                  stroke-width="1.5"
                />
                <text
                  x="80"
                  y="285"
                  text-anchor="middle"
                  font-size="10"
                  fill="var(--color-violet-11)"
                  font-weight="bold"
                >
                  T4
                </text>

                <circle
                  cx="340"
                  cy="280"
                  r="17"
                  fill="var(--color-violet-a3)"
                  stroke="var(--color-violet-8)"
                  stroke-width="1.5"
                />
                <text
                  x="340"
                  y="285"
                  text-anchor="middle"
                  font-size="10"
                  fill="var(--color-violet-11)"
                  font-weight="bold"
                >
                  T5
                </text>

                <circle
                  cx="210"
                  cy="312"
                  r="17"
                  fill="var(--color-teal-a3)"
                  stroke="var(--color-teal-8)"
                  stroke-width="1.5"
                />
                <text
                  x="210"
                  y="317"
                  text-anchor="middle"
                  font-size="10"
                  fill="var(--color-teal-11)"
                  font-weight="bold"
                >
                  T6
                </text>
              </svg>
            </div>
          </div>
        </section>

        <!-- ── How it works ─────────────────────────────────────── -->
        <div class="border-y border-neutral-a4 bg-neutral-a2">
          <div class="mx-auto max-w-4xl px-6 py-12">
            <h2 class="mb-8 text-center text-2xl font-bold text-neutral-12">
              Get Running in 3 Steps
            </h2>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div class="text-center">
                <div
                  class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-a3"
                >
                  <span class="text-lg font-bold text-primary-11">1</span>
                </div>
                <div class="mt-3 font-semibold text-neutral-12">Sign Up</div>
                <p class="mt-1 text-sm text-neutral-11">
                  Create your tenant with a unique subdomain for your ISP.
                </p>
              </div>
              <div class="text-center">
                <div
                  class="mx-auto flex size-12 items-center justify-center rounded-full bg-teal-a3"
                >
                  <span class="text-lg font-bold text-teal-11">2</span>
                </div>
                <div class="mt-3 font-semibold text-neutral-12">Get Notified</div>
                <p class="mt-1 text-sm text-neutral-11">
                  Receive an email when your platform is provisioned and ready.
                </p>
              </div>
              <div class="text-center">
                <div
                  class="mx-auto flex size-12 items-center justify-center rounded-full bg-violet-a3"
                >
                  <span class="text-lg font-bold text-violet-11">3</span>
                </div>
                <div class="mt-3 font-semibold text-neutral-12">Manage Your ISP</div>
                <p class="mt-1 text-sm text-neutral-11">
                  Login and start managing customers, billing, routers, and more.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Features ───────────────────────────────────────────── -->
        <section class="px-6 py-16">
          <div class="mx-auto max-w-5xl">
            <h2 class="mb-2 text-center text-2xl font-bold text-neutral-12">
              Everything Your ISP Needs
            </h2>
            <p class="mb-10 text-center text-sm text-neutral-11">
              Each tenant gets a fully isolated environment with all the tools to run an ISP.
            </p>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  Self-service captive portal with voucher plans and M-Pesa STK push.
                </p>
              </mat-card>

              <mat-card appearance="outlined" class="p-5">
                <div class="flex size-9 items-center justify-center rounded-lg bg-amber-a3">
                  <mat-icon svgIcon="credit-card" class="size-4 text-amber-11" />
                </div>
                <div class="mt-3 font-semibold text-neutral-12">Automated Billing</div>
                <p class="mt-1 text-sm text-neutral-11">
                  M-Pesa integration, recurring invoices, overdue tracking, and credits.
                </p>
              </mat-card>

              <mat-card appearance="outlined" class="p-5">
                <div class="flex size-9 items-center justify-center rounded-lg bg-green-a3">
                  <mat-icon svgIcon="shield" class="size-4 text-green-11" />
                </div>
                <div class="mt-3 font-semibold text-neutral-12">Isolated & Secure</div>
                <p class="mt-1 text-sm text-neutral-11">
                  Each tenant has its own database. Full data isolation guaranteed.
                </p>
              </mat-card>

              <mat-card appearance="outlined" class="p-5">
                <div class="flex size-9 items-center justify-center rounded-lg bg-blue-a3">
                  <mat-icon svgIcon="bell" class="size-4 text-blue-11" />
                </div>
                <div class="mt-3 font-semibold text-neutral-12">Real-time Notifications</div>
                <p class="mt-1 text-sm text-neutral-11">
                  SMS, email, and in-app notifications for payments, outages, and more.
                </p>
              </mat-card>
            </div>
          </div>
        </section>

        <!-- ── CTA ──────────────────────────────────────────────── -->
        <section class="border-t border-neutral-a4 bg-primary-a2 px-6 py-16">
          <div class="mx-auto max-w-2xl text-center">
            <h2 class="text-3xl font-bold text-neutral-12">Ready to Launch Your ISP?</h2>
            <p class="mt-3 text-neutral-11">
              Join dozens of ISPs running on ISPNest. No infrastructure hassle, just business.
            </p>
            <div class="mt-6 flex flex-wrap justify-center gap-3">
              <a class="primary" matButton routerLink="/onboard">
                <mat-icon svgIcon="rocket" />
                Get Started for Free
              </a>
              <a matButton class="tertiary" routerLink="/login">
                <mat-icon svgIcon="log-in" />
                Sign In
              </a>
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
