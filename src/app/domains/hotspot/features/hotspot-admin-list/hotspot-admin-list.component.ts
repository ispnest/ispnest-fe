import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

/** Admin view: hotspot sessions placeholder — extend with actual API when available */
@Component({
  selector: 'app-hotspot-admin-list',
  standalone: true,
  imports: [MatCard, MatIcon, LoadingComponent, StatusBadgeComponent],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-semibold tracking-tight">Hotspot Sessions</h1>
      <mat-card class="flex flex-col items-center justify-center p-16 text-center">
        <mat-icon svgIcon="wifi" class="mb-4 size-12 text-neutral-a6" />
        <h3 class="text-lg font-semibold">Hotspot Management</h3>
        <p class="mt-1 text-sm text-neutral-a11">
          Manage active hotspot sessions and vouchers here.
        </p>
      </mat-card>
    </div>
  `,
})
export class HotspotAdminListComponent {}

