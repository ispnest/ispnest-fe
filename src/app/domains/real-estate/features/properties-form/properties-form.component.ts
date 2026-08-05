import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStep, MatStepper, MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OwnerApiService } from '@/app/domains/real-estate/data/owner-api.service';
import { OwnerDto } from '@/app/domains/real-estate/data/owner.model';
import { PropertyApiService } from '@/app/domains/real-estate/data/property-api.service';
import { PropertyDto } from '@/app/domains/real-estate/data/property.model';
import { AmenityPickerComponent } from '@/app/domains/real-estate/ui/amenity-picker';
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

@Component({
  selector: 'app-properties-form',
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
    MatInput,
    MatSelect,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatStepper,
    MatStep,
    MatStepperNext,
    MatStepperPrevious,
    AmenityPickerComponent,
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
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/real-estate/properties">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isEditMode ? 'Edit Property' : 'New Property' }}
          </h1>
          <p class="text-sm text-neutral-a11">
            {{ isEditMode ? 'Update property details' : 'Register a new property' }}
          </p>
        </div>
      </div>

      <mat-card>
        <mat-stepper class="p-2" #stepper>
          <!-- ── Step 1: Basics ─────────────────────────────────────────── -->
          <mat-step [stepControl]="basicsGroup" label="Basics">
            <div [formGroup]="basicsGroup" class="flex flex-col gap-y-4 p-4">
              <mat-form-field>
                <mat-label>Property Name</mat-label>
                <input matInput formControlName="name" required />
                <mat-error>Property name is required</mat-error>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Owner</mat-label>
                <input
                  matInput
                  [formControl]="ownerSearchControl"
                  [matAutocomplete]="ownerAuto"
                  placeholder="Search owner by name…"
                  required
                />
                <mat-autocomplete
                  #ownerAuto="matAutocomplete"
                  [displayWith]="displayOwner"
                  (optionSelected)="onOwnerSelected($event.option.value)"
                >
                  @for (o of filteredOwners(); track o.id) {
                    <mat-option [value]="o">{{ o.fullName }}</mat-option>
                  }
                </mat-autocomplete>
                <mat-error>Owner is required</mat-error>
              </mat-form-field>
              <button
                type="button"
                matButton
                class="w-fit"
                (click)="newOwnerDialog.open()"
              >
                <mat-icon svgIcon="user-round-plus" />
                New Owner
              </button>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <mat-form-field>
                  <mat-label>Property Type</mat-label>
                  <mat-select formControlName="propertyType">
                    <mat-option value="HOUSE">House</mat-option>
                    <mat-option value="APARTMENT">Apartment</mat-option>
                    <mat-option value="VILLA">Villa</mat-option>
                    <mat-option value="ROOM">Room</mat-option>
                    <mat-option value="COMMERCIAL_UNIT">Commercial Unit</mat-option>
                    <mat-option value="LAND">Land</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Rental Type</mat-label>
                  <mat-select formControlName="rentalType">
                    <mat-option value="SHORT_TERM">Short Term</mat-option>
                    <mat-option value="LONG_TERM">Long Term</mat-option>
                    <mat-option value="BOTH">Both</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              @if (isEditMode) {
                <mat-form-field>
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="DRAFT">Draft</mat-option>
                    <mat-option value="AVAILABLE">Available</mat-option>
                    <mat-option value="OCCUPIED">Occupied</mat-option>
                    <mat-option value="UNDER_MAINTENANCE">Under Maintenance</mat-option>
                    <mat-option value="INACTIVE">Inactive</mat-option>
                  </mat-select>
                </mat-form-field>
              }

              <div class="flex justify-end pt-2">
                <button matButton class="primary" matStepperNext type="button">
                  Next
                  <mat-icon svgIcon="arrow-right" />
                </button>
              </div>
            </div>
          </mat-step>

          <!-- ── Step 2: Address & Location ─────────────────────────────── -->
          <mat-step [stepControl]="addressGroup" label="Address & Location">
            <div [formGroup]="addressGroup" class="flex flex-col gap-y-4 p-4">
              <mat-form-field>
                <mat-label>Address Line 1</mat-label>
                <input matInput formControlName="addressLine1" />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Address Line 2</mat-label>
                <input matInput formControlName="addressLine2" />
              </mat-form-field>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <mat-form-field>
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city" />
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Region</mat-label>
                  <input matInput formControlName="region" />
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Postal Code</mat-label>
                  <input matInput formControlName="postalCode" />
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Country</mat-label>
                  <input matInput formControlName="country" />
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Latitude (optional)</mat-label>
                  <input matInput type="number" formControlName="latitude" />
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Longitude (optional)</mat-label>
                  <input matInput type="number" formControlName="longitude" />
                </mat-form-field>
              </div>

              <div class="flex justify-between pt-2">
                <button matButton class="tertiary" matStepperPrevious type="button">
                  <mat-icon svgIcon="arrow-left" />
                  Back
                </button>
                <button matButton class="primary" matStepperNext type="button">
                  Next
                  <mat-icon svgIcon="arrow-right" />
                </button>
              </div>
            </div>
          </mat-step>

          <!-- ── Step 3: Details ────────────────────────────────────────── -->
          <mat-step [stepControl]="detailsGroup" label="Details">
            <div [formGroup]="detailsGroup" class="flex flex-col gap-y-4 p-4">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <mat-form-field>
                  <mat-label>Bedrooms</mat-label>
                  <input matInput type="number" min="0" formControlName="bedrooms" />
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Bathrooms</mat-label>
                  <input matInput type="number" min="0" formControlName="bathrooms" />
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Size (sqm)</mat-label>
                  <input matInput type="number" min="0" formControlName="sizeSqm" />
                </mat-form-field>
              </div>
              <mat-form-field>
                <mat-label>Notes</mat-label>
                <textarea matInput rows="3" formControlName="notes"></textarea>
              </mat-form-field>

              <div>
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-a9">
                  Amenities
                </p>
                <app-amenity-picker [(selectedIds)]="selectedAmenityIds" />
              </div>

              @if (errorMessage()) {
                <div
                  class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
                >
                  <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
                  {{ errorMessage() }}
                </div>
              }

              <div class="flex justify-between pt-2">
                <button matButton class="tertiary" matStepperPrevious type="button">
                  <mat-icon svgIcon="arrow-left" />
                  Back
                </button>
                <button
                  matButton
                  class="primary"
                  type="button"
                  (click)="submit()"
                  [disabled]="basicsGroup.invalid || saving()"
                >
                  {{ saving() ? 'Saving…' : isEditMode ? 'Update Property' : 'Create Property' }}
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-card>
    </div>

    <!-- ── Inline "New Owner" dialog ──────────────────────────────────────── -->
    <div buiDialog #newOwnerDialog="buiDialog">
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <div buiDialogContent>
          <div buiDialogHeader>
            <h2 buiDialogTitle>New Owner</h2>
          </div>
          <div buiDialogBody [formGroup]="newOwnerForm" class="flex flex-col gap-y-4">
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
            @if (newOwnerError()) {
              <div
                class="flex items-center gap-2 rounded-lg border border-red-a6 bg-red-a3 p-3 text-sm text-red-a11"
              >
                <mat-icon svgIcon="circle-alert" class="size-4 shrink-0" />
                {{ newOwnerError() }}
              </div>
            }
          </div>
          <div buiDialogFooter>
            <button matButton type="button" (click)="newOwnerDialog.close()">Cancel</button>
            <button
              matButton
              class="primary"
              type="button"
              [disabled]="newOwnerForm.invalid || creatingOwner()"
              (click)="createOwner(newOwnerDialog)"
            >
              {{ creatingOwner() ? 'Creating…' : 'Create Owner' }}
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class PropertiesFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propertyApi = inject(PropertyApiService);
  private readonly ownerApi = inject(OwnerApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly owners = signal<OwnerDto[]>([]);
  readonly selectedAmenityIds = signal<string[]>([]);
  readonly creatingOwner = signal(false);
  readonly newOwnerError = signal('');

  isEditMode = false;
  propertyId = '';

  readonly ownerSearchControl = new FormControl('');

  readonly basicsGroup = this.fb.group({
    name: ['', Validators.required],
    ownerId: ['', Validators.required],
    propertyType: ['HOUSE', Validators.required],
    rentalType: ['LONG_TERM', Validators.required],
    status: ['DRAFT'],
  });

  readonly addressGroup = this.fb.group({
    addressLine1: [''],
    addressLine2: [''],
    city: [''],
    region: [''],
    postalCode: [''],
    country: [''],
    latitude: [null as number | null],
    longitude: [null as number | null],
  });

  readonly detailsGroup = this.fb.group({
    bedrooms: [null as number | null],
    bathrooms: [null as number | null],
    sizeSqm: [null as number | null],
    notes: [''],
  });

  readonly newOwnerForm = this.fb.group({
    fullName: ['', Validators.required],
    phoneNumber: [''],
    email: ['', Validators.email],
  });

  readonly filteredOwners = computed(() => {
    const query = (this.ownerSearchControl.value ?? '').toLowerCase().trim();
    const list = this.owners();
    if (!query) return list;
    return list.filter((o) => o.fullName.toLowerCase().includes(query));
  });

  displayOwner(owner: OwnerDto | string | null): string {
    if (!owner) return '';
    return typeof owner === 'string' ? owner : owner.fullName;
  }

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.propertyId;

    this.ownerApi.getPage(0, 200).subscribe((page) => this.owners.set(page.content));

    if (this.isEditMode) {
      this.propertyApi.getById(this.propertyId).subscribe((p) => this.patchForm(p));
    }
  }

  private patchForm(p: PropertyDto): void {
    this.basicsGroup.patchValue({
      name: p.name,
      ownerId: p.ownerId,
      propertyType: p.propertyType,
      rentalType: p.rentalType,
      status: p.status,
    });
    this.ownerSearchControl.setValue(p.ownerName ?? '');
    this.addressGroup.patchValue({
      addressLine1: p.addressLine1,
      addressLine2: p.addressLine2,
      city: p.city,
      region: p.region,
      postalCode: p.postalCode,
      country: p.country,
      latitude: p.latitude,
      longitude: p.longitude,
    });
    this.detailsGroup.patchValue({
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sizeSqm: p.sizeSqm,
      notes: p.notes,
    });
    this.selectedAmenityIds.set(p.amenities.map((a) => a.id));
  }

  onOwnerSelected(owner: OwnerDto): void {
    this.basicsGroup.controls.ownerId.setValue(owner.id);
  }

  createOwner(dialog: BuiDialog): void {
    if (this.newOwnerForm.invalid) return;
    this.creatingOwner.set(true);
    this.newOwnerError.set('');
    const v = this.newOwnerForm.value;
    this.ownerApi
      .create({
        fullName: v.fullName!,
        phoneNumber: v.phoneNumber || undefined,
        email: v.email || undefined,
      })
      .subscribe({
        next: (owner) => {
          this.owners.update((list) => [owner, ...list]);
          this.onOwnerSelected(owner);
          this.ownerSearchControl.setValue(owner.fullName);
          this.creatingOwner.set(false);
          this.newOwnerForm.reset();
          dialog.close();
          this.snackBar.open('Owner created', 'OK', { duration: 3000 });
        },
        error: (err: { error?: { message?: string } }) => {
          this.creatingOwner.set(false);
          this.newOwnerError.set(err?.error?.message ?? 'Failed to create owner');
        },
      });
  }

  submit(): void {
    if (this.basicsGroup.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const basics = this.basicsGroup.value;
    const address = this.addressGroup.value;
    const details = this.detailsGroup.value;

    const payload = {
      ownerId: basics.ownerId!,
      name: basics.name!,
      propertyType: basics.propertyType as PropertyDto['propertyType'],
      rentalType: basics.rentalType as PropertyDto['rentalType'],
      addressLine1: address.addressLine1 || undefined,
      addressLine2: address.addressLine2 || undefined,
      city: address.city || undefined,
      region: address.region || undefined,
      postalCode: address.postalCode || undefined,
      country: address.country || undefined,
      latitude: address.latitude ?? undefined,
      longitude: address.longitude ?? undefined,
      bedrooms: details.bedrooms ?? undefined,
      bathrooms: details.bathrooms ?? undefined,
      sizeSqm: details.sizeSqm ?? undefined,
      notes: details.notes || undefined,
    };

    const call = this.isEditMode
      ? this.propertyApi.update(this.propertyId, { ...payload, status: basics.status as PropertyDto['status'] })
      : this.propertyApi.create(payload);

    call.subscribe({
      next: (property) => {
        this.propertyApi.updateAmenities(property.id, this.selectedAmenityIds()).subscribe();
        this.saving.set(false);
        this.snackBar.open(`Property ${this.isEditMode ? 'updated' : 'created'}`, 'OK', {
          duration: 3000,
        });
        this.router.navigate(['/admin/real-estate/properties', property.id]);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'An error occurred');
      },
    });
  }
}
