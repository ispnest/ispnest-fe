import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { BookingApiService } from '@/app/domains/real-estate/data/booking-api.service';
import { BookingDto } from '@/app/domains/real-estate/data/booking.model';
import { GuestApiService } from '@/app/domains/real-estate/data/guest-api.service';
import { GuestDto } from '@/app/domains/real-estate/data/guest.model';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-guests-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    DatePipe,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTabGroup,
    MatTab,
    MatTabContent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    StatusBadgeComponent,
    LoadingComponent,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-6xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/real-estate/guests">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-a3">
          <mat-icon svgIcon="user-round" class="size-7 text-accent-a11" />
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-2xl font-semibold tracking-tight">{{ guest()?.fullName }}</h1>
          <p class="mt-0.5 flex flex-wrap items-center gap-x-1 text-sm text-neutral-a11">
            @if (guest()?.email) {
              <span class="break-all">{{ guest()?.email }}</span>
            }
            @if (guest()?.email && guest()?.phoneNumber) {
              <span>·</span>
            }
            <span>{{ guest()?.phoneNumber }}</span>
          </p>
        </div>
        @if (guest()) {
          <app-status-badge [status]="guest()!.status" />
        }
        @if (auth.hasPermission('GUESTS_WRITE')) {
          <a class="primary" matButton [routerLink]="['/admin/real-estate/guests', guestId, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
        }
      </div>

      <app-loading [loading]="loading()" />

      @if (guest() && !loading()) {
        @let g = guest()!;

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
                >
                  <mat-icon svgIcon="id-card" class="size-4 text-primary-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Guest Info
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">ID Number</dt>
                  <dd class="font-medium">{{ g.idNumber || '—' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Created</dt>
                  <dd class="font-medium">{{ g.createdAt | date: 'mediumDate' }}</dd>
                </div>
                @if (g.notes) {
                  <div class="pt-1 text-neutral-a11">{{ g.notes }}</div>
                }
              </dl>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group dynamicHeight>
            <mat-tab label="Bookings">
              <ng-template matTabContent>
                <div class="flex flex-col">
                  <app-loading [loading]="loadingBookings()" />
                  <div class="relative isolate overflow-x-visible overflow-y-hidden">
                    <table
                      class="-mt-px whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                      mat-table
                      [dataSource]="bookings()"
                    >
                      <ng-container matColumnDef="property">
                        <th mat-header-cell *matHeaderCellDef>Property</th>
                        <td mat-cell *matCellDef="let b">
                          <a
                            [routerLink]="['/admin/real-estate/properties', b.propertyId]"
                            class="font-medium text-primary-a11 hover:underline"
                            >{{ b.propertyName }}</a
                          >
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="dates">
                        <th mat-header-cell *matHeaderCellDef>Dates</th>
                        <td mat-cell *matCellDef="let b">{{ b.checkInDate }} – {{ b.checkOutDate }}</td>
                      </ng-container>
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Status</th>
                        <td mat-cell *matCellDef="let b">
                          <app-status-badge [status]="b.status" />
                        </td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="bookingCols"></tr>
                      <tr
                        class="group relative cursor-pointer hover:bg-neutral-a2"
                        mat-row
                        *matRowDef="let b; columns: bookingCols"
                        [routerLink]="['/admin/real-estate/bookings', b.id]"
                      ></tr>
                    </table>
                    @if (bookings().length === 0 && !loadingBookings()) {
                      <p class="py-8 text-center text-sm text-neutral-a9">No bookings yet</p>
                    }
                  </div>
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      }
    </div>
  `,
})
export class GuestsDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly guestApi = inject(GuestApiService);
  private readonly bookingApi = inject(BookingApiService);

  readonly loading = signal(true);
  readonly guest = signal<GuestDto | null>(null);
  readonly loadingBookings = signal(true);
  readonly bookings = signal<BookingDto[]>([]);
  readonly bookingCols = ['property', 'dates', 'status'];

  guestId = '';

  ngOnInit(): void {
    this.guestId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.guestApi.getById(this.guestId).subscribe({
      next: (g) => {
        this.guest.set(g);
        this.loading.set(false);
        this.loadBookings();
      },
      error: () => this.loading.set(false),
    });
  }

  loadBookings(): void {
    this.loadingBookings.set(true);
    this.bookingApi.getPage(0, 50, 'checkInDate,desc', '', '', this.guestId).subscribe({
      next: (page) => {
        this.bookings.set(page.content);
        this.loadingBookings.set(false);
      },
      error: () => this.loadingBookings.set(false),
    });
  }
}
