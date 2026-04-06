import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreditApiService } from '../../../core/api/billing-api.service';

@Component({
  selector: 'app-credit-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold text-gray-900">Credits</h1>

      <!-- Manual Credit Form -->
      <mat-card class="p-6 max-w-lg">
        <h2 class="text-lg font-semibold mb-4">Add Manual Credit</h2>
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Customer ID</mat-label>
            <input matInput formControlName="customerId" placeholder="UUID">
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Amount (KES)</mat-label>
            <input matInput type="number" formControlName="amount" min="0.01">
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="2"></textarea>
          </mat-form-field>
          @if (success()) {
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              Credit applied successfully!
            </div>
          }
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Saving…' : 'Apply Credit' }}
          </button>
        </form>
      </mat-card>

      <mat-card class="p-6 text-center text-gray-400">
        <mat-icon class="text-4xl mb-2">account_balance_wallet</mat-icon>
        <p>View customer credit history from the Customer Detail page → Credits tab.</p>
      </mat-card>
    </div>
  `
})
export class CreditListComponent {
  private readonly creditApi = inject(CreditApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);
  readonly success = signal(false);

  form = this.fb.group({
    customerId: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    description: ['']
  });

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.creditApi.addManual(this.form.value as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
        this.form.reset();
      },
      error: (err: any) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.message ?? 'Failed to apply credit', 'Close', { duration: 3000 });
      }
    });
  }
}

