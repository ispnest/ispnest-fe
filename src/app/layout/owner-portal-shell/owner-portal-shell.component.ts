import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';

@Component({
  selector: 'app-owner-portal-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatIcon],
  template: `
    <div class="flex min-h-screen flex-col">
      <header class="flex items-center justify-between border-b border-neutral-a4 bg-white px-4 py-3 dark:bg-neutral-2 sm:px-8">
        <a routerLink="/owner-portal/dashboard" class="flex items-center gap-2.5">
          <img class="size-7 object-contain" src="/img/ispnest-icon.svg" alt="ISPNest" />
          <span class="text-lg font-semibold tracking-tight">Owner Portal</span>
        </a>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-neutral-a11 hover:bg-neutral-a3"
          (click)="auth.ownerPortalLogout()"
        >
          <mat-icon svgIcon="log-out" class="size-4" />
          Log out
        </button>
      </header>
      <main class="flex flex-auto flex-col">
        <router-outlet />
      </main>
    </div>
  `,
})
export class OwnerPortalShellComponent {
  protected readonly auth = inject(AuthService);
}
