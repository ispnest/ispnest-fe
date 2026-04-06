import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [MatCard, MatIcon],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-semibold tracking-tight">Technician Dashboard</h1>

      <mat-card class="flex flex-col items-center justify-center p-16 text-center">
        <mat-icon svgIcon="wrench" class="mb-4 size-12 text-neutral-a6" />
        <h3 class="text-lg font-semibold">Field Technician Tools</h3>
        <p class="mt-1 text-sm text-neutral-a11">
          Manage field assignments, installations, and service tickets here.
        </p>
      </mat-card>
    </div>
  `,
})
export class TechnicianDashboardComponent {}

