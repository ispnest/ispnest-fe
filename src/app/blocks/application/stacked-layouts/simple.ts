import { Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'StackedLayoutSimple',
  imports: [MatIcon, MatIconButton, MatButton, RouterLink, RouterLinkActive, MatMenu, MatMenuTrigger, MatMenuItem],
  template: `
    <div class="flex flex-auto flex-col">
      <!-- Header -->
      <div class="flex items-center border-b px-6 py-4">
        <img class="size-7" src="/images/logo/logomark.svg" alt="Logomark" />

        <!-- Desktop menu -->
        <nav class="ml-8 hidden items-center gap-x-2 sm:flex">
          @for (item of nav; track item.id) {
            <a matButton class="tertiary" [routerLink]="item.link" [routerLinkActive]="['bg-neutral-a4']" [routerLinkActiveOptions]="{ exact: true }">
              {{ item.title }}
            </a>
          }
        </nav>

        <!-- Mobile menu -->
        <button matIconButton class="ml-4 sm:hidden" [matMenuTriggerFor]="mobileMenu">
          <mat-icon svgIcon="menu" />
        </button>
        <mat-menu #mobileMenu="matMenu">
          @for (item of nav; track item.id) {
            <a mat-menu-item [routerLink]="item.link" [routerLinkActive]="['bg-primary', 'text-primary-contrast']" [routerLinkActiveOptions]="{ exact: true }">
              {{ item.title }}
            </a>
          }
        </mat-menu>

        <div class="ml-auto flex items-center gap-x-1 pl-6">
          <button matIconButton>
            <mat-icon svgIcon="bell" />
          </button>
          <button matIconButton class="ml-1">
            <mat-icon svgIcon="user" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex flex-auto flex-col p-6">
        <div class="mb-6 text-4xl font-semibold">Welcome back, John!</div>
        <div class="flex-auto rounded-md border-2 border-dashed p-4"></div>
      </div>
    </div>
  `,
})
export class StackedLayoutSimple {
  // State
  protected nav = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      link: '.',
    },
    {
      id: 'projects',
      title: 'Projects',
      link: 'projects',
    },
    {
      id: 'my-tasks',
      title: 'My Tasks',
      link: 'my-tasks',
    },
    {
      id: 'settings',
      title: 'Settings',
      link: 'settings',
    },
  ];
}
