import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PlanApiService } from '../../../core/api/plan-api.service';
import { PlanDto } from '../../../core/models/plan.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { LoadingComponent } from '../../../shared/components/loading.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatChipsModule,
    StatusBadgeComponent, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Plans</h1>
        <a mat-flat-button color="primary" routerLink="/admin/plans/new">
          <mat-icon>add</mat-icon> New Plan
        </a>
      </div>
      <mat-card>
        <app-loading [loading]="loading()" />
        <mat-table [dataSource]="plans()" class="w-full">
            <ng-container matColumnDef="name">
              <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
              <mat-cell *matCellDef="let p">
                <div>
                  <div class="font-medium">{{ p.name }}</div>
                  @if (p.badge) { <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{{ p.badge }}</span> }
                </div>
              </mat-cell>
            </ng-container>
            <ng-container matColumnDef="type">
              <mat-header-cell *matHeaderCellDef>Type</mat-header-cell>
              <mat-cell *matCellDef="let p" class="capitalize">{{ p.type }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="price">
              <mat-header-cell *matHeaderCellDef>Price</mat-header-cell>
              <mat-cell *matCellDef="let p" class="font-semibold">KES {{ p.price | number:'1.0-0' }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="validity">
              <mat-header-cell *matHeaderCellDef>Validity</mat-header-cell>
              <mat-cell *matCellDef="let p">{{ p.validity }} {{ p.validityUnit }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="enabled">
              <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
              <mat-cell *matCellDef="let p">
                <app-status-badge [status]="p.enabled ? 'active' : 'inactive'" />
              </mat-cell>
            </ng-container>
            <ng-container matColumnDef="actions">
              <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
              <mat-cell *matCellDef="let p">
                <button mat-icon-button [matMenuTriggerFor]="menu" [matMenuTriggerData]="{plan: p}">
                  <mat-icon>more_vert</mat-icon>
                </button>
              </mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="cols"></mat-header-row>
            <mat-row *matRowDef="let row; columns: cols;"></mat-row>
          </mat-table>
          <mat-paginator
            [length]="totalElements()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)"
            showFirstLastButtons>
          </mat-paginator>
      </mat-card>
    </div>

    <mat-menu #menu="matMenu">
      <ng-template matMenuContent let-plan="plan">
        <a mat-menu-item [routerLink]="['/admin/plans', plan.id, 'edit']">
          <mat-icon>edit</mat-icon> Edit
        </a>
        <button mat-menu-item (click)="deletePlan(plan)" class="text-red-600">
          <mat-icon>delete</mat-icon> Delete
        </button>
      </ng-template>
    </mat-menu>
  `
})
export class PlanListComponent implements OnInit {
  private readonly planApi = inject(PlanApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly plans = signal<PlanDto[]>([]);
  readonly totalElements = signal(0);
  readonly cols = ['name', 'type', 'price', 'validity', 'enabled', 'actions'];

  pageIndex = 0;
  pageSize = 20;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.planApi.getPage(this.pageIndex, this.pageSize).subscribe({
      next: page => { this.plans.set(page.content); this.totalElements.set(page.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onPage(e: PageEvent): void { this.pageIndex = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  deletePlan(plan: PlanDto): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Plan', message: `Delete "${plan.name}"?`, confirmText: 'Delete', danger: true }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.planApi.delete(plan.id).subscribe({
        next: () => { this.plans.update(list => list.filter(p => p.id !== plan.id)); this.totalElements.update(n => n - 1); },
        error: () => this.snackBar.open('Failed to delete plan', 'Close', { duration: 3000 })
      });
    });
  }
}






