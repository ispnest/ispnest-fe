import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemMeta, MatListSubheaderCssMatStyler, MatNavList } from '@angular/material/list';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Media } from '@/app/core/media';

@Component({
  selector: 'SidebarLayoutInset',
  imports: [MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent, MatListItem, MatListItemIcon, MatListItemMeta, MatListSubheaderCssMatStyler, MatNavList],
  template: `
    <mat-sidenav-container class="flex flex-auto flex-col">
      <mat-sidenav class="border-none" [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" #sidenav>
        <!-- Sidebar -->
        <div class="flex w-full flex-auto flex-col md:-mr-2">
          <div class="m-6 flex items-center">
            <img class="size-7" src="/images/logo/logomark.svg" alt="Logomark" />
            <div class="ml-3 text-2xl font-bold">Acme</div>
          </div>

          <mat-nav-list class="m-4 mt-0">
            <mat-list-item [activated]="true">
              <mat-icon matListItemIcon svgIcon="layout-dashboard" />
              <div matListItemLine>Dashboard</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon svgIcon="square-kanban" />
              <div matListItemLine>Projects</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon svgIcon="list-todo" />
              <div matListItemLine>Tasks</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon svgIcon="calendar" />
              <div matListItemLine>Calendar</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon svgIcon="file-chart-pie" />
              <div matListItemLine>Reports</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon svgIcon="settings" />
              <div matListItemLine>Settings</div>
            </mat-list-item>
          </mat-nav-list>

          <mat-nav-list class="m-4 mt-2">
            <div matSubheader>Teams</div>
            <mat-list-item>
              <mat-icon matListItemIcon svgIcon="hash" />
              <div matListItemLine>Marketing</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon svgIcon="hash" />
              <div matListItemLine>Sales</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon svgIcon="hash" />
              <div matListItemLine>Development</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon svgIcon="hash" />
              <div matListItemLine>Customer Success</div>
              <div matListItemMeta class="rounded-sm bg-neutral-a6 px-1 text-xs font-medium">9</div>
            </mat-list-item>
          </mat-nav-list>

          <mat-nav-list class="m-4 mt-auto">
            <mat-list-item>
              <div matListItemLine class="flex items-center">
                <div class="size-9 shrink-0 rounded-lg bg-[url(/images/photos/john-builder.jpg)] bg-cover inset-ring-1 inset-ring-white-a3"></div>
                <div class="ml-3 min-w-0">
                  <div class="truncate text-lg font-medium">John Builder</div>
                  <div class="truncate text-sm text-neutral-a11">john&#64;example.com</div>
                </div>
                <mat-icon class="ml-auto size-4 shrink-0" svgIcon="chevrons-up-down" />
              </div>
            </mat-list-item>
          </mat-nav-list>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="bg-transparent md:p-2">
        <div class="flex flex-auto flex-col bg-white shadow-xs md:rounded-lg md:border dark:bg-neutral-2">
          <!-- Toolbar -->
          <div class="flex items-center gap-x-4 border-b p-4">
            <button matIconButton (click)="sidenav.toggle()">
              <mat-icon svgIcon="panel-left" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex flex-auto p-6">
            <div class="flex-auto rounded-md border-2 border-dashed p-4"></div>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class SidebarLayoutInset {
  // Dependencies
  private readonly media = inject(Media);

  // State
  protected readonly isMobile = this.media.match(`(max-width: 767px)`);
}
