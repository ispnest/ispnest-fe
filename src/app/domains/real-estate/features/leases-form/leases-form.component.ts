import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LeaseApiService } from '@/app/domains/real-estate/data/lease-api.service';
import { LeaseDto } from '@/app/domains/real-estate/data/lease.model';
import { PropertyApiService } from '@/app/domains/real-estate/data/property-api.service';
import { PropertyDto } from '@/app/domains/real-estate/data/property.model';
import { RenterApiService } from '@/app/domains/real-estate/data/renter-api.service';
import { RenterDto } from '@/app/domains/real-estate/data/renter.model';
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
  selector: 'app-leases-form',
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
    MatSelect,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
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
        <a matIconButton routerLink="/admin/real-estate/leases">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Lease' : 'New Lease' }}
          </h1>
          <p class="text-sm text-neutral-a11">
            {{ isEditMode ? 'Update lease terms' : 'Create a new lease agreement' }}
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
            <mat-label>Renter</mat-label>
            <input
              matInput
              [formControl]="renterSearchControl"
              [matAutocomplete]="renterAuto"
              placeholder="Search renter by name…"
              [readonly]="isEditMode"
              required
            />
            <mat-autocomplete
              #renterAuto="matAutocomplete"
              [displayWith]="displayRenter"
              (optionSelected)="onRenterSelected($event.option.value)"
            >
              @for (r of filteredRenters(); track r.id) {
                <mat-option [value]="r">{{ r.fullName }}</mat-option>
              }
            </mat-autocomplete>
            <mat-error>Renter is required</mat-error>
          </mat-form-field>
          @if (!isEditMode) {
            <button type="button" matButton class="w-fit" (click)="newRenterDialog.open()">
              <mat-icon svgIcon="user-round-plus" />
              New Renter
            </button>
          }

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <mat-form-field>
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate" required />
              <mat-datepicker-toggle matIconSuffix [for]="startPicker" />
              <mat-datepicker #startPicker />
              <mat-error>Start date is required</mat-error>
            </mat-form-field>
            <mat-form-field>
              <mat-label>End Date (optional)</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
              <mat-datepicker-toggle matIconSuffix [for]="endPicker" />
              <mat-datepicker #endPicker />
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <mat-form-field>
              <mat-label>Rent Amount</mat-label>
              <input matInput type="number" min="0" formControlName="rentAmount" required />
              <mat-error>Rent amount is required</mat-error>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Billing Cycle</mat-label>
              <mat-select formControlName="billingCycle">
                <mat-option value="MONTHLY">Monthly</mat-option>
                <mat-option value="WEEKLY">Weekly</mat-option>
                <mat-option value="ANNUALLY">Annually</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Security Deposit</mat-label>
              <input matInput type="number" min="0" formControlName="securityDeposit" />
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
            <a matButton class="tertiary" routerLink="/admin/real-estate/leases">Cancel</a>
            <button
              matButton
              class="primary"
              type="button"
              (click)="submit()"
              [disabled]="!canSubmit() || saving()"
            >
              {{ saving() ? 'Saving…' : isEditMode ? 'Update Lease' : 'Create Lease' }}
            </button>
          </div>
        </div>
      </mat-card>
    </div>

    <!-- ── Inline "New Renter" dialog ─────────────────────────────────────── -->
    <div buiDialog #newRenterDialog="buiDialog">
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <div buiDialogContent>
          <div buiDialogHeader>
            <h2 buiDialogTitle>New Renter</h2>
          </div>
          <div buiDialogBody [formGroup]="newRenterForm" class="flex flex-col gap-y-4">
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
            @if (newRenterError()) {
              <div
                class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
              >
                <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
                {{ newRenterError() }}
              </div>
            }
          </div>
          <div buiDialogFooter>
            <button matButton type="button" (click)="newRenterDialog.close()">Cancel</button>
            <button
              matButton
              class="primary"
              type="button"
              [disabled]="newRenterForm.invalid || creatingRenter()"
              (click)="createRenter(newRenterDialog)"
            >
              {{ creatingRenter() ? 'Creating…' : 'Create Renter' }}
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class LeasesFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly leaseApi = inject(LeaseApiService);
  private readonly propertyApi = inject(PropertyApiService);
  private readonly renterApi = inject(RenterApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly properties = signal<PropertyDto[]>([]);
  readonly renters = signal<RenterDto[]>([]);
  readonly creatingRenter = signal(false);
  readonly newRenterError = signal('');

  isEditMode = false;
  leaseId = '';

  readonly propertySearchControl = new FormControl('');
  readonly renterSearchControl = new FormControl('');

  readonly form = this.fb.group({
    propertyId: ['', Validators.required],
    renterId: ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null],
    rentAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    billingCycle: ['MONTHLY'],
    securityDeposit: [null as number | null],
    notes: [''],
  });

  readonly newRenterForm = this.fb.group({
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

  readonly filteredRenters = computed(() => {
    const query = (this.renterSearchControl.value ?? '').toLowerCase().trim();
    const list = this.renters();
    if (!query) return list;
    return list.filter((r) => r.fullName.toLowerCase().includes(query));
  });

  canSubmit(): boolean {
    return this.form.valid;
  }

  displayProperty(property: PropertyDto | string | null): string {
    if (!property) return '';
    return typeof property === 'string' ? property : property.name;
  }

  displayRenter(renter: RenterDto | string | null): string {
    if (!renter) return '';
    return typeof renter === 'string' ? renter : renter.fullName;
  }

  ngOnInit(): void {
    this.leaseId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.leaseId;

    this.propertyApi.getPage(0, 200).subscribe((page) => this.properties.set(page.content));
    this.renterApi.getPage(0, 200).subscribe((page) => this.renters.set(page.content));

    if (this.isEditMode) {
      this.leaseApi.getById(this.leaseId).subscribe((l) => this.patchForm(l));
    } else {
      const propertyId = this.route.snapshot.queryParamMap.get('propertyId');
      if (propertyId) {
        this.propertyApi.getById(propertyId).subscribe((p) => this.onPropertySelected(p));
      }
    }
  }

  private patchForm(l: LeaseDto): void {
    this.form.patchValue({
      propertyId: l.propertyId,
      renterId: l.renterId,
      startDate: new Date(l.startDate),
      endDate: l.endDate ? new Date(l.endDate) : null,
      rentAmount: l.rentAmount,
      billingCycle: l.billingCycle,
      securityDeposit: l.securityDeposit,
      notes: l.notes ?? '',
    });
    this.propertySearchControl.setValue(l.propertyName ?? '');
    this.renterSearchControl.setValue(l.renterName ?? '');
  }

  onPropertySelected(property: PropertyDto): void {
    this.form.controls.propertyId.setValue(property.id);
    this.propertySearchControl.setValue(property.name);
  }

  onRenterSelected(renter: RenterDto): void {
    this.form.controls.renterId.setValue(renter.id);
  }

  createRenter(dialog: BuiDialog): void {
    if (this.newRenterForm.invalid) return;
    this.creatingRenter.set(true);
    this.newRenterError.set('');
    const v = this.newRenterForm.value;
    this.renterApi
      .create({
        fullName: v.fullName!,
        phoneNumber: v.phoneNumber || undefined,
        email: v.email || undefined,
      })
      .subscribe({
        next: (renter) => {
          this.renters.update((list) => [renter, ...list]);
          this.onRenterSelected(renter);
          this.renterSearchControl.setValue(renter.fullName);
          this.creatingRenter.set(false);
          this.newRenterForm.reset();
          dialog.close();
          this.snackBar.open('Renter created', 'OK', { duration: 3000 });
        },
        error: (err: { error?: { message?: string } }) => {
          this.creatingRenter.set(false);
          this.newRenterError.set(err?.error?.message ?? 'Failed to create renter');
        },
      });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const v = this.form.value;
    const payload = {
      startDate: toIsoDate(v.startDate ?? null)!,
      endDate: toIsoDate(v.endDate ?? null),
      rentAmount: v.rentAmount!,
      billingCycle: v.billingCycle as LeaseDto['billingCycle'],
      securityDeposit: v.securityDeposit ?? undefined,
      notes: v.notes || undefined,
    };

    const call = this.isEditMode
      ? this.leaseApi.update(this.leaseId, payload)
      : this.leaseApi.create({ ...payload, propertyId: v.propertyId!, renterId: v.renterId! });

    call.subscribe({
      next: (lease) => {
        this.saving.set(false);
        this.snackBar.open(`Lease ${this.isEditMode ? 'updated' : 'created'}`, 'OK', {
          duration: 3000,
        });
        this.router.navigate(['/admin/real-estate/leases', lease.id]);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}
