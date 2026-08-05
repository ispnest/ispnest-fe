import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { LeaseApiService } from '@/app/domains/real-estate/data/lease-api.service';
import { LeaseDto } from '@/app/domains/real-estate/data/lease.model';
import { CustomerLinkComponent } from '@/app/domains/real-estate/ui/customer-link';
import { DocumentListComponent } from '@/app/domains/real-estate/ui/document-list';
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
  selector: 'app-leases-detail',
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
    MatTabGroup,
    MatTab,
    MatTabContent,
    StatusBadgeComponent,
    LoadingComponent,
    DocumentListComponent,
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
        <a matIconButton routerLink="/admin/real-estate/leases">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-a3">
          <mat-icon svgIcon="file-signature" class="size-7 text-accent-a11" />
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-2xl font-semibold tracking-tight">{{ lease()?.propertyName }}</h1>
          <p class="mt-0.5 text-sm text-neutral-a11">{{ lease()?.renterName }}</p>
        </div>
        @if (lease()) {
          <app-status-badge [status]="lease()!.status" />
        }
        @if (lease()?.status === 'DRAFT' && auth.hasPermission('LEASES_WRITE')) {
          <a class="tertiary" matButton [routerLink]="['/admin/real-estate/leases', leaseId, 'edit']">
            <mat-icon svgIcon="pencil" />
            Edit
          </a>
          <button matButton class="primary" type="button" [disabled]="acting()" (click)="activate()">
            <mat-icon svgIcon="play" />
            Activate
          </button>
        }
        @if (lease()?.status === 'ACTIVE' && auth.hasPermission('LEASES_WRITE')) {
          <button matButton class="warn" type="button" (click)="terminateDialog.open()">
            <mat-icon svgIcon="circle-x" />
            Terminate
          </button>
        }
      </div>

      <app-loading [loading]="loading()" />

      @if (lease() && !loading()) {
        @let l = lease()!;

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
                [routerLink]="['/admin/real-estate/properties', l.propertyId]"
                class="flex items-center gap-2 text-sm font-medium text-primary-a11 hover:underline"
              >
                {{ l.propertyName || 'View property' }}
                <mat-icon svgIcon="arrow-right" class="size-3.5" />
              </a>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="filled">
            <mat-card-header>
              <div class="flex items-center gap-2">
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-a3"
                >
                  <mat-icon svgIcon="user-round" class="size-4 text-amber-a11" />
                </div>
                <div class="text-xs font-semibold uppercase tracking-widest text-neutral-a9">
                  Renter
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <a
                [routerLink]="['/admin/real-estate/renters', l.renterId]"
                class="flex items-center gap-2 text-sm font-medium text-primary-a11 hover:underline"
              >
                {{ l.renterName || 'View renter' }}
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
                  Terms
                </div>
              </div>
            </mat-card-header>
            <mat-card-content>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Dates</dt>
                  <dd class="font-medium">{{ l.startDate }} – {{ l.endDate || 'Open-ended' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Rent</dt>
                  <dd class="font-medium">{{ l.rentAmount }} / {{ l.billingCycle }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-neutral-a11">Deposit</dt>
                  <dd class="font-medium">{{ l.securityDeposit ?? '—' }}</dd>
                </div>
                @if (l.terminationReason) {
                  <div class="flex justify-between">
                    <dt class="text-neutral-a11">Terminated</dt>
                    <dd class="font-medium">{{ l.terminationReason }}</dd>
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
              [linkedCustomerId]="l.linkedCustomerId"
              [canWrite]="auth.hasPermission('LEASES_WRITE')"
              [acting]="acting()"
              (linkCustomer)="linkCustomer($event)"
              (unlinkCustomer)="unlinkCustomer()"
            />
          </mat-card-content>
        </mat-card>

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group dynamicHeight>
            <mat-tab label="Overview">
              <div class="p-4 text-sm text-neutral-a11">
                @if (l.notes) {
                  <p>{{ l.notes }}</p>
                } @else {
                  <p>No notes.</p>
                }
                <p class="mt-2 text-xs text-neutral-a9">
                  Created {{ l.createdAt | date: 'mediumDate' }} · Updated
                  {{ l.updatedAt | date: 'mediumDate' }}
                </p>
              </div>
            </mat-tab>

            <mat-tab label="Documents">
              <ng-template matTabContent>
                <div class="p-4">
                  <app-document-list [propertyId]="l.propertyId" initialType="LEASE_AGREEMENT" />
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      }
    </div>

    <!-- ── Terminate lease dialog ──────────────────────────────────────────── -->
    <div buiDialog #terminateDialog="buiDialog">
      <ng-template buiDialogPortal>
        <div buiDialogBackdrop></div>
        <div buiDialogContent>
          <div buiDialogHeader>
            <h2 buiDialogTitle>Terminate Lease</h2>
          </div>
          <div buiDialogBody [formGroup]="terminateForm" class="flex flex-col gap-y-4">
            <p class="text-sm text-neutral-a11">
              Ending this lease early frees up the property immediately. Please record why.
            </p>
            <mat-form-field>
              <mat-label>Reason</mat-label>
              <textarea matInput rows="3" formControlName="reason" required></textarea>
            </mat-form-field>
          </div>
          <div buiDialogFooter>
            <button matButton type="button" (click)="terminateDialog.close()">Cancel</button>
            <button
              matButton
              class="warn"
              type="button"
              [disabled]="terminateForm.invalid || acting()"
              (click)="terminate(terminateDialog)"
            >
              {{ acting() ? 'Terminating…' : 'Terminate Lease' }}
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class LeasesDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly leaseApi = inject(LeaseApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly lease = signal<LeaseDto | null>(null);
  readonly acting = signal(false);

  readonly terminateForm = this.fb.group({
    reason: ['', Validators.required],
  });

  leaseId = '';

  ngOnInit(): void {
    this.leaseId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.leaseApi.getById(this.leaseId).subscribe({
      next: (l) => {
        this.lease.set(l);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  activate(): void {
    this.acting.set(true);
    this.leaseApi.activate(this.leaseId).subscribe({
      next: (l) => {
        this.lease.set(l);
        this.acting.set(false);
        this.snackBar.open('Lease activated', 'OK', { duration: 3000 });
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.acting.set(false);
        this.snackBar.open(
          err?.error?.detail ?? err?.error?.message ?? 'Failed to activate lease',
          'Close',
          { duration: 4000 },
        );
      },
    });
  }

  linkCustomer(customerId: string): void {
    this.acting.set(true);
    this.leaseApi.linkCustomer(this.leaseId, { customerId }).subscribe({
      next: (l) => {
        this.lease.set(l);
        this.acting.set(false);
        this.snackBar.open('Lease linked to customer', 'OK', { duration: 3000 });
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
    this.leaseApi.linkCustomer(this.leaseId, { customerId: null }).subscribe({
      next: (l) => {
        this.lease.set(l);
        this.acting.set(false);
        this.snackBar.open('Lease unlinked from customer', 'OK', { duration: 3000 });
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

  terminate(dialog: BuiDialog): void {
    if (this.terminateForm.invalid) return;
    this.acting.set(true);
    this.leaseApi.terminate(this.leaseId, { reason: this.terminateForm.value.reason! }).subscribe({
      next: (l) => {
        this.lease.set(l);
        this.acting.set(false);
        this.terminateForm.reset();
        dialog.close();
        this.snackBar.open('Lease terminated', 'OK', { duration: 3000 });
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.acting.set(false);
        this.snackBar.open(
          err?.error?.detail ?? err?.error?.message ?? 'Failed to terminate lease',
          'Close',
          { duration: 4000 },
        );
      },
    });
  }
}
