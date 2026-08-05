import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@/app/core/auth/auth.service';
import { BookingApiService } from '@/app/domains/real-estate/data/booking-api.service';
import { BookingDto } from '@/app/domains/real-estate/data/booking.model';
import { CustomerLinkComponent } from '@/app/domains/real-estate/ui/customer-link';
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogContent,
  BuiDialogFooter,
  BuiDialogHeader,
  BuiDialogPortal,
  BuiDialogTitle,
} from '@/app/ui/dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-bookings-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    StatusBadgeComponent,
    LoadingComponent,
    CustomerLinkComponent,
    BuiDialog,
    BuiDialogPortal,
    BuiDialogBackdrop,
    BuiDialogContent,
    BuiDialogHeader,
    BuiDialogTitle,
    BuiDialogBody,
    BuiDialogFooter,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-6xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/real-estate/bookings">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-a3">
          <mat-icon svgIcon="calendar" class="size-7 text-accent-a11" />
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-2xl font-semibold tracking-tight">
            {{ booking()?.propertyName }}
          </h1>
          <p class="mt-0.5 text-sm text-neutral-a11">{{ booking()?.guestName }}</p>
        </div>
        @if (booking()) {
          <app-status-badge [status]="booking()!.status" />
        }
        @if (booking()?.status === 'PENDING' && auth.hasPermission('BOOKINGS_WRITE')) {
          <a
            class="tertiary"
            matButton
            [routerLink]="['/admin/real-estate/bookings', bookingId, 'edit']"
          >
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
          <button matButton class="primary" type="button" [disabled]="acting()" (click)="confirm()">
            <mat-icon svgIcon="check" />
            Confirm
          </button>
        }
        @if (booking()?.status === 'CONFIRMED' && auth.hasPermission('BOOKINGS_WRITE')) {
          <button matButton class="primary" type="button" [disabled]="acting()" (click)="checkIn()">
            <mat-icon svgIcon="log-in" />
            Check In
          </button>
        }
        @if (booking()?.status === 'CHECKED_IN' && auth.hasPermission('BOOKINGS_WRITE')) {
          <button matButton class="primary" type="button" [disabled]="acting()" (click)="checkOut()">
            <mat-icon svgIcon="log-out" />
            Check Out
          </button>
        }
        @if (
          (booking()?.status === 'PENDING' || booking()?.status === 'CONFIRMED') &&
          auth.hasPermission('BOOKINGS_WRITE')
        ) {
          <button matButton class="warn" type="button" (click)="cancelDialog.open()">
            <mat-icon svgIcon="circle-x" />
            Cancel
          </button>
        }
      </div>

      <app-loading [loading]="loading()" />

      @if (booking() && !loading()) {
        @let b = booking()!;

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-a3"
                >
                  <mat-icon svgIcon="home" class="size-4 text-primary-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Property
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <a
                [routerLink]="['/admin/real-estate/properties', b.propertyId]"
                class="flex items-center gap-2 text-sm font-medium text-primary-a11 hover:underline"
              >
                {{ b.propertyName || 'View property' }}
                <mat-icon svgIcon="arrow-right" class="size-3.5" />
              </a>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-a3">
                  <mat-icon svgIcon="user-round" class="size-4 text-amber-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Guest
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <a
                [routerLink]="['/admin/real-estate/guests', b.guestId]"
                class="flex items-center gap-2 text-sm font-medium text-primary-a11 hover:underline"
              >
                {{ b.guestName || 'View guest' }}
                <mat-icon svgIcon="arrow-right" class="size-3.5" />
              </a>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-a3"
                >
                  <mat-icon svgIcon="calendar" class="size-4 text-violet-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Stay
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Dates</dt>
                  <dd class="font-medium">{{ b.checkInDate }} – {{ b.checkOutDate }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Guests</dt>
                  <dd class="font-medium">{{ b.numberOfGuests }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Total</dt>
                  <dd class="font-medium">{{ b.totalAmount ?? '—' }}</dd>
                </div>
                @if (b.cancellationReason) {
                  <div class="flex justify-between">
                    <dt class="text-neutral-a11">Cancelled</dt>
                    <dd class="font-medium">{{ b.cancellationReason }}</dd>
                  </div>
                }
              </dl>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card appearance="filled">
          <mat-card-header>
            <div class="flex items-center gap-2">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-a3">
                <mat-icon svgIcon="link" class="size-4 text-emerald-a11" />
              </div>
              <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                Billing
              </div>
            </div>
          </mat-card-header>
          <mat-card-content>
            <app-customer-link
              [linkedCustomerId]="b.linkedCustomerId"
              [canWrite]="auth.hasPermission('BOOKINGS_WRITE')"
              [acting]="acting()"
              (linkCustomer)="linkCustomer($event)"
              (unlinkCustomer)="unlinkCustomer()"
            />
          </mat-card-content>
        </mat-card>

        <mat-card>
          <div class="p-4 text-sm text-neutral-a11">
            @if (b.notes) {
              <p>{{ b.notes }}</p>
            } @else {
              <p>No notes.</p>
            }
            <p class="mt-2 text-xs text-neutral-a9">
              Created {{ b.createdAt | date: 'mediumDate' }} · Updated
              {{ b.updatedAt | date: 'mediumDate' }}
            </p>
          </div>
        </mat-card>
      }
    </div>

    <!-- ── Cancel booking dialog ──────────────────────────────────────────── -->
    <div buiDialog #cancelDialog="buiDialog">
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <div buiDialogContent>
          <div buiDialogHeader>
            <h2 buiDialogTitle>Cancel Booking</h2>
          </div>
          <div buiDialogBody [formGroup]="cancelForm" class="flex flex-col gap-y-4">
            <p class="text-sm text-neutral-a11">Please record why this booking is being cancelled.</p>
            <mat-form-field>
              <mat-label>Reason</mat-label>
              <textarea matInput rows="3" formControlName="reason" required></textarea>
            </mat-form-field>
          </div>
          <div buiDialogFooter>
            <button matButton type="button" (click)="cancelDialog.close()">Keep Booking</button>
            <button
              matButton
              class="warn"
              type="button"
              [disabled]="cancelForm.invalid || acting()"
              (click)="cancel(cancelDialog)"
            >
              {{ acting() ? 'Cancelling…' : 'Cancel Booking' }}
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class BookingsDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly bookingApi = inject(BookingApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly booking = signal<BookingDto | null>(null);
  readonly acting = signal(false);

  readonly cancelForm = this.fb.group({
    reason: ['', Validators.required],
  });

  bookingId = '';

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.bookingApi.getById(this.bookingId).subscribe({
      next: (b) => {
        this.booking.set(b);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private runAction(label: string, call: Observable<BookingDto>, successMessage: string): void {
    this.acting.set(true);
    call.subscribe({
      next: (b) => {
        this.booking.set(b);
        this.acting.set(false);
        this.snackBar.open(successMessage, 'OK', { duration: 3000 });
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.acting.set(false);
        this.snackBar.open(
          err?.error?.detail ?? err?.error?.message ?? `Failed to ${label}`,
          'Close',
          { duration: 4000 },
        );
      },
    });
  }

  confirm(): void {
    this.runAction('confirm booking', this.bookingApi.confirm(this.bookingId), 'Booking confirmed');
  }

  checkIn(): void {
    this.runAction('check in', this.bookingApi.checkIn(this.bookingId), 'Guest checked in');
  }

  checkOut(): void {
    this.runAction('check out', this.bookingApi.checkOut(this.bookingId), 'Guest checked out');
  }

  cancel(dialog: BuiDialog): void {
    if (this.cancelForm.invalid) return;
    this.acting.set(true);
    this.bookingApi.cancel(this.bookingId, { reason: this.cancelForm.value.reason! }).subscribe({
      next: (b) => {
        this.booking.set(b);
        this.acting.set(false);
        this.cancelForm.reset();
        dialog.close();
        this.snackBar.open('Booking cancelled', 'OK', { duration: 3000 });
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.acting.set(false);
        this.snackBar.open(
          err?.error?.detail ?? err?.error?.message ?? 'Failed to cancel booking',
          'Close',
          { duration: 4000 },
        );
      },
    });
  }

  linkCustomer(customerId: string): void {
    this.acting.set(true);
    this.bookingApi.linkCustomer(this.bookingId, { customerId }).subscribe({
      next: (b) => {
        this.booking.set(b);
        this.acting.set(false);
        this.snackBar.open('Booking linked to customer', 'OK', { duration: 3000 });
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.acting.set(false);
        this.snackBar.open(
          err?.error?.detail ?? err?.error?.message ?? 'Failed to link customer',
          'Close',
          { duration: 4000 },
        );
      },
    });
  }

  unlinkCustomer(): void {
    this.acting.set(true);
    this.bookingApi.linkCustomer(this.bookingId, { customerId: null }).subscribe({
      next: (b) => {
        this.booking.set(b);
        this.acting.set(false);
        this.snackBar.open('Booking unlinked from customer', 'OK', { duration: 3000 });
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.acting.set(false);
        this.snackBar.open(
          err?.error?.detail ?? err?.error?.message ?? 'Failed to unlink customer',
          'Close',
          { duration: 4000 },
        );
      },
    });
  }
}
