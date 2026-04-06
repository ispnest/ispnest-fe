import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Media } from '@/app/core/media';
import { BuiCollapsible, BuiCollapsibleContent, BuiCollapsiblePanel, BuiCollapsibleTrigger } from '@/app/ui/collapsible';
import { BuiSidebar, BuiSidebarAction, BuiSidebarBadge, BuiSidebarBody, BuiSidebarButton, BuiSidebarDivider, BuiSidebarFooter, BuiSidebarHeader, BuiSidebarIcon, BuiSidebarLabel, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSectionHeader } from '@/app/ui/sidebar';

@Component({
  selector: 'SidebarNavigationAuxiliaryActions',
  imports: [MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent, MatDivider, MatMenu, MatMenuItem, MatMenuTrigger, BuiSidebar, BuiSidebarHeader, BuiSidebarBody, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarIcon, BuiSidebarLabel, BuiSidebarAction, BuiCollapsible, BuiSidebarSectionHeader, BuiSidebarButton, BuiCollapsibleTrigger, BuiCollapsiblePanel, BuiCollapsibleContent, BuiSidebarMenuRow, BuiSidebarDivider, BuiSidebarFooter, BuiSidebarBadge],
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
                        <mat-icon buiSidebarIcon svgIcon="inbox" />
                        <span buiSidebarLabel>Inbox</span>
                        <div buiSidebarBadge>4</div>
                      </a>
                    </div>
                  </li>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <a buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="bug" />
                        <span buiSidebarLabel>My issues</span>
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div buiSidebarSection buiCollapsible [expanded]="true">
              <div buiSidebarSectionHeader>
                <button buiSidebarButton buiCollapsibleTrigger>
                  <span buiSidebarLabel class="grow-0">Workspace</span>
                  <mat-icon buiSidebarIcon class="size-4 group-data-[state=open]/bui-collapsible:rotate-90" svgIcon="chevron-right" />
                </button>
              </div>
              <ng-template buiCollapsiblePanel>
                <div buiSidebarSectionContent buiCollapsibleContent>
                  <ul buiSidebarMenu>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <mat-icon buiSidebarIcon svgIcon="box" />
                          <span buiSidebarLabel>Projects</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <mat-icon buiSidebarIcon svgIcon="contact" />
                          <span buiSidebarLabel>Teams</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <mat-icon buiSidebarIcon svgIcon="layers-2" />
                          <span buiSidebarLabel>Views</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <button buiSidebarButton [matMenuTriggerFor]="workspaceMoreMenu">
                          <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                          <span buiSidebarLabel>More</span>
                        </button>
                        <mat-menu xPosition="after" yPosition="below" #workspaceMoreMenu>
                          <button mat-menu-item>
                            <mat-icon svgIcon="users" />
                            Members
                          </button>
                          <button mat-menu-item>
                            <mat-icon svgIcon="milestone" />
                            Milestones
                          </button>
                          <mat-divider />
                          <button mat-menu-item>
                            <mat-icon svgIcon="panel-left-dashed" />
                            Customize Sidebar
                          </button>
                        </mat-menu>
                      </div>
                    </li>
                  </ul>
                </div>
              </ng-template>
            </div>

            <div buiSidebarSection buiCollapsible [expanded]="true">
              <div buiSidebarSectionHeader>
                <button buiSidebarButton buiCollapsibleTrigger>
                  <span buiSidebarLabel class="grow-0">Favorites</span>
                  <mat-icon buiSidebarIcon class="size-4 group-data-[state=open]/bui-collapsible:rotate-90" svgIcon="chevron-right" />
                </button>
                <button buiSidebarAction class="opacity-0 group-hover/bui-sidebar-section-header:opacity-100">
                  <mat-icon buiSidebarIcon svgIcon="folder-plus" />
                </button>
              </div>

              <ng-template buiCollapsiblePanel>
                <div buiSidebarSectionContent buiCollapsibleContent>
                  <ul buiSidebarMenu>
                    <li buiSidebarMenuItem buiCollapsible #collapsible="buiCollapsible">
                      <div buiSidebarMenuRow>
                        <button buiSidebarButton buiCollapsibleTrigger [class.active]="trigger.menuOpen">
                          <mat-icon buiSidebarIcon [svgIcon]="collapsible.expanded() ? 'folder-open' : 'folder'" />
                          <span buiSidebarLabel>Projects</span>
                        </button>
                        <button buiSidebarAction class="opacity-0 group-hover/bui-sidebar-menu-row:opacity-100" [class.opacity-100]="trigger.menuOpen" [attr.data-bui-sidebar-menu-item-active]="trigger.menuOpen ? true : null" [matMenuTriggerFor]="folderActions" #trigger="matMenuTrigger">
                          <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                          <mat-menu #folderActions>
                            <button mat-menu-item>
                              <mat-icon svgIcon="folder-pen" />
                              Rename
                            </button>
                            <mat-divider />
                            <button mat-menu-item>
                              <mat-icon svgIcon="x" />
                              Remove folder
                            </button>
                          </mat-menu>
                        </button>
                      </div>

                      <ng-template buiCollapsiblePanel>
                        <ul buiSidebarMenu buiCollapsibleContent>
                          <li buiSidebarMenuItem>
                            <div buiSidebarMenuRow>
                              <a buiSidebarButton>
                                <mat-icon buiSidebarIcon svgIcon="box" />
                                <span buiSidebarLabel>Spark</span>
                              </a>
                              <button buiSidebarAction class="opacity-0 group-hover/bui-sidebar-menu-row:opacity-100">
                                <mat-icon buiSidebarIcon svgIcon="x" />
                              </button>
                            </div>
                          </li>
                          <li buiSidebarMenuItem>
                            <div buiSidebarMenuRow>
                              <a buiSidebarButton>
                                <mat-icon buiSidebarIcon svgIcon="box" />
                                <span buiSidebarLabel>Horizon</span>
                              </a>
                              <button buiSidebarAction class="opacity-0 group-hover/bui-sidebar-menu-row:opacity-100">
                                <mat-icon buiSidebarIcon svgIcon="x" />
                              </button>
                            </div>
                          </li>
                          <li buiSidebarMenuItem>
                            <div buiSidebarMenuRow>
                              <a buiSidebarButton>
                                <mat-icon buiSidebarIcon svgIcon="box" />
                                <span buiSidebarLabel>Pulse</span>
                              </a>
                              <button buiSidebarAction class="opacity-0 group-hover/bui-sidebar-menu-row:opacity-100">
                                <mat-icon buiSidebarIcon svgIcon="x" />
                              </button>
                            </div>
                          </li>
                        </ul>
                      </ng-template>
                    </li>

                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <mat-icon buiSidebarIcon svgIcon="star" />
                          <span buiSidebarLabel>All issues</span>
                        </a>
                        <button buiSidebarAction class="opacity-0 group-hover/bui-sidebar-menu-row:opacity-100">
                          <mat-icon buiSidebarIcon svgIcon="x" />
                        </button>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <mat-icon buiSidebarIcon svgIcon="star" />
                          <span buiSidebarLabel>All tasks</span>
                        </a>
                        <button buiSidebarAction class="opacity-0 group-hover/bui-sidebar-menu-row:opacity-100">
                          <mat-icon buiSidebarIcon svgIcon="x" />
                        </button>
                      </div>
                    </li>
                  </ul>
                </div>
              </ng-template>
            </div>
          </div>

          <div buiSidebarDivider></div>

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
export class SidebarNavigationAuxiliaryActions {
  // Dependencies
  private readonly media = inject(Media);

  // State
  protected readonly isMobile = this.media.match(`(max-width: 767px)`);
}
