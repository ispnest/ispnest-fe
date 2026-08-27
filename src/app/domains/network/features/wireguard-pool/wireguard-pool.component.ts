import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { WireGuardConfigPoolApiService } from '@/app/domains/network/data';
import { FileDropzoneComponent } from '@/app/ui/file-dropzone';
import { LoadingComponent } from '@/app/ui/loading';

/**
 * Admin management of the pre-provisioned WireGuard config pool — ingests `.conf` files produced by
 * the externally-managed WireGuard server this project does not operate, and shows available/
 * assigned counts so operators can see when they're running low. The backend only exposes aggregate
 * counts, not a per-entry list, so this page is intentionally minimal.
 */
@Component({
  selector: 'app-wireguard-pool',
  standalone: true,
  imports: [RouterLink, MatCard, MatIconButton, MatIcon, FileDropzoneComponent, LoadingComponent],
  host: { class: 'flex flex-auto flex-col' },
  template: `
    <div
      class="mx-auto flex w-full max-w-3xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <div class="flex items-center gap-3">
        <a matIconButton routerLink="/admin/routers">
          <mat-icon svgIcon="arrow-left" />
        </a>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">WireGuard Config Pool</h1>
          <p class="text-sm text-neutral-a11">
            Pre-provisioned configs claimed one-per-router at enrollment
          </p>
        </div>
      </div>

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        <mat-card class="p-4">
          <h2 class="mb-3 text-sm font-semibold">Inventory</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg border border-neutral-a6 bg-neutral-a2 p-4 text-center">
              <p class="text-2xl font-semibold">{{ inventory()?.available ?? 0 }}</p>
              <p class="text-xs text-neutral-a10">Available</p>
            </div>
            <div class="rounded-lg border border-neutral-a6 bg-neutral-a2 p-4 text-center">
              <p class="text-2xl font-semibold">{{ inventory()?.assigned ?? 0 }}</p>
              <p class="text-xs text-neutral-a10">Assigned</p>
            </div>
          </div>
        </mat-card>

        <mat-card class="p-4">
          <h2 class="mb-3 text-sm font-semibold">Upload a Config</h2>
          <app-file-dropzone
            accept=".conf"
            label="Click to upload a WireGuard .conf file"
            hint="Or drag and drop"
            (fileSelected)="upload($event)"
          />
          @if (uploading()) {
            <p class="mt-2 text-sm text-neutral-a10">Uploading…</p>
          }
        </mat-card>
      }
    </div>
  `,
})
export class WireguardPoolComponent implements OnInit {
  private readonly api = inject(WireGuardConfigPoolApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly inventory = signal<{ available: number; assigned: number } | null>(null);

  ngOnInit(): void {
    this.loadInventory();
  }

  private loadInventory(): void {
    this.loading.set(true);
    this.api.getInventory().subscribe({
      next: (inventory) => {
        this.inventory.set(inventory);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  upload(file: File): void {
    this.uploading.set(true);
    this.api.upload(file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.snackBar.open('WireGuard config uploaded', 'OK', { duration: 3000 });
        this.loadInventory();
      },
      error: () => {
        this.uploading.set(false);
        this.snackBar.open('Failed to upload config', 'Close', { duration: 3000 });
      },
    });
  }
}
