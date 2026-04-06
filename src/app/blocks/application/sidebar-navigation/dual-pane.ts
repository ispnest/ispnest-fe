import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatPrefix } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatTooltip } from '@angular/material/tooltip';
import { Media } from '@/app/core/media';
import { BuiSidebar, BuiSidebarBody, BuiSidebarButton, BuiSidebarDivider, BuiSidebarFooter, BuiSidebarHeader, BuiSidebarIcon, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSpacer } from '@/app/ui/sidebar';

@Component({
  selector: 'SidebarNavigationDualPane',
  imports: [MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent, MatDivider, MatMenu, MatMenuItem, MatMenuTrigger, MatTooltip, MatFormField, MatInput, MatPrefix, BuiSidebar, BuiSidebarHeader, BuiSidebarBody, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarMenu, BuiSidebarMenuItem, BuiSidebarMenuRow, BuiSidebarButton, BuiSidebarIcon, BuiSidebarSpacer, BuiSidebarFooter, BuiSidebarDivider],
  template: `
    <mat-sidenav-container>
      <mat-sidenav class="w-87" [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" #sidenav>
        <!-- Sidebar #1 -->
        <aside buiSidebar class="w-12 border-r">
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

        <!-- Sidebar #2 -->
        <aside buiSidebar class="w-75">
          <!-- Header -->
          <div buiSidebarHeader class="border-b px-4 py-6">
            <div class="text-xl font-medium">Inbox</div>
            <mat-form-field class="mt-4 w-full">
              <mat-icon svgIcon="search" matIconPrefix />
              <input matInput placeholder="Type to search" />
            </mat-form-field>
          </div>

          <!-- Body -->
          <div buiSidebarBody class="p-0">
            <div buiSidebarSection class="p-0">
              <div buiSidebarSectionContent class="m-0 gap-y-0">
                @for (mail of inbox; track $index) {
                  <a class="flex cursor-pointer flex-col p-4 hover:bg-neutral-a3">
                    <div class="flex items-center justify-between gap-x-2">
                      <div class="text-neutral-a11">{{ mail.from }}</div>
                      <div class="text-sm whitespace-nowrap text-neutral-a11">{{ mail.date }}</div>
                    </div>
                    <div class="mt-2 text-lg font-semibold">{{ mail.subject }}</div>
                    <div class="mt-1.5 line-clamp-2 text-neutral-a11">{{ mail.preview }}</div>
                  </a>
                  <div buiSidebarDivider></div>
                }
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
export class SidebarNavigationDualPane {
  // Dependencies
  private readonly media = inject(Media);

  // State
  protected readonly isMobile = this.media.match(`(max-width: 767px)`);
  protected inbox = [
    {
      from: 'Laura Kim',
      subject: 'Re: Project kickoff',
      preview: 'Sounds good to me, I can join the call tomorrow if needed.',
      date: '2h ago',
    },
    {
      from: 'Daniel Moore',
      subject: 'Invoice for November',
      preview: 'Attached is the updated invoice. Let me know if you need any changes.',
      date: '6h ago',
    },
    {
      from: 'Sophie Park',
      subject: 'Meeting notes',
      preview: 'Here’s a quick summary of what we discussed earlier today.',
      date: '12h ago',
    },
    {
      from: 'Michael Stone',
      subject: 'Welcome to the beta',
      preview: "You're in. Here are the instructions to get started with the beta program.",
      date: '1d ago',
    },
    {
      from: 'Alex Rivera',
      subject: 'Design feedback',
      preview: 'The latest iteration looks great. I left some comments on the sidebar layout.',
      date: '1d ago',
    },
    {
      from: 'Emily Chen',
      subject: 'Weekly report',
      preview: 'Attaching the weekly report. The metrics improved significantly.',
      date: '2d ago',
    },
    {
      from: 'Jason Hall',
      subject: 'New access request',
      preview: 'Can you grant API access to the new developer joining next week?',
      date: '3d ago',
    },
    {
      from: 'Rachel Davis',
      subject: 'Figma assets',
      preview: 'All icons are exported in the correct sizes now.',
      date: '4d ago',
    },
    {
      from: 'Tom Bradley',
      subject: 'Quick question',
      preview: 'Do we still need the old environment variables for the dev build?',
      date: '5d ago',
    },
    {
      from: 'Hannah Lee',
      subject: 'Team dinner',
      preview: 'We are planning a dinner this Friday. Are you able to join?',
      date: '6d ago',
    },
  ];
}
