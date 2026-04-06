import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Media } from '@/app/core/media';
import { BuiSidebar, BuiSidebarBody, BuiSidebarButton, BuiSidebarFooter, BuiSidebarHeader, BuiSidebarIcon, BuiSidebarLabel, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSpacer } from '@/app/ui/sidebar';

@Component({
  selector: 'SidebarNavigationSimple',
  imports: [MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent, MatDivider, MatMenu, MatMenuItem, MatMenuTrigger, BuiSidebar, BuiSidebarHeader, BuiSidebarBody, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarButton, BuiSidebarLabel, BuiSidebarMenuRow, BuiSidebarIcon, BuiSidebarSpacer, BuiSidebarFooter],
  template: `
    <mat-sidenav-container>
      <mat-sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" #sidenav>
        <!-- Sidebar -->
        <aside buiSidebar>
          <!-- Header -->
          <div buiSidebarHeader class="pb-3">
            <div class="flex items-center">
              <img class="-ml-0.5 size-7" src="/images/logo/logomark.svg" alt="Logomark" />
              <div class="ml-3 text-2xl font-bold">Acme</div>
            </div>
          </div>

          <!-- Body -->
          <div buiSidebarBody>
            <div buiSidebarSection>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton class="active">
                        <mat-icon buiSidebarIcon svgIcon="layout-dashboard" />
                        <span buiSidebarLabel>Dashboard</span>
                      </a>
                    </div>
                  </li>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="square-kanban" />
                        <span buiSidebarLabel>Projects</span>
                      </a>
                    </div>
                  </li>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="list-todo" />
                        <span buiSidebarLabel>Tasks</span>
                      </a>
                    </div>
                  </li>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="calendar" />
                        <span buiSidebarLabel>Calendar</span>
                      </a>
                    </div>
                  </li>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="file-chart-pie" />
                        <span buiSidebarLabel>Reports</span>
                      </a>
                    </div>
                  </li>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="settings" />
                        <span buiSidebarLabel>Settings</span>
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div buiSidebarSpacer></div>

            <div buiSidebarSection>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <button buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="book-open-text" />
                        <span buiSidebarLabel>Documentation</span>
                      </button>
                    </div>
                  </li>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <button buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="life-buoy" />
                        <span buiSidebarLabel>Support</span>
                      </button>
                    </div>
                  </li>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <button buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="send" />
                        <span buiSidebarLabel>Feedback</span>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div buiSidebarFooter class="p-3">
            <button class="flex w-full cursor-pointer items-center gap-x-3 rounded-xl p-2 text-left hover:bg-neutral-a3" [matMenuTriggerFor]="userMenu">
              <img class="size-9 rounded-lg object-cover grayscale" src="/images/photos/john-builder.jpg" alt="User avatar" />
              <div class="flex min-w-0 flex-auto flex-col select-none">
                <div class="truncate text-lg font-medium">John Builder</div>
                <div class="truncate text-sm text-neutral-a11">john.builder&#64;example.com</div>
              </div>
              <mat-icon class="size-4" svgIcon="ellipsis-vertical" />
            </button>

            <mat-menu xPosition="before" yPosition="above" #userMenu>
              <button mat-menu-item>
                <img class="size-9 rounded-lg object-cover" src="/images/photos/john-builder.jpg" alt="User avatar" />
                <div class="ml-3 flex min-w-0 flex-auto flex-col select-none">
                  <div class="truncate text-lg font-medium">John Builder</div>
                  <div class="truncate text-sm text-neutral-a11">john.builder&#64;example.com</div>
                </div>
              </button>
              <mat-divider />
              <button mat-menu-item>
                <mat-icon svgIcon="sparkles" />
                Upgrade to Pro
              </button>
              <mat-divider />
              <button mat-menu-item>
                <mat-icon svgIcon="user-round" />
                Account
              </button>
              <button mat-menu-item>
                <mat-icon svgIcon="wallet" />
                Billing
              </button>
              <button mat-menu-item>
                <mat-icon svgIcon="bell" />
                Notifications
              </button>
              <mat-divider />
              <button mat-menu-item>
                <mat-icon svgIcon="log-out" />
                Log out
              </button>
            </mat-menu>
          </div>
        </aside>
      </mat-sidenav>

      <mat-sidenav-content>
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
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class SidebarNavigationSimple {
  // Dependencies
  private readonly media = inject(Media);

  // State
  protected readonly isMobile = this.media.match(`(max-width: 767px)`);
}
