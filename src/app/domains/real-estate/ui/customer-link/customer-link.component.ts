import { Component, OnChanges, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { CustomerApiService } from '@/app/domains/customers/data/customer-api.service';
import { CustomerDto } from '@/app/domains/customers/data/customer.model';

/**
 * Bridges a Renter/Guest to an existing ISP customer so rent/booking charges can flow through the
 * billing pipeline (Milestone 4). Dumb component — the parent owns the actual link/unlink API
 * call and passes the resulting `linkedCustomerId` back down.
 */
@Component({
  selector: 'app-customer-link',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatInput,
    MatButton,
    MatIcon,
  ],
  template: `
    <div class="flex flex-col gap-3">
      @if (linkedCustomerId()) {
        <div class="flex items-center justify-between gap-3 rounded-lg border border-neutral-a5 p-3">
          <a
            [routerLink]="['/admin/customers', linkedCustomerId()]"
            class="flex items-center gap-2 text-sm font-medium text-primary-a11 hover:underline"
          >
            <mat-icon svgIcon="link" class="size-4" />
            {{ linkedCustomer()?.fullName || 'View customer' }}
          </a>
          @if (canWrite()) {
            <button matButton type="button" [disabled]="acting()" (click)="unlinkCustomer.emit()">
              Unlink
            </button>
          }
        </div>
      } @else if (canWrite()) {
        <mat-form-field subscriptSizing="dynamic">
          <mat-label>Link ISP customer</mat-label>
          <input
            matInput
            [formControl]="searchControl"
            [matAutocomplete]="customerAuto"
            placeholder="Search customer by name…"
          />
          <mat-autocomplete
            #customerAuto="matAutocomplete"
            [displayWith]="displayCustomer"
            (optionSelected)="onSelected($event.option.value)"
          >
            @for (c of results(); track c.id) {
              <mat-option [value]="c">{{ c.fullName }} ({{ c.accountCode }})</mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>
        <p class="text-xs text-neutral-a9">
          Optional — only needed if this person is also an internet subscriber. Linking enables
          billing rent/charges through their ISP account.
        </p>
      } @else {
        <p class="text-sm text-neutral-a9">Not linked to an ISP customer.</p>
      }
    </div>
  `,
})
export class CustomerLinkComponent implements OnChanges {
  private readonly customerApi = inject(CustomerApiService);

  readonly linkedCustomerId = input<string | null>(null);
  readonly canWrite = input(false);
  readonly acting = input(false);

  readonly linkCustomer = output<string>();
  readonly unlinkCustomer = output<void>();

  readonly searchControl = new FormControl('');
  readonly results = signal<CustomerDto[]>([]);
  readonly linkedCustomer = signal<CustomerDto | null>(null);

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.searchControl.valueChanges.subscribe((value) => this.search(value));
  }

  ngOnChanges(): void {
    const id = this.linkedCustomerId();
    if (id && this.linkedCustomer()?.id !== id) {
      this.customerApi.getById(id).subscribe({
        next: (c) => this.linkedCustomer.set(c),
        error: () => this.linkedCustomer.set(null),
      });
    } else if (!id) {
      this.linkedCustomer.set(null);
    }
  }

  private search(value: string | null): void {
    const query = (value ?? '').trim();
    if (typeof value === 'object') return; // an option was just selected, not typed
    clearTimeout(this.searchTimeout);
    if (!query) {
      this.results.set([]);
      return;
    }
    this.searchTimeout = setTimeout(() => {
      this.customerApi
        .getPage(0, 10, 'fullName', 'asc', query)
        .subscribe((page) => this.results.set(page.content));
    }, 250);
  }

  displayCustomer(customer: CustomerDto | string | null): string {
    if (!customer) return '';
    return typeof customer === 'string' ? customer : customer.fullName;
  }

  onSelected(customer: CustomerDto): void {
    this.linkCustomer.emit(customer.id);
  }
}
