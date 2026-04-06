import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgOptimizedImage, SlicePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, signal, effect, viewChild, afterNextRender } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatPrefix, MatSuffix } from '@angular/material/input';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';

type Role = {
  id: string;
  label: string;
};

type Status = {
  id: string;
  label: string;
};

type DataSourceFilter = {
  search: string;
  roles: string[];
  statuses: string[];
};

const roleOptions: Role[] = [
  {
    id: 'admin',
    label: 'Admin',
  },
  {
    id: 'member',
    label: 'Member',
  },
];

const statusOptions: Status[] = [
  {
    id: 'active',
    label: 'Active',
  },
  {
    id: 'invited',
    label: 'Invited',
  },
  {
    id: 'expired',
    label: 'Expired',
  },
  {
    id: 'blocked',
    label: 'Blocked',
  },
];

type Column = {
  id: string;
  label: string;
  visible: boolean;
  locked: boolean;
};

type Member = {
  id: number;
  name: string;
  photo: string | null;
  email: string;
  role: string;
  status: string;
};

const members: Member[] = [
  {
    id: 1,
    name: 'Evan Gutmann',
    photo: 'i26glj5ogfrlo5mhggfx2.jpg',
    email: 'evan.gutmann@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 2,
    name: 'Gloria Metz',
    photo: 'kol3jpdula4mvn74wdnns.jpg',
    email: 'gloria.metz@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 3,
    name: 'Lance Parisian',
    photo: null,
    email: 'lance.parisian@example.com',
    role: 'member',
    status: 'blocked',
  },
  {
    id: 4,
    name: 'Lowell Lind',
    photo: 'x05ipzq7r4helr3lzaatp.jpg',
    email: 'lowell.lind@example.com',
    role: 'member',
    status: 'invited',
  },
  {
    id: 5,
    name: 'Alton Rutherford',
    photo: null,
    email: 'alton.rutherford@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 6,
    name: 'Lori Sporer',
    photo: null,
    email: 'lori.sporer@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 7,
    name: 'Derek Kuphal',
    photo: null,
    email: 'derek.kuphal@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 8,
    name: 'Leticia Yundt',
    photo: 'b21kuccvyjfrtqud8drc4.jpg',
    email: 'leticia.yundt@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 9,
    name: 'Emma Ryan',
    photo: null,
    email: 'emma.ryan@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 10,
    name: 'Charles Osinski',
    photo: null,
    email: 'charles.osinski@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 11,
    name: 'Lee Friesen',
    photo: null,
    email: 'lee.friesen@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 12,
    name: 'Muriel Balistreri',
    photo: null,
    email: 'muriel.balistreri@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 13,
    name: 'Ramiro Casper',
    photo: null,
    email: 'ramiro.casper@example.com',
    role: 'admin',
    status: 'expired',
  },
  {
    id: 14,
    name: 'Seth Moore',
    photo: null,
    email: 'seth.moore@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 15,
    name: 'Alexander Shields',
    photo: 'ot79dx7wxgnj6ixi0aszt.jpg',
    email: 'alexander.shields@example.com',
    role: 'admin',
    status: 'invited',
  },
  {
    id: 16,
    name: 'Kelley Schimmel',
    photo: '4ub7cws3f0mjgl5572khj.jpg',
    email: 'kelley.schimmel@example.com',
    role: 'member',
    status: 'blocked',
  },
  {
    id: 17,
    name: 'Leona Botsford',
    photo: null,
    email: 'leona.botsford@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 18,
    name: 'Brenda Lesch',
    photo: '44dqn55r9sdpc1jnin6c4.jpg',
    email: 'brenda.lesch@example.com',
    role: 'member',
    status: 'invited',
  },
  {
    id: 19,
    name: 'Christy Monahan',
    photo: 'm353ex5wbce1xwjx4adve.jpg',
    email: 'christy.monahan@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 20,
    name: 'Stuart Schultz',
    photo: null,
    email: 'stuart.schultz@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 21,
    name: 'Dana Hermiston',
    photo: 'aqvge5v3422q14wmhihyf.jpg',
    email: 'dana.hermiston@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 22,
    name: 'Wilson Altenwerth',
    photo: null,
    email: 'wilson.altenwerth@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 23,
    name: 'Nathan Kutch',
    photo: '4br10olncbmhtdk4j5vkd.jpg',
    email: 'nathan.kutch@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 24,
    name: 'Tom Casper',
    photo: null,
    email: 'tom.casper@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 25,
    name: 'Moses Kihn',
    photo: null,
    email: 'moses.kihn@example.com',
    role: 'admin',
    status: 'invited',
  },
  {
    id: 26,
    name: 'Ray Kuhic',
    photo: 'r1v0gr7ziwzuadynhpv9l.jpg',
    email: 'ray.kuhic@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 27,
    name: 'Bernard Jacobson',
    photo: null,
    email: 'bernard.jacobson@example.com',
    role: 'member',
    status: 'active',
  },
  {
    id: 28,
    name: 'Stuart Tromp',
    photo: 'eaa5z01d7d8tktaz3fp0m.jpg',
    email: 'stuart.tromp@example.com',
    role: 'admin',
    status: 'expired',
  },
  {
    id: 29,
    name: 'Emmett Hamill',
    photo: 'vq3hfstwwku7ghfmf491o.jpg',
    email: 'emmett.hamill@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 30,
    name: 'Janis Considine',
    photo: '1qomnajv82pxv2laucaic.jpg',
    email: 'janis.considine@example.com',
    role: 'member',
    status: 'blocked',
  },
];

@Component({
  selector: 'TeamManagementTable',
  imports: [MatTableModule, NgOptimizedImage, MatPaginator, MatRow, MatRowDef, MatSort, MatSortHeader, MatTable, SlicePipe, TitleCasePipe, CdkDrag, CdkDragHandle, CdkDropList, MatButton, MatCheckbox, MatDivider, MatFormField, MatIcon, MatIconButton, MatInput, MatMenu, MatMenuItem, MatPrefix, MatSuffix, ReactiveFormsModule, MatMenuTrigger, FormsModule, CdkDragPlaceholder],
  template: `
    <div class="flex flex-col">
      <div class="flex items-center gap-x-4">
        <div>
          <h2 class="text-xl font-semibold">Your team</h2>
          <p class="mt-1 text-neutral-a11">Manage your team members and their access to the project.</p>
        </div>

        <div class="ml-auto flex shrink-0 gap-x-3">
          <button matButton class="primary">
            <mat-icon svgIcon="user-plus" />
            Invite members
          </button>
        </div>
      </div>

      <!-- Filters & Actions -->
      <div class="mt-8 flex flex-col items-center gap-2 sm:flex-row">
        <!-- Search field -->
        <mat-form-field class="w-full sm:max-w-100" subscriptSizing="dynamic">
          <mat-icon svgIcon="search" matIconPrefix />
          <input matInput placeholder="Search members by name or email" autocomplete="nope" [(ngModel)]="search" />
          @if (this.search() !== '') {
            <button matIconButton matIconSuffix (click)="clearSearch()">
              <mat-icon svgIcon="x" />
            </button>
          }
        </mat-form-field>

        <div class="flex w-full flex-auto items-center gap-x-2">
          <!-- Role filter -->
          @let roleFilter = this.roleFilter();
          <button matButton [matMenuTriggerFor]="roleFilterMenu">
            <span class="inline-flex items-center gap-x-1.5">
              Role
              @if (roleFilter.length) {
                <span class="rounded-sm bg-neutral-a3 px-1.5 py-0.5 text-xs font-medium text-neutral-a11">
                  {{ roleFilter.length }}
                </span>
              }
            </span>
            <mat-icon iconPositionEnd svgIcon="chevron-down" />
          </button>
          <mat-menu class="theme-indigo min-w-40" #roleFilterMenu>
            <div class="mat-mdc-menu-content" tabindex="-1" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
              @for (option of roleFilterOptions; track option.id) {
                <button mat-menu-item (click)="toggleRoleFilterOption(option)">
                  <mat-checkbox class="pointer-events-none" tabIndex="-1" [checked]="roleFilter.includes(option.id)">
                    {{ option.label }}
                  </mat-checkbox>
                </button>
              }
              @if (roleFilter.length) {
                <mat-divider />
                <button mat-menu-item (click)="clearRoleFilter()">
                  <mat-icon svgIcon="x" />
                  Clear filter
                </button>
              }
            </div>
          </mat-menu>

          <!-- Status filter -->
          @let statusFilter = this.statusFilter();
          <button matButton [matMenuTriggerFor]="statusFilterMenu">
            <span class="inline-flex items-center gap-x-1.5">
              Status
              @if (statusFilter.length) {
                <span class="rounded-sm bg-neutral-a3 px-1.5 py-0.5 text-xs font-medium text-neutral-a11">
                  {{ statusFilter.length }}
                </span>
              }
            </span>
            <mat-icon iconPositionEnd svgIcon="chevron-down" />
          </button>
          <mat-menu class="theme-indigo min-w-40" #statusFilterMenu>
            <div class="mat-mdc-menu-content" tabindex="-1" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
              @for (option of statusFilterOptions; track option.id) {
                <button mat-menu-item (click)="toggleStatusFilterOption(option)">
                  <mat-checkbox class="pointer-events-none" tabIndex="-1" [checked]="statusFilter.includes(option.id)">
                    {{ option.label }}
                  </mat-checkbox>
                </button>
              }
              @if (statusFilter.length) {
                <mat-divider />
                <button mat-menu-item (click)="clearStatusFilter()">
                  <mat-icon svgIcon="x" />
                  Clear filter
                </button>
              }
            </div>
          </mat-menu>

          <!-- Customize menu -->
          <div class="ml-auto">
            <button matButton [matMenuTriggerFor]="customizeMenu" class="tertiary hidden sm:flex">
              <mat-icon svgIcon="settings-2" />
              Customize
            </button>
            <button matIconButton [matMenuTriggerFor]="customizeMenu" class="sm:hidden">
              <mat-icon svgIcon="settings-2" />
            </button>
            <mat-menu class="theme-indigo min-w-40" xPosition="before" #customizeMenu>
              <div class="mat-mdc-menu-content" tabindex="-1" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" cdkDropList (cdkDropListDropped)="drop($event)">
                <div mat-menu-item class="font-medium">Columns</div>
                @for (column of columns(); track column.id) {
                  <button mat-menu-item cdkDrag cdkDragLockAxis="y" cdkDragPreviewContainer="parent" [cdkDragPreviewClass]="['bg-neutral-3', 'dark:bg-neutral-4', 'shadow']" (click)="toggleVisibility(column)">
                    <mat-checkbox class="pointer-events-none" tabindex="-1" [checked]="column.visible" [disabled]="column.locked">
                      {{ column.label }}
                    </mat-checkbox>

                    <div class="flex flex-auto justify-end">
                      <mat-icon cdkDragHandle class="cursor-grab" svgIcon="grip-vertical" />
                    </div>

                    <div *cdkDragPlaceholder class="h-8 rounded-md bg-neutral-a3"></div>
                  </button>
                } @empty {
                  <div mat-menu-item>
                    <span class="text-sm text-neutral-a9">No columns to customize</span>
                  </div>
                }
              </div>
            </mat-menu>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="mt-4 flex flex-col">
        <div class="relative isolate overflow-x-visible overflow-y-hidden">
          <table class="whitespace-nowrap" mat-table [dataSource]="dataSource" [trackBy]="trackBy" matSort>
            <!-- User column -->
            <ng-container matColumnDef="user">
              <th class="w-64" mat-header-cell *matHeaderCellDef mat-sort-header="name">User</th>
              <td mat-cell *matCellDef="let row">
                <div class="flex items-center gap-x-3">
                  @if (row.photo) {
                    <img class="rounded-full object-cover" [ngSrc]="'/images/photos/' + row.photo" width="24" height="24" [alt]="'Avatar image of ' + row.name" />
                  } @else {
                    <div class="flex size-6 items-center justify-center rounded-full bg-neutral-a3 font-semibold text-neutral-a11">
                      {{ row.name | slice: 0 : 1 }}
                    </div>
                  }
                  {{ row.name }}
                </div>
              </td>
            </ng-container>

            <!-- Email column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
              <td mat-cell *matCellDef="let row">
                {{ row.email }}
              </td>
            </ng-container>

            <!-- Role column -->
            <ng-container matColumnDef="role">
              <th class="w-40" mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
              <td mat-cell *matCellDef="let row">
                <div class="inline-flex items-center gap-x-1.5 rounded-md bg-neutral-a4 px-1.5 py-0.5 text-sm">
                  {{ row.role | titlecase }}
                </div>
              </td>
            </ng-container>

            <!-- Status column -->
            <ng-container matColumnDef="status">
              <th class="w-40" mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let row">
                <div class="inline-flex items-center gap-x-1.5 rounded-md bg-neutral-a4 px-1.5 py-0.5 text-sm font-medium">
                  <div class="size-1.5 rounded-full" [class.bg-green-9]="row.status === 'active'" [class.bg-amber-9]="row.status === 'invited'" [class.bg-neutral-9]="row.status === 'expired'" [class.bg-red-9]="row.status === 'blocked'"></div>
                  {{ row.status | titlecase }}
                </div>
              </td>
            </ng-container>

            <!-- Actions column -->
            <ng-container matColumnDef="actions">
              <th class="w-12" mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button matIconButton [matMenuTriggerFor]="memberActions" class="tiny mx-auto">
                  <mat-icon svgIcon="ellipsis-vertical" />
                </button>
                <mat-menu xPosition="before" #memberActions="matMenu">
                  @if (row.status === 'active') {
                    <button mat-menu-item>
                      <mat-icon svgIcon="user-pen" />
                      Change user role
                    </button>
                    <button mat-menu-item>
                      <mat-icon svgIcon="lock-keyhole" />
                      Reset password
                    </button>
                    <button mat-menu-item>
                      <mat-icon svgIcon="shield-x" />
                      Block access
                    </button>
                  }
                  @if (row.status === 'blocked') {
                    <button mat-menu-item>
                      <mat-icon svgIcon="shield-check" />
                      Unblock access
                    </button>
                  }
                  @if (row.status === 'invited' || row.status === 'expired') {
                    <button mat-menu-item>
                      <mat-icon svgIcon="mail-open" />
                      Resend invitation
                    </button>
                    @if (row.status === 'invited') {
                      <button mat-menu-item>
                        <mat-icon svgIcon="shredder" />
                        Cancel invitation
                      </button>
                    }
                  }
                  <mat-divider />
                  <button mat-menu-item>
                    <mat-icon svgIcon="user-x" />
                    Remove from team
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <!-- Header row definition -->
            <tr mat-header-row *matHeaderRowDef="columnIds()"></tr>

            <!-- Row definition -->
            <tr mat-row *matRowDef="let row; columns: columnIds()"></tr>
          </table>
        </div>
        <mat-paginator class="p-2" [length]="members.length" [pageSizeOptions]="[10]" />
      </div>
    </div>
  `,
})
export class TeamManagementTable {
  // Data
  protected members = members;
  protected roleFilterOptions = roleOptions;
  protected statusFilterOptions = statusOptions;

  // State
  protected readonly search = signal<string>('');
  protected readonly roleFilter = signal<string[]>([]);
  protected readonly statusFilter = signal<string[]>([]);

  protected columns = signal<Column[]>([
    {
      id: 'user',
      label: 'User',
      visible: true,
      locked: true,
    },
    {
      id: 'email',
      label: 'Email',
      visible: true,
      locked: false,
    },
    {
      id: 'role',
      label: 'Role',
      visible: true,
      locked: false,
    },
    {
      id: 'status',
      label: 'Status',
      visible: true,
      locked: false,
    },
    {
      id: 'actions',
      label: 'Actions',
      visible: true,
      locked: true,
    },
  ]);
  protected readonly columnIds = computed(() =>
    this.columns()
      .filter((column) => column.visible)
      .map((column) => column.id)
  );

  protected dataSource = new MatTableDataSource(members);
  protected readonly dataSourceFilter = computed<DataSourceFilter>(() => ({
    search: this.search(),
    roles: this.roleFilter(),
    statuses: this.statusFilter(),
  }));

  // Queries
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  // Effects
  private filterEffect = effect(() => {
    this.dataSource.filter = JSON.stringify(this.dataSourceFilter());
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  });

  // Lifecycle
  private afterRenderRef = afterNextRender(() => {
    this.dataSource.paginator = this.paginator() ?? null;
    this.dataSource.sort = this.sort() ?? null;

    this.dataSource.filterPredicate = (data: Member, filter: string) => {
      const parsed = JSON.parse(filter) as DataSourceFilter;

      // Normalize strings for case-insensitive matching
      const searchText = parsed.search.toLowerCase() || '';
      const roleFilter = parsed.roles || [];
      const statusFilter = parsed.statuses || [];

      // Apply filters
      const matchesSearch = !searchText || data.name.toLowerCase().includes(searchText) || data.email.includes(searchText);
      const matchesRoles = roleFilter.length === 0 || roleFilter.includes(data.role);
      const matchesStatuses = statusFilter.length === 0 || statusFilter.includes(data.status);

      return matchesSearch && matchesRoles && matchesStatuses;
    };
    this.dataSource.filter = JSON.stringify(this.dataSourceFilter());
  });

  clearSearch() {
    this.search.set('');
  }

  toggleRoleFilterOption(role: Role) {
    this.roleFilter.update((current) => (current.includes(role.id) ? current.filter((item) => item !== role.id) : [...current, role.id]));
  }

  clearRoleFilter() {
    this.roleFilter.set([]);
  }

  toggleStatusFilterOption(status: Status) {
    this.statusFilter.update((current) => (current.includes(status.id) ? current.filter((item) => item !== status.id) : [...current, status.id]));
  }

  clearStatusFilter() {
    this.statusFilter.set([]);
  }

  drop(event: CdkDragDrop<Column>) {
    const columns = this.columns();
    moveItemInArray(columns, event.previousIndex, event.currentIndex);
    this.columns.set([...columns]);
  }

  toggleVisibility(column: Column) {
    if (column.locked) {
      return;
    }

    this.columns.update((columns) => columns.map((c) => (c.id === column.id ? { ...c, visible: !c.visible } : c)));
  }

  trackBy(_: number, item: Member) {
    return item.id;
  }
}
