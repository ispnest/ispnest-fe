import { Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GrantPortalAccessResponse } from '@/app/domains/real-estate/data/owner.model';

@Component({
  selector: 'app-portal-access-result-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButton, MatIconButton, MatIcon],
  template: `
    <h2 mat-dialog-title class="text-lg font-semibold">Portal Access Granted</h2>
    <mat-dialog-content>
      <div
        class="mb-4 flex items-start gap-2 rounded-lg border border-amber-a6 bg-amber-a3 p-3 text-sm text-amber-a11"
      >
        <mat-icon svgIcon="triangle-alert" class="size-4 shrink-0" />
        <span
          >This password will not be shown again. Copy it now and share it securely with the
          owner.</span
        >
      </div>
      <div class="flex flex-col gap-3">
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-a9">Email</p>
          <div class="flex items-center gap-2 rounded-lg border border-neutral-a5 bg-neutral-a2 p-2">
            <span class="flex-1 truncate font-mono text-sm">{{ data.email }}</span>
            <button matIconButton type="button" (click)="copy(data.email)">
              <mat-icon svgIcon="copy" class="size-4" />
            </button>
          </div>
        </div>
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-a9">
            Initial Password
          </p>
          <div class="flex items-center gap-2 rounded-lg border border-neutral-a5 bg-neutral-a2 p-2">
            <span class="flex-1 truncate font-mono text-sm">{{ data.initialPassword }}</span>
            <button matIconButton type="button" (click)="copy(data.initialPassword)">
              <mat-icon svgIcon="copy" class="size-4" />
            </button>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <button matButton class="primary" [mat-dialog-close]="true">Done</button>
    </mat-dialog-actions>
  `,
})
export class PortalAccessResultDialogComponent {
  readonly dialogRef = inject<MatDialogRef<PortalAccessResultDialogComponent>>(MatDialogRef);
  readonly data = inject<GrantPortalAccessResponse>(MAT_DIALOG_DATA);
  private readonly snackBar = inject(MatSnackBar);

  copy(value: string): void {
    navigator.clipboard.writeText(value).then(() => {
      this.snackBar.open('Copied to clipboard', 'OK', { duration: 2000 });
    });
  }
}
