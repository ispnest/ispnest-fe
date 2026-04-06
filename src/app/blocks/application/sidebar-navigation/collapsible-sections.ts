import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatPrefix } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Media } from '@/app/core/media';
import { BuiCollapsible, BuiCollapsibleContent, BuiCollapsiblePanel, BuiCollapsibleTrigger } from '@/app/ui/collapsible';
import { BuiSidebar, BuiSidebarBody, BuiSidebarButton, BuiSidebarHeader, BuiSidebarIcon, BuiSidebarLabel, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSectionHeader } from '@/app/ui/sidebar';

@Component({
  selector: 'SidebarNavigationCollapsibleSections',
  imports: [MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent, MatDivider, MatMenu, MatMenuItem, MatMenuTrigger, MatFormField, MatInput, MatPrefix, BuiSidebar, BuiSidebarHeader, BuiSidebarBody, BuiCollapsible, BuiSidebarSection, BuiSidebarSectionHeader, BuiSidebarButton, BuiCollapsibleTrigger, BuiCollapsiblePanel, BuiSidebarSectionContent, BuiCollapsibleContent, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow, BuiSidebarLabel, BuiSidebarIcon],
  template: `
    <mat-sidenav-container>
      <mat-sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" #sidenav>
        <!-- Sidebar -->
        <aside buiSidebar>
          <!-- Header -->
          <div buiSidebarHeader class="p-4 pb-0">
            <!-- Version selector -->
            <button class="flex w-full cursor-pointer items-center gap-x-3 rounded-lg p-2 text-left hover:bg-neutral-a3" [matMenuTriggerFor]="versionsMenu">
              <img class="size-7" src="/images/logo/logomark.svg" alt="Logomark" />
              <div class="flex min-w-0 flex-auto flex-col select-none">
                <div class="truncate text-lg font-medium">Documentation</div>
                <div class="truncate font-mono text-sm text-neutral-a11">v21.0.0</div>
              </div>
              <mat-icon buiSidebarIcon svgIcon="chevrons-up-down" />
            </button>
            <mat-menu xPosition="before" yPosition="above" #versionsMenu>
              <button mat-menu-item class="flex-row-reverse tabular-nums">
                <mat-icon buiSidebarIcon svgIcon="check" />
                v21.0.0
              </button>
              <button mat-menu-item class="flex-row-reverse tabular-nums">v20.3.14</button>
              <button mat-menu-item class="flex-row-reverse tabular-nums">v19.2.16</button>
              <button mat-menu-item class="flex-row-reverse tabular-nums">v18.2.14</button>
              <mat-divider />
              <button mat-menu-item>
                <mat-icon buiSidebarIcon svgIcon="external-link" />
                Older versions
              </button>
            </mat-menu>

            <!-- Search -->
            <div class="p-2">
              <mat-form-field class="w-full">
                <input matInput placeholder="Search docs" />
                <mat-icon buiSidebarIcon svgIcon="search" matIconPrefix />
              </mat-form-field>
            </div>
          </div>

          <!-- Body -->
          <div buiSidebarBody>
            <div buiSidebarSection buiCollapsible [expanded]="true">
              <div buiSidebarSectionHeader>
                <button buiSidebarButton buiCollapsibleTrigger>
                  <span buiSidebarLabel>Introduction</span>
                  <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                </button>
              </div>
              <ng-template buiCollapsiblePanel>
                <div buiSidebarSectionContent buiCollapsibleContent>
                  <ul buiSidebarMenu>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>What is Angular?</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Installation</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Essentials</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel class="grow-0">Start coding!</span>
                          <mat-icon buiSidebarIcon svgIcon="rocket" />
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </ng-template>
            </div>

            <div buiSidebarSection buiCollapsible [expanded]="true">
              <div buiSidebarSectionHeader>
                <button buiSidebarButton buiCollapsibleTrigger>
                  <span buiSidebarLabel>In-depth Guides</span>
                  <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                </button>
              </div>
              <ng-template buiCollapsiblePanel>
                <div buiSidebarSectionContent buiCollapsibleContent>
                  <ul buiSidebarMenu>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton class="active">
                          <span buiSidebarLabel>Signals</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Components</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Templates</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Directives</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Dependency Injection</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Routing</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Forms</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>HTTP Client</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Server-side & Hybrid-rendering</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Testing</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Angular Aria</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Internationalization</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Animations</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Drag and drop</span>
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </ng-template>
            </div>

            <div buiSidebarSection buiCollapsible [expanded]="true">
              <div buiSidebarSectionHeader>
                <button buiSidebarButton buiCollapsibleTrigger>
                  <span buiSidebarLabel>Build with AI</span>
                  <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                </button>
              </div>
              <ng-template buiCollapsiblePanel>
                <div buiSidebarSectionContent buiCollapsibleContent>
                  <ul buiSidebarMenu>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Get Started</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>LLM prompts and AI IDE setup</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Design Patterns</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Angular CLI MCP Server setup</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Angular AI Tutor</span>
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </ng-template>
            </div>

            <div buiSidebarSection buiCollapsible [expanded]="true">
              <div buiSidebarSectionHeader>
                <button buiSidebarButton buiCollapsibleTrigger>
                  <span buiSidebarLabel>Developer Tools</span>
                  <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                </button>
              </div>
              <ng-template buiCollapsiblePanel>
                <div buiSidebarSectionContent buiCollapsibleContent>
                  <ul buiSidebarMenu>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Angular CLI</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Libraries</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>DevTools</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Language Service</span>
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </ng-template>
            </div>

            <div buiSidebarSection buiCollapsible [expanded]="true">
              <div buiSidebarSectionHeader>
                <button buiSidebarButton buiCollapsibleTrigger>
                  <span buiSidebarLabel>Best Practices</span>
                  <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                </button>
              </div>
              <ng-template buiCollapsiblePanel>
                <div buiSidebarSectionContent buiCollapsibleContent>
                  <ul buiSidebarMenu>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Style Guide</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Security</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Accessibility</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Unhandled errors in Angular</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Performance</span>
                        </a>
                      </div>
                    </li>
                    <li buiSidebarMenuItem>
                      <div buiSidebarMenuRow>
                        <a buiSidebarButton>
                          <span buiSidebarLabel>Keeping up-to-date</span>
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </ng-template>
            </div>
          </div>
        </aside>
      </mat-sidenav>

      <mat-sidenav-content>
        <!-- Toolbar -->
        <div class="flex items-center gap-x-4 border-b p-4">
          <button matIconButton (click)="sidenav.toggle()">
            <mat-icon buiSidebarIcon svgIcon="panel-left" />
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
export class SidebarNavigationCollapsibleSections {
  // Dependencies
  private readonly media = inject(Media);

  // State
  protected readonly isMobile = this.media.match(`(max-width: 767px)`);
}
