import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { BookingApiService } from '@/app/domains/real-estate/data/booking-api.service';
import { BookingDto } from '@/app/domains/real-estate/data/booking.model';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCard,
    MatPaginator,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatButtonToggleModule,
    MatIcon,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatTable,
    MatColumnDef,
    MatCellDef,
    MatCell,
    MatRow,
    MatRowDef,
    LoadingComponent,
    StatusBadgeComponent,
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">Bookings</h1>
          <p class="mt-1 text-neutral-a11">{{ totalElements() }} total bookings</p>
        </div>
        <div class="flex items-center gap-3">
          <mat-button-toggle-group value="list" (change)="onViewChange($event.value)">
            <mat-button-toggle value="list">
              <mat-icon svgIcon="list" />
              List
            </mat-button-toggle>
            <mat-button-toggle value="calendar">
              <mat-icon svgIcon="calendar" />
              Calendar
            </mat-button-toggle>
          </mat-button-toggle-group>
          @if (auth.hasPermission('BOOKINGS_WRITE')) {
            <a matButton class="primary" routerLink="/admin/real-estate/bookings/new">
              <mat-icon svgIcon="calendar-plus" />
              New Booking
            </a>
          }
        </div>
      </div>

      <mat-card>
        <!-- Filters -->
        <div class="flex flex-wrap items-end gap-3 border-b border-neutral-a4 p-4">
          <mat-form-field class="w-48" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (selectionChange)="resetAndLoad()">
              <mat-option value="">All statuses</mat-option>
              <mat-option value="PENDING">Pending</mat-option>
              <mat-option value="CONFIRMED">Confirmed</mat-option>
              <mat-option value="CHECKED_IN">Checked In</mat-option>
              <mat-option value="CHECKED_OUT">Checked Out</mat-option>
              <mat-option value="CANCELLED">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <app-loading [loading]="loading()" />

        <div class="relative isolate overflow-x-visible overflow-y-hidden">
          <table
            mat-table
            [dataSource]="bookings()"
            class="w-full [--table-body-row-height:auto] [--table-cell-padding-x:--spacing(4)] sm:[--table-cell-padding-x:--spacing(5)]"
          >
            <ng-container matColumnDef="booking">
              <td mat-cell *matCellDef="let b">
                <div class="flex items-start gap-3 py-3 sm:gap-4">
                  <div
                    class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-a3 text-primary-a11"
                  >
                    <mat-icon svgIcon="calendar" class="size-4" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">{{ b.propertyName }}</p>
                    <div
                      class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-a11"
                    >
                      <span>{{ b.guestName }}</span>
                      <span>·</span>
                      <span>{{ b.checkInDate }} – {{ b.checkOutDate }}</span>
                    </div>

                    <div class="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <app-status-badge [status]="b.status" />
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <td mat-cell *matCellDef="let b">
                <div class="flex shrink-0 items-start">
                  <button
                    matIconButton
                    [matMenuTriggerFor]="actionMenu"
                    [matMenuTriggerData]="{ booking: b }"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon svgIcon="ellipsis-vertical" />
                  </button>
                </div>
              </td>
            </ng-container>

            <tr
              mat-row
              *matRowDef="let b; columns: cols"
              class="group relative cursor-pointer hover:bg-neutral-a2"
              (click)="goToBooking(b)"
            ></tr>
          </table>
          @if (bookings().length === 0 && !loading()) {
            <div class="flex flex-col items-center gap-2 p-12 text-center text-neutral-a9">
              <mat-icon svgIcon="calendar" class="size-10 text-neutral-a6" />
              <div class="font-medium">No bookings found</div>
              <div class="text-sm">Try adjusting your filters</div>
            </div>
          }
        </div>
        <mat-paginator
          class="px-3"
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons
        />
      </mat-card>
    </div>

    <mat-menu #actionMenu="matMenu">
      <ng-template matMenuContent let-booking="booking">
        <a mat-menu-item [routerLink]="['/admin/real-estate/bookings', booking.id]">
          <mat-icon svgIcon="eye" />
          View
        </a>
        @if (booking.status === 'PENDING' && auth.hasPermission('BOOKINGS_WRITE')) {
          <a mat-menu-item [routerLink]="['/admin/real-estate/bookings', booking.id, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
        }
      </ng-template>
    </mat-menu>
  `,
})
export class BookingsListComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly bookingApi = inject(BookingApiService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly bookings = signal<BookingDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['booking', 'actions'];

  statusFilter = '';
  pageIndex = 0;
  pageSize = 20;

  goToBooking(booking: BookingDto): void {
    this.router.navigate(['/admin/real-estate/bookings', booking.id]);
  }

  onViewChange(view: string): void {
    if (view === 'calendar') {
      this.router.navigate(['/admin/real-estate/bookings/calendar']);
    }
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.bookingApi
      .getPage(this.pageIndex, this.pageSize, 'checkInDate,desc', this.statusFilter)
      .subscribe({
        next: (page) => {
          this.bookings.set(page.content);
          this.totalElements.set(page.page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  resetAndLoad(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }
}
