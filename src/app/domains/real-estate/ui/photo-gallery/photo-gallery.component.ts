import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { PropertyApiService } from '@/app/domains/real-estate/data/property-api.service';
import { PropertyPhotoDto } from '@/app/domains/real-estate/data/property.model';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, MatButton, MatIconButton, MatIcon, LoadingComponent],
  template: `
    <div class="flex flex-col gap-4">
      @if (!readOnly()) {
        <div>
          <input
            #fileInput
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            (change)="onFilesSelected($event)"
          />
          <button
            matButton
            class="primary"
            type="button"
            [disabled]="uploading()"
            (click)="fileInput.click()"
          >
            <mat-icon svgIcon="upload" />
            {{ uploading() ? 'Uploading…' : 'Upload Photos' }}
          </button>
        </div>
      }

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        @if (photos().length === 0) {
          <div class="flex flex-col items-center gap-2 py-8 text-center text-neutral-a9">
            <mat-icon svgIcon="image" class="size-8 text-neutral-a6" />
            <p class="text-sm">No photos uploaded yet</p>
          </div>
        } @else {
          <div
            cdkDropList
            cdkDropListOrientation="mixed"
            class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            (cdkDropListDropped)="onDrop($event)"
          >
            @for (photo of photos(); track photo.id) {
              <div
                cdkDrag
                [cdkDragDisabled]="readOnly()"
                class="group relative aspect-square overflow-hidden rounded-xl border border-neutral-a5 bg-neutral-a2"
              >
                <img
                  [src]="photo.url"
                  [alt]="photo.originalFilename"
                  class="h-full w-full object-cover"
                />
                @if (!readOnly()) {
                  <div
                    class="absolute inset-x-0 top-0 flex items-center justify-between p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <span cdkDragHandle class="cursor-grab rounded bg-black/50 p-1">
                      <mat-icon svgIcon="grip-vertical" class="size-4 text-white" />
                    </span>
                    <button
                      matIconButton
                      type="button"
                      class="bg-black/50!"
                      (click)="remove(photo)"
                    >
                      <mat-icon svgIcon="trash-2" class="size-4 text-white" />
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class PhotoGalleryComponent implements OnInit {
  readonly propertyId = input.required<string>();
  readonly readOnly = input(false);

  /**
   * Overrides the data source used to load photos. Needed by callers (e.g. the owner portal)
   * whose caller identity can't use the admin PropertyApiService endpoints (they require
   * PROPERTIES_READ, which PROPERTY_OWNER deliberately doesn't have) and must fetch through
   * their own ownership-scoped endpoint instead.
   */
  readonly loadOverride = input<((propertyId: string) => Observable<PropertyPhotoDto[]>) | null>(
    null,
  );

  private readonly propertyApi = inject(PropertyApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly photos = signal<PropertyPhotoDto[]>([]);
  readonly loading = signal(true);
  readonly uploading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const source = this.loadOverride()
      ? this.loadOverride()!(this.propertyId())
      : this.propertyApi.getPhotos(this.propertyId());
    source.subscribe({
      next: (photos) => {
        this.photos.set(photos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (files.length === 0) return;

    this.uploading.set(true);
    let remaining = files.length;
    for (const file of files) {
      this.propertyApi.uploadPhoto(this.propertyId(), file).subscribe({
        next: (photo) => {
          this.photos.update((list) => [...list, photo]);
          remaining -= 1;
          if (remaining === 0) this.uploading.set(false);
        },
        error: () => {
          this.snackBar.open(`Failed to upload ${file.name}`, 'Close', { duration: 4000 });
          remaining -= 1;
          if (remaining === 0) this.uploading.set(false);
        },
      });
    }
  }

  remove(photo: PropertyPhotoDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Photo',
          message: `Are you sure you want to delete "${photo.originalFilename}"?`,
          confirmText: 'Delete',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.propertyApi.deletePhoto(this.propertyId(), photo.id).subscribe({
          next: () => {
            this.photos.update((list) => list.filter((p) => p.id !== photo.id));
            this.snackBar.open('Photo deleted', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Failed to delete photo', 'Close', { duration: 3000 }),
        });
      });
  }

  onDrop(event: CdkDragDrop<PropertyPhotoDto[]>): void {
    if (this.readOnly()) return;
    const list = [...this.photos()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.photos.set(list);
    this.propertyApi.reorderPhotos(this.propertyId(), list.map((p) => p.id)).subscribe({
      error: () => this.snackBar.open('Failed to save photo order', 'Close', { duration: 3000 }),
    });
  }
}
