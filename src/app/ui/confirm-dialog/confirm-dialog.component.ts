import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export type ConfirmDialogData = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButton],
  template: `
    <h2 mat-dialog-title class="text-lg font-semibold">{{ data.title }}</h2>
    <mat-dialog-content>
      <p class="text-neutral-a11">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <button matButton [mat-dialog-close]="false">{{ data.cancelText ?? 'Cancel' }}</button>
      <button [class]="data.danger ? 'primary destructive' : 'primary'" matButton [mat-dialog-close]="true">
        {{ data.confirmText ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

