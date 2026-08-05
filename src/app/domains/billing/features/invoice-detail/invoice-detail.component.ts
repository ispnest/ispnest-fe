import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InvoiceApiService } from '@/app/domains/billing/data';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';
import { InvoiceDto } from '../../data/billing.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
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
    LoadingComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/billing/invoices">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div class="flex-1">
          <h1 class="text-2xl font-semibold tracking-tight">
            Invoice {{ invoice()?.invoiceNumber }}
          </h1>
          <p class="text-sm text-neutral-a11">Invoice detail</p>
        </div>
        @if (invoice(); as inv) {
          <app-status-badge [status]="inv.status" />
        }
      </div>

      <app-loading [loading]="loading()" />

      @if (invoice(); as inv) {
        <mat-card class="p-6">
          <dl class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                Invoice #
              </dt>
              <dd class="mt-1 font-mono text-sm font-semibold">{{ inv.invoiceNumber }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">Amount</dt>
              <dd class="mt-1 text-lg font-semibold tabular-nums">
                {{ inv.currency }} {{ inv.amount | number: '1.2-2' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                Outstanding
              </dt>
              <dd
                class="mt-1 text-lg font-semibold tabular-nums"
                [class.text-red-a11]="inv.outstandingAmount > 0"
              >
                {{ inv.currency }} {{ inv.outstandingAmount | number: '1.2-2' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">Paid</dt>
              <dd class="mt-1 tabular-nums text-sm">
                {{ inv.currency }} {{ inv.paidAmount | number: '1.2-2' }}
              </dd>
            </div>
            @if (inv.dueDate) {
              <div>
                <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                  Due Date
                </dt>
                <dd class="mt-1 text-sm">{{ inv.dueDate | date: 'mediumDate' }}</dd>
              </div>
            }
            @if (inv.periodStart || inv.periodEnd) {
              <div>
                <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                  Period
                </dt>
                <dd class="mt-1 text-sm">
                  {{ inv.periodStart | date: 'd MMM' }} → {{ inv.periodEnd | date: 'd MMM yyyy' }}
                </dd>
              </div>
            }
            @if (inv.notes) {
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium uppercase tracking-widest text-neutral-a11">
                  Notes
                </dt>
                <dd class="mt-1 text-sm">{{ inv.notes }}</dd>
              </div>
            }
          </dl>

          @if (inv.lineItems.length) {
            <div class="mt-6 border-t border-neutral-a6 pt-4">
              <div class="mb-2 text-xs font-medium uppercase tracking-widest text-neutral-a11">
                Charges
              </div>
              <table mat-table [dataSource]="inv.lineItems" class="w-full">
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.description || chargeTypeLabel(item.chargeType) }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let item">{{ chargeTypeLabel(item.chargeType) }}</td>
                </ng-container>
                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Amount</th>
                  <td mat-cell *matCellDef="let item" class="text-right tabular-nums">
                    {{ inv.currency }} {{ item.amount | number: '1.2-2' }}
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="lineItemCols"></tr>
                <tr mat-row *matRowDef="let row; columns: lineItemCols"></tr>
              </table>
            </div>
          }

          @if (
            inv.status !== 'void' &&
            inv.status !== 'VOID' &&
            inv.status !== 'paid' &&
            inv.status !== 'PAID'
          ) {
            <div class="mt-6 flex justify-end border-t border-neutral-a6 pt-4">
              <button matButton class="warn" (click)="voidInvoice(inv)" [disabled]="voiding()">
                <mat-icon svgIcon="ban" />
                {{ voiding() ? 'Voiding…' : 'Void Invoice' }}
              </button>
            </div>
          }
        </mat-card>
      }
    </div>
  `,
})
export class InvoiceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly invoiceApi = inject(InvoiceApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly voiding = signal(false);
  readonly invoice = signal<InvoiceDto | null>(null);
  readonly lineItemCols = ['description', 'type', 'amount'];

  private static readonly CHARGE_TYPE_LABELS: Record<string, string> = {
    PLAN: 'Internet Plan',
    LEASE_RENT: 'Lease Rent',
    BOOKING_CHARGE: 'Booking Charge',
  };

  chargeTypeLabel(chargeType: string): string {
    return InvoiceDetailComponent.CHARGE_TYPE_LABELS[chargeType] ?? chargeType;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.invoiceApi.getById(id).subscribe({
      next: (inv) => {
        this.invoice.set(inv);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  voidInvoice(inv: InvoiceDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Void Invoice',
          message: `Void invoice ${inv.invoiceNumber}? This cannot be undone.`,
          confirmText: 'Void',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.voiding.set(true);
        this.invoiceApi.voidInvoice(inv.id).subscribe({
          next: (updated) => {
            this.invoice.set(updated);
            this.voiding.set(false);
            this.snackBar.open('Invoice voided', 'OK', { duration: 3000 });
          },
          error: () => {
            this.voiding.set(false);
            this.snackBar.open('Failed to void invoice', 'Close', { duration: 3000 });
          },
        });
      });
  }
}
