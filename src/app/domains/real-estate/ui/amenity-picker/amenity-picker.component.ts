import { Component, OnInit, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatChipListbox, MatChipListboxChange, MatChipOption } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AmenityApiService } from '@/app/domains/real-estate/data/amenity-api.service';
import { AmenityDto } from '@/app/domains/real-estate/data/property.model';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';

@Component({
  selector: 'app-amenity-picker',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatChipListbox,
    MatChipOption,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    LoadingComponent,
  ],
  template: `
    <div class="flex flex-col gap-3">
      <app-loading [loading]="loading()" />

      @if (!loading()) {
        @if (amenities().length === 0) {
          <p class="text-sm text-neutral-a9">No amenities defined yet.</p>
        } @else {
          <mat-chip-listbox multiple (change)="onSelectionChange($event)">
            @for (a of amenities(); track a.id) {
              <mat-chip-option [value]="a.id" [selected]="isSelected(a.id)">
                {{ a.name }}
              </mat-chip-option>
            }
          </mat-chip-listbox>
        }

        <button
          matButton
          type="button"
          class="w-fit"
          (click)="showManage.set(!showManage())"
        >
          <mat-icon svgIcon="settings" />
          {{ showManage() ? 'Done Managing' : 'Manage Amenities' }}
        </button>

        @if (showManage()) {
          <div class="flex flex-col gap-2 rounded-xl border border-neutral-a5 p-3">
            @for (a of amenities(); track a.id) {
              <div class="flex items-center gap-2">
                <mat-form-field class="flex-1" subscriptSizing="dynamic">
                  <input
                    matInput
                    [ngModel]="a.name"
                    (change)="renameAmenity(a, $any($event.target).value)"
                  />
                </mat-form-field>
                <button matIconButton type="button" (click)="deleteAmenity(a)">
                  <mat-icon svgIcon="trash-2" class="size-4" />
                </button>
              </div>
            }
            <div class="flex items-center gap-2 pt-1">
              <mat-form-field class="flex-1" subscriptSizing="dynamic">
                <mat-label>New amenity name</mat-label>
                <input matInput [(ngModel)]="newAmenityName" (keyup.enter)="addAmenity()" />
              </mat-form-field>
              <button matButton type="button" (click)="addAmenity()" [disabled]="!newAmenityName.trim()">
                <mat-icon svgIcon="plus" />
                Add
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class AmenityPickerComponent implements OnInit {
  private readonly amenityApi = inject(AmenityApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly selectedIds = model<string[]>([]);

  readonly amenities = signal<AmenityDto[]>([]);
  readonly loading = signal(true);
  readonly showManage = signal(false);
  newAmenityName = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.amenityApi.list().subscribe({
      next: (list) => {
        this.amenities.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  onSelectionChange(event: MatChipListboxChange): void {
    this.selectedIds.set(event.value as string[]);
  }

  addAmenity(): void {
    const name = this.newAmenityName.trim();
    if (!name) return;
    this.amenityApi.create({ name }).subscribe({
      next: (a) => {
        this.amenities.update((list) => [...list, a]);
        this.newAmenityName = '';
      },
      error: () => this.snackBar.open('Failed to add amenity', 'Close', { duration: 3000 }),
    });
  }

  renameAmenity(a: AmenityDto, name: string): void {
    const trimmed = name.trim();
    if (!trimmed || trimmed === a.name) return;
    this.amenityApi
      .update(a.id, { name: trimmed, icon: a.icon ?? undefined, category: a.category ?? undefined })
      .subscribe({
        next: (updated) => {
          this.amenities.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
        },
        error: () => this.snackBar.open('Failed to rename amenity', 'Close', { duration: 3000 }),
      });
  }

  deleteAmenity(a: AmenityDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Amenity',
          message: `Are you sure you want to delete "${a.name}"? It will be removed from all properties.`,
          confirmText: 'Delete',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.amenityApi.delete(a.id).subscribe({
          next: () => {
            this.amenities.update((list) => list.filter((x) => x.id !== a.id));
            this.selectedIds.update((ids) => ids.filter((id) => id !== a.id));
          },
          error: () => this.snackBar.open('Failed to delete amenity', 'Close', { duration: 3000 }),
        });
      });
  }
}
