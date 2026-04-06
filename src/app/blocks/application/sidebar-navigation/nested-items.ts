import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Media } from '@/app/core/media';
import { BuiCollapsible, BuiCollapsibleContent, BuiCollapsiblePanel, BuiCollapsibleTrigger } from '@/app/ui/collapsible';
import { BuiSidebar, BuiSidebarAction, BuiSidebarBadge, BuiSidebarBody, BuiSidebarButton, BuiSidebarHeader, BuiSidebarIcon, BuiSidebarLabel, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSectionHeader, BuiSidebarSpacer } from '@/app/ui/sidebar';

@Component({
  selector: 'SidebarNavigationNestedItems',
  imports: [MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent, MatDivider, MatMenu, MatMenuItem, MatMenuTrigger, BuiSidebar, BuiSidebarHeader, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarButton, BuiSidebarMenuRow, BuiSidebarIcon, BuiSidebarLabel, BuiSidebarBody, BuiSidebarSection, BuiSidebarSectionHeader, BuiSidebarAction, BuiSidebarSectionContent, BuiSidebarSpacer, BuiCollapsible, BuiCollapsiblePanel, BuiCollapsibleTrigger, BuiCollapsibleContent, BuiSidebarBadge],
  template: `
    <mat-sidenav-container>
      <mat-sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" #sidenav>
        <!-- Sidebar -->
        <aside buiSidebar>
          <!-- Header -->
          <div buiSidebarHeader class="p-4 pb-2">
            <!-- Workspace selector -->
            <button class="flex w-full cursor-pointer items-center gap-x-2 rounded-md p-2 text-left hover:bg-neutral-a3" [matMenuTriggerFor]="userMenu">
              <img class="size-5 rounded object-cover" src="/images/photos/john-builder.jpg" alt="User avatar" />
              <div class="flex min-w-0 flex-auto flex-col font-semibold select-none">John's Workspace</div>
              <mat-icon class="size-4" svgIcon="chevrons-up-down" />
            </button>
            <mat-menu xPosition="before" yPosition="above" #userMenu>
              <button mat-menu-item>
                <img class="size-9 rounded-lg object-cover" src="/images/photos/john-builder.jpg" alt="User avatar" />
                <div class="ml-2 flex min-w-0 flex-auto flex-col select-none">
                  <div class="truncate text-lg font-medium">John's Workspace</div>
                  <div class="truncate text-sm text-neutral-a11">Free plan</div>
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

            <!-- Fixed menu -->
            <ul buiSidebarMenu class="mt-2">
              <li buiSidebarMenuItem>
                <div buiSidebarMenuRow>
                  <a buiSidebarButton>
                    <mat-icon buiSidebarIcon svgIcon="search" />
                    <span buiSidebarLabel>Search</span>
                  </a>
                </div>
              </li>
              <li buiSidebarMenuItem>
                <div buiSidebarMenuRow>
                  <a buiSidebarButton>
                    <mat-icon buiSidebarIcon svgIcon="house" />
                    <span buiSidebarLabel>Home</span>
                  </a>
                </div>
              </li>
              <li buiSidebarMenuItem>
                <div buiSidebarMenuRow>
                  <a buiSidebarButton>
                    <mat-icon buiSidebarIcon svgIcon="notebook-tabs" />
                    <span buiSidebarLabel>Meeting Notes</span>
                    <div buiSidebarBadge>New</div>
                  </a>
                </div>
              </li>
              <li buiSidebarMenuItem>
                <div buiSidebarMenuRow>
                  <a buiSidebarButton>
                    <mat-icon buiSidebarIcon svgIcon="sparkles" />
                    <span buiSidebarLabel>Ask AI</span>
                  </a>
                </div>
              </li>
              <li buiSidebarMenuItem>
                <div buiSidebarMenuRow>
                  <a buiSidebarButton>
                    <mat-icon buiSidebarIcon svgIcon="inbox" />
                    <span buiSidebarLabel>Inbox</span>
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <!-- Body -->
          <div buiSidebarBody class="pb-4">
            <div buiSidebarSection>
              <div buiSidebarSectionHeader>
                <button buiSidebarButton [class.active]="trigger.menuOpen ? true : null">
                  <span buiSidebarLabel>Spaces</span>
                </button>
                <button buiSidebarAction class="opacity-0 group-hover/bui-sidebar-section-header:opacity-100" [class.opacity-100]="trigger.menuOpen" [matMenuTriggerFor]="spacesMenu" #trigger="matMenuTrigger">
                  <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                  <mat-menu #spacesMenu>
                    <button mat-menu-item>
                      <mat-icon svgIcon="arrow-up" />
                      Move up
                    </button>
                    <button mat-menu-item>
                      <mat-icon svgIcon="arrow-down" />
                      Move down
                    </button>
                    <mat-divider />
                    <button mat-menu-item>
                      <mat-icon svgIcon="plus" />
                      New space
                    </button>
                  </mat-menu>
                </button>
              </div>
              <div buiSidebarSectionContent>
                <ul buiSidebarMenu>
                  <!-- Product -->
                  <li buiSidebarMenuItem buiCollapsible [expanded]="true" #collapsibleProduct="buiCollapsible">
                    <div buiSidebarMenuRow>
                      <button buiSidebarAction buiCollapsibleTrigger>
                        <mat-icon buiSidebarIcon svgIcon="chevron-right" class="hidden group-hover/bui-sidebar-menu-row:flex" [class.rotate-90]="collapsibleProduct.expanded()" />
                        <div class="flex size-5 items-center justify-center group-hover/bui-sidebar-menu-row:hidden">🧩</div>
                      </button>
                      <a buiSidebarButton>
                        <span buiSidebarLabel>Product</span>
                      </a>
                      <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                        <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                      </button>
                      <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                        <mat-icon buiSidebarIcon svgIcon="plus" />
                      </button>
                    </div>

                    <ng-template buiCollapsiblePanel>
                      <ul buiSidebarMenu buiCollapsibleContent>
                        <li buiSidebarMenuItem>
                          <div buiSidebarMenuRow>
                            <a buiSidebarButton>
                              <span buiSidebarLabel>
                                <span class="px-0.5">📄</span>
                                <span class="ml-1.5">Roadmap</span>
                              </span>
                            </a>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                            </button>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="plus" />
                            </button>
                          </div>
                        </li>
                        <li buiSidebarMenuItem>
                          <div buiSidebarMenuRow>
                            <a buiSidebarButton>
                              <span buiSidebarLabel>
                                <span class="px-0.5">📊</span>
                                <span class="ml-1.5">Analytics</span>
                              </span>
                            </a>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                            </button>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="plus" />
                            </button>
                          </div>
                        </li>
                        <li buiSidebarMenuItem>
                          <div buiSidebarMenuRow>
                            <a buiSidebarButton>
                              <span buiSidebarLabel>
                                <span class="px-0.5">📁</span>
                                <span class="ml-1.5">Release Notes</span>
                              </span>
                            </a>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                            </button>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="plus" />
                            </button>
                          </div>
                        </li>

                        <!-- Features -->
                        <li buiSidebarMenuItem buiCollapsible #collapsibleFeatures="buiCollapsible">
                          <div buiSidebarMenuRow>
                            <button buiSidebarAction buiCollapsibleTrigger>
                              <mat-icon buiSidebarIcon svgIcon="chevron-right" class="hidden group-hover/bui-sidebar-menu-row:flex" [class.rotate-90]="collapsibleFeatures.expanded()" />
                              <div class="flex size-5 items-center justify-center group-hover/bui-sidebar-menu-row:hidden">📁</div>
                            </button>
                            <a buiSidebarButton>
                              <span buiSidebarLabel>Features</span>
                            </a>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                            </button>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="plus" />
                            </button>
                          </div>

                          <ng-template buiCollapsiblePanel>
                            <ul buiSidebarMenu buiCollapsibleContent>
                              <li buiSidebarMenuItem>
                                <div buiSidebarMenuRow>
                                  <a buiSidebarButton>
                                    <span buiSidebarLabel>
                                      <span class="px-0.5">🧪</span>
                                      <span class="ml-1.5">Experiments</span>
                                    </span>
                                  </a>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                                  </button>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="plus" />
                                  </button>
                                </div>
                              </li>
                              <li buiSidebarMenuItem>
                                <div buiSidebarMenuRow>
                                  <a buiSidebarButton>
                                    <span buiSidebarLabel>
                                      <span class="px-0.5">🚀</span>
                                      <span class="ml-1.5">Launch Prep</span>
                                    </span>
                                  </a>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                                  </button>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="plus" />
                                  </button>
                                </div>
                              </li>
                              <li buiSidebarMenuItem>
                                <div buiSidebarMenuRow>
                                  <a buiSidebarButton>
                                    <span buiSidebarLabel>
                                      <span class="px-0.5">📌</span>
                                      <span class="ml-1.5">Backlog</span>
                                    </span>
                                  </a>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                                  </button>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="plus" />
                                  </button>
                                </div>
                              </li>
                            </ul>
                          </ng-template>
                        </li>
                      </ul>
                    </ng-template>
                  </li>

                  <!-- Design -->
                  <li buiSidebarMenuItem buiCollapsible #collapsibleDesign="buiCollapsible">
                    <div buiSidebarMenuRow>
                      <button buiSidebarAction buiCollapsibleTrigger>
                        <mat-icon buiSidebarIcon svgIcon="chevron-right" class="hidden group-hover/bui-sidebar-menu-row:flex" [class.rotate-90]="collapsibleDesign.expanded()" />
                        <div class="flex size-5 items-center justify-center group-hover/bui-sidebar-menu-row:hidden">🎨</div>
                      </button>
                      <a buiSidebarButton>
                        <span buiSidebarLabel>Design</span>
                      </a>
                      <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                        <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                      </button>
                      <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                        <mat-icon buiSidebarIcon svgIcon="plus" />
                      </button>
                    </div>

                    <ng-template buiCollapsiblePanel>
                      <ul buiSidebarMenu buiCollapsibleContent>
                        <li buiSidebarMenuItem>
                          <div buiSidebarMenuRow>
                            <a buiSidebarButton>
                              <span buiSidebarLabel>
                                <span class="px-0.5">🎨</span>
                                <span class="ml-1.5">Design System</span>
                              </span>
                            </a>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                            </button>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="plus" />
                            </button>
                          </div>
                        </li>
                        <li buiSidebarMenuItem>
                          <div buiSidebarMenuRow>
                            <a buiSidebarButton>
                              <span buiSidebarLabel>
                                <span class="px-0.5">🖼️</span>
                                <span class="ml-1.5">Assets</span>
                              </span>
                            </a>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                            </button>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="plus" />
                            </button>
                          </div>
                        </li>
                        <li buiSidebarMenuItem buiCollapsible #collapsibleComponents="buiCollapsible">
                          <div buiSidebarMenuRow>
                            <button buiSidebarAction buiCollapsibleTrigger>
                              <mat-icon buiSidebarIcon svgIcon="chevron-right" class="hidden group-hover/bui-sidebar-menu-row:flex" [class.rotate-90]="collapsibleComponents.expanded()" />
                              <div class="flex size-5 items-center justify-center group-hover/bui-sidebar-menu-row:hidden">🧵</div>
                            </button>
                            <a buiSidebarButton>
                              <span buiSidebarLabel>Components</span>
                            </a>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                            </button>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="plus" />
                            </button>
                          </div>

                          <ng-template buiCollapsiblePanel>
                            <ul buiSidebarMenu buiCollapsibleContent>
                              <li buiSidebarMenuItem>
                                <div buiSidebarMenuRow>
                                  <a buiSidebarButton>
                                    <span buiSidebarLabel>
                                      <span class="px-0.5">🔤</span>
                                      <span class="ml-1.5">Typography</span>
                                    </span>
                                  </a>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                                  </button>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="plus" />
                                  </button>
                                </div>
                              </li>
                              <li buiSidebarMenuItem>
                                <div buiSidebarMenuRow>
                                  <a buiSidebarButton>
                                    <span buiSidebarLabel>
                                      <span class="px-0.5">🎛️</span>
                                      <span class="ml-1.5">UI Patterns</span>
                                    </span>
                                  </a>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                                  </button>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="plus" />
                                  </button>
                                </div>
                              </li>
                              <li buiSidebarMenuItem>
                                <div buiSidebarMenuRow>
                                  <a buiSidebarButton>
                                    <span buiSidebarLabel>
                                      <span class="px-0.5">🌈</span>
                                      <span class="ml-1.5">Colors</span>
                                    </span>
                                  </a>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                                  </button>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="plus" />
                                  </button>
                                </div>
                              </li>
                            </ul>
                          </ng-template>
                        </li>
                      </ul>
                    </ng-template>
                  </li>

                  <!-- Engineering -->
                  <li buiSidebarMenuItem buiCollapsible #collapsibleEngineering="buiCollapsible">
                    <div buiSidebarMenuRow>
                      <button buiSidebarAction buiCollapsibleTrigger>
                        <mat-icon buiSidebarIcon svgIcon="chevron-right" class="hidden group-hover/bui-sidebar-menu-row:flex" [class.rotate-90]="collapsibleEngineering.expanded()" />
                        <div class="flex size-5 items-center justify-center group-hover/bui-sidebar-menu-row:hidden">🧪</div>
                      </button>
                      <a buiSidebarButton>
                        <span buiSidebarLabel>Engineering</span>
                      </a>
                      <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                        <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                      </button>
                      <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                        <mat-icon buiSidebarIcon svgIcon="plus" />
                      </button>
                    </div>

                    <ng-template buiCollapsiblePanel>
                      <ul buiSidebarMenu buiCollapsibleContent>
                        <li buiSidebarMenuItem>
                          <div buiSidebarMenuRow>
                            <a buiSidebarButton>
                              <span buiSidebarLabel>
                                <span class="px-0.5">📘</span>
                                <span class="ml-1.5">Documentation</span>
                              </span>
                            </a>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                            </button>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="plus" />
                            </button>
                          </div>
                        </li>
                        <li buiSidebarMenuItem>
                          <div buiSidebarMenuRow>
                            <a buiSidebarButton>
                              <span buiSidebarLabel>
                                <span class="px-0.5">🧱</span>
                                <span class="ml-1.5">Architecture</span>
                              </span>
                            </a>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                            </button>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="plus" />
                            </button>
                          </div>
                        </li>
                        <li buiSidebarMenuItem buiCollapsible #collapsibleAPI="buiCollapsible">
                          <div buiSidebarMenuRow>
                            <button buiSidebarAction buiCollapsibleTrigger>
                              <mat-icon buiSidebarIcon svgIcon="chevron-right" class="hidden group-hover/bui-sidebar-menu-row:flex" [class.rotate-90]="collapsibleAPI.expanded()" />
                              <div class="flex size-5 items-center justify-center group-hover/bui-sidebar-menu-row:hidden">⚙️</div>
                            </button>
                            <a buiSidebarButton>
                              <span buiSidebarLabel>API</span>
                            </a>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                            </button>
                            <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                              <mat-icon buiSidebarIcon svgIcon="plus" />
                            </button>
                          </div>

                          <ng-template buiCollapsiblePanel>
                            <ul buiSidebarMenu buiCollapsibleContent>
                              <li buiSidebarMenuItem>
                                <div buiSidebarMenuRow>
                                  <a buiSidebarButton>
                                    <span buiSidebarLabel>
                                      <span class="px-0.5">🔐</span>
                                      <span class="ml-1.5">Auth</span>
                                    </span>
                                  </a>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                                  </button>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="plus" />
                                  </button>
                                </div>
                              </li>
                              <li buiSidebarMenuItem>
                                <div buiSidebarMenuRow>
                                  <a buiSidebarButton>
                                    <span buiSidebarLabel>
                                      <span class="px-0.5">🧰</span>
                                      <span class="ml-1.5">Helpers</span>
                                    </span>
                                  </a>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                                  </button>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="plus" />
                                  </button>
                                </div>
                              </li>
                              <li buiSidebarMenuItem>
                                <div buiSidebarMenuRow>
                                  <a buiSidebarButton>
                                    <span buiSidebarLabel>
                                      <span class="px-0.5">💾</span>
                                      <span class="ml-1.5">Storage</span>
                                    </span>
                                  </a>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="ellipsis" />
                                  </button>
                                  <button buiSidebarAction class="hidden group-hover/bui-sidebar-menu-row:flex">
                                    <mat-icon buiSidebarIcon svgIcon="plus" />
                                  </button>
                                </div>
                              </li>
                            </ul>
                          </ng-template>
                        </li>
                      </ul>
                    </ng-template>
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
                        <mat-icon buiSidebarIcon svgIcon="settings" />
                        <span buiSidebarLabel>Settings</span>
                      </button>
                    </div>
                  </li>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <button buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="store" />
                        <span buiSidebarLabel>Marketplace</span>
                      </button>
                    </div>
                  </li>
                  <li buiSidebarMenuItem>
                    <div buiSidebarMenuRow>
                      <button buiSidebarButton>
                        <mat-icon buiSidebarIcon svgIcon="trash" />
                        <span buiSidebarLabel>Trash</span>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
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
export class SidebarNavigationNestedItems {
  // Dependencies
  private readonly media = inject(Media);

  // State
  protected readonly isMobile = this.media.match(`(max-width: 767px)`);
}
