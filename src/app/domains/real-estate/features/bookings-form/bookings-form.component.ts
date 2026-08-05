import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingApiService } from '@/app/domains/real-estate/data/booking-api.service';
import { BookingDto } from '@/app/domains/real-estate/data/booking.model';
import { GuestApiService } from '@/app/domains/real-estate/data/guest-api.service';
import { GuestDto } from '@/app/domains/real-estate/data/guest.model';
import { PropertyApiService } from '@/app/domains/real-estate/data/property-api.service';
import { PropertyDto } from '@/app/domains/real-estate/data/property.model';
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

function toIsoDate(value: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-bookings-form',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatInput,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatDatepickerModule,
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
    <div class="mx-auto flex w-full max-w-2xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/real-estate/bookings">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Booking' : 'New Booking' }}
          </h1>
          <p class="text-sm text-neutral-a11">
            {{ isEditMode ? 'Update booking details' : 'Create a new short-term booking' }}
          </p>
        </div>
      </div>

      <mat-card>
        <div [formGroup]="form" class="flex flex-col gap-y-4 p-4">
          <mat-form-field>
            <mat-label>Property</mat-label>
            <input
              matInput
              [formControl]="propertySearchControl"
              [matAutocomplete]="propertyAuto"
              placeholder="Search property by name…"
              [readonly]="isEditMode"
              required
            />
            <mat-autocomplete
              #propertyAuto="matAutocomplete"
              [displayWith]="displayProperty"
              (optionSelected)="onPropertySelected($event.option.value)"
            >
              @for (p of filteredProperties(); track p.id) {
                <mat-option [value]="p">{{ p.name }}</mat-option>
              }
            </mat-autocomplete>
            <mat-error>Property is required</mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Guest</mat-label>
            <input
              matInput
              [formControl]="guestSearchControl"
              [matAutocomplete]="guestAuto"
              placeholder="Search guest by name…"
              [readonly]="isEditMode"
              required
            />
            <mat-autocomplete
              #guestAuto="matAutocomplete"
              [displayWith]="displayGuest"
              (optionSelected)="onGuestSelected($event.option.value)"
            >
              @for (g of filteredGuests(); track g.id) {
                <mat-option [value]="g">{{ g.fullName }}</mat-option>
              }
            </mat-autocomplete>
            <mat-error>Guest is required</mat-error>
          </mat-form-field>
          @if (!isEditMode) {
            <button type="button" matButton class="w-fit" (click)="newGuestDialog.open()">
              <mat-icon svgIcon="user-round-plus" />
              New Guest
            </button>
          }

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <mat-form-field>
              <mat-label>Check-in Date</mat-label>
              <input matInput [matDatepicker]="checkInPicker" formControlName="checkInDate" required />
              <mat-datepicker-toggle matIconSuffix [for]="checkInPicker" />
              <mat-datepicker #checkInPicker />
              <mat-error>Check-in date is required</mat-error>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Check-out Date</mat-label>
              <input matInput [matDatepicker]="checkOutPicker" formControlName="checkOutDate" required />
              <mat-datepicker-toggle matIconSuffix [for]="checkOutPicker" />
              <mat-datepicker #checkOutPicker />
              <mat-error>Check-out date is required</mat-error>
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <mat-form-field>
              <mat-label>Number of Guests</mat-label>
              <input matInput type="number" min="1" formControlName="numberOfGuests" required />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Total Amount</mat-label>
              <input matInput type="number" min="0" formControlName="totalAmount" />
            </mat-form-field>
          </div>

          <mat-form-field>
            <mat-label>Notes</mat-label>
            <textarea matInput rows="3" formControlName="notes"></textarea>
          </mat-form-field>

          @if (errorMessage()) {
            <div
              class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
            >
              <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
              {{ errorMessage() }}
            </div>
          }

          <div class="flex justify-end gap-3 pt-2">
            <a matButton class="tertiary" routerLink="/admin/real-estate/bookings">Cancel</a>
            <button
              matButton
              class="primary"
              type="button"
              (click)="submit()"
              [disabled]="!canSubmit() || saving()"
            >
              {{ saving() ? 'Saving…' : isEditMode ? 'Update Booking' : 'Create Booking' }}
            </button>
          </div>
        </div>
      </mat-card>
    </div>

    <!-- ── Inline "New Guest" dialog ──────────────────────────────────────── -->
    <div buiDialog #newGuestDialog="buiDialog">
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <div buiDialogContent>
          <div buiDialogHeader>
            <h2 buiDialogTitle>New Guest</h2>
          </div>
          <div buiDialogBody [formGroup]="newGuestForm" class="flex flex-col gap-y-4">
            <mat-form-field>
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" required />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            @if (newGuestError()) {
              <div
                class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
              >
                <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
                {{ newGuestError() }}
              </div>
            }
          </div>
          <div buiDialogFooter>
            <button matButton type="button" (click)="newGuestDialog.close()">Cancel</button>
            <button
              matButton
              class="primary"
              type="button"
              [disabled]="newGuestForm.invalid || creatingGuest()"
              (click)="createGuest(newGuestDialog)"
            >
              {{ creatingGuest() ? 'Creating…' : 'Create Guest' }}
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class BookingsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingApi = inject(BookingApiService);
  private readonly propertyApi = inject(PropertyApiService);
  private readonly guestApi = inject(GuestApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly properties = signal<PropertyDto[]>([]);
  readonly guests = signal<GuestDto[]>([]);
  readonly creatingGuest = signal(false);
  readonly newGuestError = signal('');

  isEditMode = false;
  bookingId = '';

  readonly propertySearchControl = new FormControl('');
  readonly guestSearchControl = new FormControl('');

  readonly form = this.fb.group({
    propertyId: ['', Validators.required],
    guestId: ['', Validators.required],
    checkInDate: [null as Date | null, Validators.required],
    checkOutDate: [null as Date | null, Validators.required],
    numberOfGuests: [1, [Validators.required, Validators.min(1)]],
    totalAmount: [null as number | null],
    notes: [''],
  });

  readonly newGuestForm = this.fb.group({
    fullName: ['', Validators.required],
    phoneNumber: [''],
    email: ['', Validators.email],
  });

  readonly filteredProperties = computed(() => {
    const query = (this.propertySearchControl.value ?? '').toLowerCase().trim();
    const list = this.properties();
    if (!query) return list;
    return list.filter((p) => p.name.toLowerCase().includes(query));
  });

  readonly filteredGuests = computed(() => {
    const query = (this.guestSearchControl.value ?? '').toLowerCase().trim();
    const list = this.guests();
    if (!query) return list;
    return list.filter((g) => g.fullName.toLowerCase().includes(query));
  });

  canSubmit(): boolean {
    return this.form.valid;
  }

  displayProperty(property: PropertyDto | string | null): string {
    if (!property) return '';
    return typeof property === 'string' ? property : property.name;
  }

  displayGuest(guest: GuestDto | string | null): string {
    if (!guest) return '';
    return typeof guest === 'string' ? guest : guest.fullName;
  }

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.bookingId;

    this.propertyApi.getPage(0, 200).subscribe((page) => this.properties.set(page.content));
    this.guestApi.getPage(0, 200).subscribe((page) => this.guests.set(page.content));

    if (this.isEditMode) {
      this.bookingApi.getById(this.bookingId).subscribe((b) => this.patchForm(b));
    } else {
      const propertyId = this.route.snapshot.queryParamMap.get('propertyId');
      if (propertyId) {
        this.propertyApi.getById(propertyId).subscribe((p) => this.onPropertySelected(p));
      }
    }
  }

  private patchForm(b: BookingDto): void {
    this.form.patchValue({
      propertyId: b.propertyId,
      guestId: b.guestId,
      checkInDate: new Date(b.checkInDate),
      checkOutDate: new Date(b.checkOutDate),
      numberOfGuests: b.numberOfGuests,
      totalAmount: b.totalAmount,
      notes: b.notes ?? '',
    });
    this.propertySearchControl.setValue(b.propertyName ?? '');
    this.guestSearchControl.setValue(b.guestName ?? '');
  }

  onPropertySelected(property: PropertyDto): void {
    this.form.controls.propertyId.setValue(property.id);
    this.propertySearchControl.setValue(property.name);
  }

  onGuestSelected(guest: GuestDto): void {
    this.form.controls.guestId.setValue(guest.id);
  }

  createGuest(dialog: BuiDialog): void {
    if (this.newGuestForm.invalid) return;
    this.creatingGuest.set(true);
    this.newGuestError.set('');
    const v = this.newGuestForm.value;
    this.guestApi
      .create({
        fullName: v.fullName!,
        phoneNumber: v.phoneNumber || undefined,
        email: v.email || undefined,
      })
      .subscribe({
        next: (guest) => {
          this.guests.update((list) => [guest, ...list]);
          this.onGuestSelected(guest);
          this.guestSearchControl.setValue(guest.fullName);
          this.creatingGuest.set(false);
          this.newGuestForm.reset();
          dialog.close();
          this.snackBar.open('Guest created', 'OK', { duration: 3000 });
        },
        error: (err: { error?: { message?: string } }) => {
          this.creatingGuest.set(false);
          this.newGuestError.set(err?.error?.message ?? 'Failed to create guest');
        },
      });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const v = this.form.value;
    const payload = {
      checkInDate: toIsoDate(v.checkInDate ?? null)!,
      checkOutDate: toIsoDate(v.checkOutDate ?? null)!,
      numberOfGuests: v.numberOfGuests!,
      totalAmount: v.totalAmount ?? undefined,
      notes: v.notes || undefined,
    };

    const call = this.isEditMode
      ? this.bookingApi.update(this.bookingId, payload)
      : this.bookingApi.create({ ...payload, propertyId: v.propertyId!, guestId: v.guestId! });

    call.subscribe({
      next: (booking) => {
        this.saving.set(false);
        this.snackBar.open(`Booking ${this.isEditMode ? 'updated' : 'created'}`, 'OK', {
          duration: 3000,
        });
        this.router.navigate(['/admin/real-estate/bookings', booking.id]);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}
