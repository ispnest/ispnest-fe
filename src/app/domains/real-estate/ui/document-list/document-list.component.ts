import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { PropertyApiService } from '@/app/domains/real-estate/data/property-api.service';
import {
  PropertyDocumentDto,
  PropertyDocumentType,
} from '@/app/domains/real-estate/data/property.model';
import { ConfirmDialogComponent } from '@/app/ui/confirm-dialog';
import { LoadingComponent } from '@/app/ui/loading';

const DOCUMENT_TYPE_LABELS: Record<PropertyDocumentType, string> = {
  TITLE_DEED: 'Title Deed',
  OWNER_ID: 'Owner ID',
  INSPECTION_REPORT: 'Inspection Report',
  LEASE_AGREEMENT: 'Lease Agreement',
  BOOKING_CONFIRMATION: 'Booking Confirmation',
  GUEST_ID_DOCUMENT: 'Guest ID Document',
  OTHER: 'Other',
};

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    LoadingComponent,
  ],
  template: `
    <div class="flex flex-col gap-4">
      @if (!readOnly()) {
        <div class="flex flex-wrap items-end gap-3">
          <mat-form-field class="w-52" subscriptSizing="dynamic">
            <mat-label>Document type</mat-label>
            <mat-select [(ngModel)]="uploadDocType">
              @for (t of documentTypes; track t.value) {
                <mat-option [value]="t.value">{{ t.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <input
            #fileInput
            type="file"
            class="hidden"
            (change)="onFileSelected($event)"
          />
          <button
            matButton
            class="primary"
            type="button"
            [disabled]="uploading()"
            (click)="fileInput.click()"
          >
            <mat-icon svgIcon="upload" />
            {{ uploading() ? 'Uploading…' : 'Upload Document' }}
          </button>
        </div>
      }

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        @if (documents().length === 0) {
          <div class="flex flex-col items-center gap-2 py-8 text-center text-neutral-a9">
            <mat-icon svgIcon="file-text" class="size-8 text-neutral-a6" />
            <p class="text-sm">No documents uploaded yet</p>
          </div>
        } @else {
          <div class="flex flex-col divide-y divide-neutral-a4 rounded-xl border border-neutral-a5">
            @for (doc of documents(); track doc.id) {
              <div class="flex items-center gap-3 p-3">
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-a3"
                >
                  <mat-icon svgIcon="file-text" class="size-4 text-neutral-a11" />
                </div>
                <div class="min-w-0 flex-1">
                  <a
                    [href]="doc.url"
                    target="_blank"
                    rel="noopener"
                    class="truncate text-sm font-medium text-primary-a11 hover:underline block"
                  >
                    {{ doc.originalFilename }}
                  </a>
                  <div class="mt-0.5 flex items-center gap-2 text-xs text-neutral-a9">
                    <span
                      class="rounded-full bg-neutral-a3 px-2 py-0.5 font-medium text-neutral-a11"
                    >
                      {{ typeLabel(doc.documentType) }}
                    </span>
                    <span>{{ doc.createdAt | date: 'mediumDate' }}</span>
                  </div>
                </div>
                <a matIconButton [href]="doc.url" target="_blank" rel="noopener" download>
                  <mat-icon svgIcon="download" class="size-4" />
                </a>
                @if (!readOnly()) {
                  <button matIconButton type="button" (click)="remove(doc)">
                    <mat-icon svgIcon="trash-2" class="size-4" />
                  </button>
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class DocumentListComponent implements OnInit {
  readonly propertyId = input.required<string>();
  readonly readOnly = input(false);

  /**
   * Overrides the data source used to load documents. Needed by callers (e.g. the owner portal)
   * whose caller identity can't use the admin PropertyApiService endpoints (they require
   * PROPERTIES_READ, which PROPERTY_OWNER deliberately doesn't have) and must fetch through
   * their own ownership-scoped endpoint instead.
   */
  readonly loadOverride = input<
    ((propertyId: string) => Observable<PropertyDocumentDto[]>) | null
  >(null);

  /** Default selection for the upload type picker — e.g. LEASE_AGREEMENT from a lease's detail page. */
  readonly initialType = input<PropertyDocumentType | null>(null);

  private readonly propertyApi = inject(PropertyApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly documents = signal<PropertyDocumentDto[]>([]);
  readonly loading = signal(true);
  readonly uploading = signal(false);

  readonly documentTypes = (
    Object.keys(DOCUMENT_TYPE_LABELS) as PropertyDocumentType[]
  ).map((value) => ({ value, label: DOCUMENT_TYPE_LABELS[value] }));

  uploadDocType: PropertyDocumentType = 'OTHER';

  ngOnInit(): void {
    this.uploadDocType = this.initialType() ?? 'OTHER';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const source = this.loadOverride()
      ? this.loadOverride()!(this.propertyId())
      : this.propertyApi.getDocuments(this.propertyId());
    source.subscribe({
      next: (documents) => {
        this.documents.set(documents);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  typeLabel(type: PropertyDocumentType): string {
    return DOCUMENT_TYPE_LABELS[type] ?? type;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploading.set(true);
    this.propertyApi.uploadDocument(this.propertyId(), file, this.uploadDocType).subscribe({
      next: (doc) => {
        this.documents.update((list) => [...list, doc]);
        this.uploading.set(false);
      },
      error: () => {
        this.snackBar.open(`Failed to upload ${file.name}`, 'Close', { duration: 4000 });
        this.uploading.set(false);
      },
    });
  }

  remove(doc: PropertyDocumentDto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Document',
          message: `Are you sure you want to delete "${doc.originalFilename}"?`,
          confirmText: 'Delete',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.propertyApi.deleteDocument(this.propertyId(), doc.id).subscribe({
          next: () => {
            this.documents.update((list) => list.filter((d) => d.id !== doc.id));
            this.snackBar.open('Document deleted', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Failed to delete document', 'Close', { duration: 3000 }),
        });
      });
  }
}
