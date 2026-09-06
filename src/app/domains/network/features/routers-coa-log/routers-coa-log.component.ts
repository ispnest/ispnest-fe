import { DatePipe, JsonPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatOption, MatSelect } from '@angular/material/select';
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
import { RouterApiService } from '@/app/domains/network/data';
import { LoadingComponent } from '@/app/ui/loading';
import { RadiusCoaLogDto, RadiusCoaLogFilter, RouterDto } from '../../data/network.model';

@Component({
  selector: 'app-routers-coa-log',
  standalone: true,
  imports: [
    DatePipe,
    JsonPipe,
    FormsModule,
    MatCard,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatDatepickerModule,
    MatPaginator,
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
  ],
  host: {
    class: 'flex flex-auto flex-col',
  },
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">CoA/Disconnect Log</h1>
        <p class="text-sm text-neutral-a11">
          {{ totalElements() }} RADIUS CoA/Disconnect exchanges recorded
        </p>
      </div>

      <mat-card>
        <div class="flex flex-wrap items-end gap-3 border-b border-neutral-a4 p-4">
          <mat-form-field class="min-w-48 flex-1" subscriptSizing="dynamic">
            <mat-label>Username</mat-label>
            <mat-icon svgIcon="search" matPrefix />
            <input
              matInput
              [(ngModel)]="usernameFilter"
              (keyup.enter)="resetAndLoad()"
              placeholder="Account code…"
            />
          </mat-form-field>
          <mat-form-field class="w-48" subscriptSizing="dynamic">
            <mat-label>Router</mat-label>
            <mat-select [(ngModel)]="routerIdFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              @for (r of routers(); track r.id) {
                <mat-option [value]="r.id">{{ r.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field class="w-36" subscriptSizing="dynamic">
            <mat-label>Outcome</mat-label>
            <mat-select [(ngModel)]="outcomeFilter" (ngModelChange)="resetAndLoad()">
              <mat-option value="">All</mat-option>
              <mat-option value="ACK">ACK</mat-option>
              <mat-option value="NAK">NAK</mat-option>
              <mat-option value="TIMEOUT">Timeout</mat-option>
              <mat-option value="ERROR">Error</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field class="w-64" subscriptSizing="dynamic">
            <mat-label>Date range</mat-label>
            <mat-date-range-input [rangePicker]="picker">
              <input
                matStartDate
                placeholder="Since"
                [(ngModel)]="rangeStart"
                (dateChange)="resetAndLoad()"
              />
              <input
                matEndDate
                placeholder="Until"
                [(ngModel)]="rangeEnd"
                (dateChange)="resetAndLoad()"
              />
            </mat-date-range-input>
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-date-range-picker #picker></mat-date-range-picker>
          </mat-form-field>
          <button matButton (click)="resetAndLoad()">
            <mat-icon svgIcon="filter" />
            Apply
          </button>
        </div>

        <app-loading [loading]="loading()" />

        <div class="flex flex-col">
          <div class="relative isolate overflow-x-auto overflow-y-hidden">
            <table
              class="-mt-px w-full whitespace-nowrap [--table-cell-padding-x:--spacing(3)]"
              mat-table
              multiTemplateDataRows
              [dataSource]="entries()"
            >
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Time</th>
                <td mat-cell *matCellDef="let e">{{ e.createdAt | date: 'medium' }}</td>
              </ng-container>
              <ng-container matColumnDef="operation">
                <th mat-header-cell *matHeaderCellDef>Op</th>
                <td mat-cell *matCellDef="let e">{{ e.operation }}</td>
              </ng-container>
              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef>Username</th>
                <td mat-cell *matCellDef="let e" class="font-medium">{{ e.username }}</td>
              </ng-container>
              <ng-container matColumnDef="router">
                <th mat-header-cell *matHeaderCellDef>Router</th>
                <td mat-cell *matCellDef="let e">{{ e.routerName }}</td>
              </ng-container>
              <ng-container matColumnDef="outcome">
                <th mat-header-cell *matHeaderCellDef>Outcome</th>
                <td mat-cell *matCellDef="let e">
                  <span
                    [class]="outcomeClass(e.outcome)"
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  >
                    {{ e.outcome }}{{ e.errorCause ? ' (' + e.errorCause + ')' : '' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="attempts">
                <th mat-header-cell *matHeaderCellDef>Attempts</th>
                <td mat-cell *matCellDef="let e">{{ e.attempts }}</td>
              </ng-container>
              <ng-container matColumnDef="restFallback">
                <th mat-header-cell *matHeaderCellDef>REST fallback</th>
                <td mat-cell *matCellDef="let e">
                  @if (e.restFallbackAttempted) {
                    <span
                      [class]="
                        e.restFallbackOutcome === 'SUCCEEDED'
                          ? 'bg-green-a3 text-green-a11'
                          : 'bg-red-a3 text-red-a11'
                      "
                      class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    >
                      {{ e.restFallbackOutcome }}
                    </span>
                  } @else {
                    <span class="text-neutral-a9">—</span>
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="details">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let e">
                  <button matIconButton (click)="toggleDetail(e); $event.stopPropagation()">
                    <mat-icon [svgIcon]="selected() === e ? 'chevron-up' : 'chevron-down'" />
                  </button>
                </td>
              </ng-container>

              <ng-container matColumnDef="expandedDetail">
                <td mat-cell *matCellDef="let e" [attr.colspan]="cols.length">
                  @if (selected() === e) {
                    <div class="border-l-4 border-primary-a8 bg-primary-a2 p-4 text-sm">
                      <p class="mb-2 font-semibold">
                        {{ e.operation }} — {{ e.username }} &#64; {{ e.routerName }}
                      </p>
                      @if (e.message) {
                        <p class="mb-2 text-neutral-a11">{{ e.message }}</p>
                      }
                      @if (e.restFallbackAttempted && e.restFallbackDetail) {
                        <p class="mb-2 text-neutral-a11">
                          REST fallback detail: {{ e.restFallbackDetail }}
                        </p>
                      }
                      <p class="mb-1 font-medium">Request attributes</p>
                      <pre class="overflow-x-auto rounded-lg bg-neutral-a1 p-3 text-xs">{{
                        e.requestAttributes | json
                      }}</pre>
                    </div>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr
                class="group relative cursor-pointer hover:bg-neutral-a2"
                [class.bg-primary-a2]="selected() === e"
                mat-row
                *matRowDef="let e; columns: cols"
                (click)="toggleDetail(e)"
              ></tr>
              <tr
                mat-row
                *matRowDef="let e; columns: ['expandedDetail']"
                [hidden]="selected() !== e"
              ></tr>
            </table>
          </div>

          <mat-paginator
            class="px-3"
            [length]="totalElements()"
            [pageSize]="pageSize"
            [pageSizeOptions]="[25, 50, 100]"
            (page)="onPage($event)"
            showFirstLastButtons
          />
        </div>
      </mat-card>
    </div>
  `,
})
export class RoutersCoaLogComponent implements OnInit {
  private readonly routerApi = inject(RouterApiService);

  readonly loading = signal(true);
  readonly entries = signal<RadiusCoaLogDto[]>([]);
  readonly totalElements = signal(0);
  readonly routers = signal<RouterDto[]>([]);
  readonly selected = signal<RadiusCoaLogDto | null>(null);
  readonly cols = [
    'createdAt',
    'operation',
    'username',
    'router',
    'outcome',
    'attempts',
    'restFallback',
    'details',
  ];

  usernameFilter = '';
  routerIdFilter = '';
  outcomeFilter = '';
  rangeStart: Date | null = null;
  rangeEnd: Date | null = null;
  pageIndex = 0;
  pageSize = 25;

  ngOnInit(): void {
    this.routerApi.getAll().subscribe((routers) => this.routers.set(routers));
    this.load();
  }

  resetAndLoad(): void {
    this.pageIndex = 0;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const filter: RadiusCoaLogFilter = {
      routerId: this.routerIdFilter || undefined,
      username: this.usernameFilter || undefined,
      outcome: this.outcomeFilter || undefined,
      since: this.rangeStart ? this.rangeStart.toISOString() : undefined,
      until: this.rangeEnd ? this.rangeEnd.toISOString() : undefined,
    };
    this.routerApi.getCoaLog(filter, this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.entries.set(page.content);
        this.totalElements.set(page.page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  toggleDetail(e: RadiusCoaLogDto): void {
    this.selected.set(this.selected() === e ? null : e);
  }

  outcomeClass(outcome: string): string {
    switch (outcome) {
      case 'ACK':
        return 'bg-green-a3 text-green-a11';
      case 'NAK':
        return 'bg-amber-a3 text-amber-a11';
      case 'TIMEOUT':
        return 'bg-orange-a3 text-orange-a11';
      default:
        return 'bg-red-a3 text-red-a11';
    }
  }
}
