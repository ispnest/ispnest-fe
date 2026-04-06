import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';
import { Media } from '@/app/core/media';
import { BuiSidebar, BuiSidebarBody, BuiSidebarButton, BuiSidebarFooter, BuiSidebarHeader, BuiSidebarIcon, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSpacer } from '@/app/ui/sidebar';

@Component({
  selector: 'SidebarNavigationIconsOnly',
  imports: [MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent, MatDivider, MatMenu, MatMenuItem, MatMenuTrigger, MatTooltip, BuiSidebar, BuiSidebarHeader, BuiSidebarBody, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarButton, BuiSidebarMenuRow, BuiSidebarSpacer, BuiSidebarIcon, BuiSidebarFooter],
  template: `
    <mat-sidenav-container>
      <mat-sidenav class="w-12" [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" #sidenav>
        <!-- Sidebar -->
        <aside buiSidebar class="w-12">
          <!-- Header -->
          <div buiSidebarHeader class="px-1 pt-4 pb-1">
            <div class="flex items-center justify-center">
              <img class="size-6" src="/images/logo/logomark.svg" alt="Logomark" />
            </div>
          </div>

          <!-- Body -->
          <div buiSidebarBody>
            <div buiSidebarSection class="p-0">
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  <li buiSidebarMenuItem matTooltip="Inbox" matTooltipPosition="after" [matTooltipClass]="['-ml-0.5']">
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton class="active">
                        <mat-icon buiSidebarIcon svgIcon="inbox" />
                      </a>
                    </div>
                  </li>

                  <li buiSidebarMenuItem matTooltip="Drafts" matTooltipPosition="after" [matTooltipClass]="['-ml-0.5']">
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="text-select" />
                      </a>
                    </div>
                  </li>

                  <li buiSidebarMenuItem matTooltip="Sent" matTooltipPosition="after" [matTooltipClass]="['-ml-0.5']">
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="send" />
                      </a>
                    </div>
                  </li>

                  <li buiSidebarMenuItem matTooltip="Spam" matTooltipPosition="after" [matTooltipClass]="['-ml-0.5']">
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="mail-warning" />
                      </a>
                    </div>
                  </li>

                  <li buiSidebarMenuItem matTooltip="Archived" matTooltipPosition="after" [matTooltipClass]="['-ml-0.5']">
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="archive" />
                      </a>
                    </div>
                  </li>

                  <li buiSidebarMenuItem matTooltip="Trash" matTooltipPosition="after" [matTooltipClass]="['-ml-0.5']">
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="trash-2" />
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div buiSidebarSpacer></div>

            <div buiSidebarSection class="p-0">
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  <li buiSidebarMenuItem matTooltip="Help" matTooltipPosition="after" [matTooltipClass]="['-ml-0.5']">
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="message-circle-question-mark" />
                      </a>
                    </div>
                  </li>
                  <li buiSidebarMenuItem matTooltip="Settings" matTooltipPosition="after" [matTooltipClass]="['-ml-0.5']">
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="settings" />
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div buiSidebarFooter class="p-2">
            <div role="button" class="flex cursor-pointer items-center rounded-xl" [matMenuTriggerFor]="userMenu">
              <img class="size-8 rounded-lg object-cover" src="/images/photos/john-builder.jpg" alt="User avatar" />
            </div>
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
export class SidebarNavigationIconsOnly {
  // Dependencies
  private readonly media = inject(Media);

  // State
  protected readonly isMobile = this.media.match(`(max-width: 767px)`);
}
