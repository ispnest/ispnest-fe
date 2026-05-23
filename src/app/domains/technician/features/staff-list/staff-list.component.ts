import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
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
import { RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/auth/auth.service';
import { StaffApiService } from '@/app/domains/technician/data/staff-api.service';
import { StaffDto } from '@/app/domains/technician/data/staff.model';
import { LoadingComponent } from '@/app/ui/loading';
import { StatusBadgeComponent } from '@/app/ui/status-badge';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    DatePipe,
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
    <div class="mx-auto flex w-full max-w-5xl flex-auto flex-col gap-6 p-6 pt-2 lg:p-10 lg:pt-8">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Staff</h1>
          <p class="text-sm text-neutral-a11">Manage admin, technician and support users.</p>
        </div>
        @if (auth.hasPermission('USERS_WRITE')) {
          <a matButton class="primary" routerLink="/admin/staff/new">
            <mat-icon svgIcon="plus" />
            New Staff
          </a>
        }
      </div>

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        <mat-card>
          <div class="flex flex-col">
            <div class="relative isolate overflow-x-auto overflow-y-hidden">
              <table
                class="whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
                mat-table
                [dataSource]="staff()"
              >
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let s">
                    <div>
                      <div class="font-medium">{{ s.displayName }}</div>
                      <div class="text-xs text-neutral-a9">{{ s.email }}</div>
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let s">
                    <app-status-badge [status]="s.userType" />
                  </td>
                </ng-container>
                <ng-container matColumnDef="phone">
                  <th mat-header-cell *matHeaderCellDef>Phone</th>
                  <td mat-cell *matCellDef="let s">{{ s.phoneNumber ?? '—' }}</td>
                </ng-container>
                <ng-container matColumnDef="lastLogin">
                  <th mat-header-cell *matHeaderCellDef>Last Login</th>
                  <td mat-cell *matCellDef="let s">
                    {{ s.lastLoginAt ? (s.lastLoginAt | date: 'mediumDate') : '—' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let s">
                    @if (auth.hasPermission('USERS_WRITE')) {
                      <a matIconButton [routerLink]="['/admin/staff', s.id]" title="Edit">
                        <mat-icon svgIcon="pencil" />
                      </a>
                    }
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="cols"></tr>
                <tr mat-row *matRowDef="let row; columns: cols"></tr>
              </table>
            </div>
            @if (staff().length === 0) {
              <p class="py-8 text-center text-sm text-neutral-a11">No staff members yet.</p>
            }
          </div>
        </mat-card>
      }
    </div>
  `,
})
export class StaffListComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly staffApi = inject(StaffApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly staff = signal<StaffDto[]>([]);
  readonly cols = ['name', 'type', 'phone', 'lastLogin', 'actions'];

  ngOnInit(): void {
    this.staffApi.getPage(0, 50).subscribe({
      next: (p) => {
        this.staff.set(p.content);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load staff', 'OK', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }
}
