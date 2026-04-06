import { Component, inject, model, OnDestroy, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatDivider, MatListOption, MatSelectionList } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { startWith, Subject, takeUntil } from 'rxjs';
import { Media } from '@/app/core/media';
import { BuiCollapsible, BuiCollapsibleContent, BuiCollapsiblePanel, BuiCollapsibleTrigger } from '@/app/ui/collapsible';
import { BuiSidebar, BuiSidebarAction, BuiSidebarBody, BuiSidebarButton, BuiSidebarDivider, BuiSidebarFooter, BuiSidebarHeader, BuiSidebarIcon, BuiSidebarLabel, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSectionHeader } from '@/app/ui/sidebar';

@Component({
  selector: 'SidebarPanelCalendar',
  imports: [MatIcon, MatIconButton, MatSidenav, MatSidenavContainer, MatSidenavContent, MatDivider, MatMenu, MatMenuItem, MatMenuTrigger, MatCalendar, MatSelectionList, MatListOption, BuiSidebar, BuiSidebarHeader, BuiSidebarDivider, BuiSidebarBody, BuiSidebarSection, BuiSidebarSectionContent, BuiSidebarSectionHeader, BuiCollapsible, BuiCollapsibleTrigger, BuiCollapsiblePanel, BuiCollapsibleContent, BuiSidebarLabel, BuiSidebarIcon, BuiSidebarAction, BuiSidebarButton, BuiSidebarFooter],
  template: `
    <mat-sidenav-container>
      <mat-sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" #sidenav>
        <!-- Sidebar -->
        <div buiSidebar>
          <!-- Header -->
          <div buiSidebarHeader class="py-4.5">
            <div class="flex items-center">
              <img class="-ml-0.5 size-7" src="/images/logo/logomark.svg" alt="Logomark" />
              <div class="ml-3 text-2xl font-bold">Acme</div>
            </div>
          </div>

          <div buiSidebarDivider></div>

          <!-- Body -->
          <div buiSidebarBody>
            <div buiSidebarSection>
              <div buiSidebarSectionContent>
                <mat-calendar [headerComponent]="CalendarHeaderComponent" [(selected)]="selectedDate" ngSkipHydration></mat-calendar>
              </div>
            </div>

            <mat-divider class="-mx-2" />

            <div buiCollapsible [expanded]="true">
              <div buiSidebarSection>
                <div buiSidebarSectionHeader>
                  <button buiSidebarButton buiCollapsibleTrigger>
                    <span buiSidebarLabel class="grow-0">My Calendars</span>
                    <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                  </button>
                  <button buiSidebarAction>
                    <mat-icon buiSidebarIcon svgIcon="plus" />
                  </button>
                </div>
                <ng-template buiCollapsiblePanel>
                  <div buiCollapsibleContent>
                    <div buiSidebarSectionContent>
                      <mat-selection-list multiple>
                        <mat-list-option togglePosition="before" selected>Personal</mat-list-option>
                        <mat-list-option togglePosition="before" selected>Kids</mat-list-option>
                        <mat-list-option togglePosition="before">Family</mat-list-option>
                      </mat-selection-list>
                    </div>
                  </div>
                </ng-template>
              </div>
            </div>

            <div buiCollapsible>
              <div buiSidebarSection>
                <div buiSidebarSectionHeader>
                  <button buiSidebarButton buiCollapsibleTrigger>
                    <span buiSidebarLabel class="grow-0">Other</span>
                    <mat-icon buiSidebarIcon svgIcon="chevron-right" class="group-data-[state=open]/bui-collapsible:rotate-90" />
                  </button>
                </div>
                <ng-template buiCollapsiblePanel>
                  <div buiCollapsibleContent>
                    <div buiSidebarSectionContent>
                      <mat-selection-list multiple>
                        <mat-list-option togglePosition="before" selected>Birthdays</mat-list-option>
                        <mat-list-option togglePosition="before">Reminders</mat-list-option>
                        <mat-list-option togglePosition="before">Holidays</mat-list-option>
                      </mat-selection-list>
                    </div>
                  </div>
                </ng-template>
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
        </div>
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
export class SidebarPanelCalendar {
  // Dependencies
  protected readonly CalendarHeaderComponent = CalendarHeaderComponent;
  private readonly media = inject(Media);

  // State
  protected readonly isMobile = this.media.match(`(max-width: 767px)`);
  protected readonly selectedDate = model<Date | null>(null);
}

@Component({
  selector: 'CalendarHeaderComponent',
  imports: [MatIconButton, MatIcon],
  template: `
    <div class="mb-4 flex items-center gap-x-2">
      <button matIconButton class="small" (click)="previousClicked('month')">
        <mat-icon svgIcon="chevron-left" />
      </button>
      <span class="flex-auto text-center font-semibold">{{ periodLabel() }}</span>
      <button matIconButton class="small" (click)="nextClicked('month')">
        <mat-icon svgIcon="chevron-right" />
      </button>
    </div>
  `,
})
export class CalendarHeaderComponent<D> implements OnDestroy {
  // Dependencies
  private readonly calendar = inject<MatCalendar<D>>(MatCalendar);
  private readonly dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  private readonly dateFormats = inject(MAT_DATE_FORMATS);

  // State
  private destroyed = new Subject<void>();
  protected readonly periodLabel = signal('');

  constructor() {
    this.calendar.stateChanges.pipe(startWith(null), takeUntil(this.destroyed)).subscribe(() => {
      this.periodLabel.set(this.dateAdapter.format(this.calendar.activeDate, this.dateFormats.display.monthYearLabel).toLocaleUpperCase());
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  previousClicked(mode: 'month' | 'year') {
    this.calendar.activeDate = mode === 'month' ? this.dateAdapter.addCalendarMonths(this.calendar.activeDate, -1) : this.dateAdapter.addCalendarYears(this.calendar.activeDate, -1);
  }

  nextClicked(mode: 'month' | 'year') {
    this.calendar.activeDate = mode === 'month' ? this.dateAdapter.addCalendarMonths(this.calendar.activeDate, 1) : this.dateAdapter.addCalendarYears(this.calendar.activeDate, 1);
  }
}
