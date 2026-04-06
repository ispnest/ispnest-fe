import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsApiService } from '../../../core/api/settings-api.service';
import { IntegrationConfigDto } from '../../../core/models/settings.model';
import { LoadingComponent } from '../../../shared/components/loading.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTabsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSlideToggleModule, MatChipsModule, LoadingComponent
  ],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
      <app-loading [loading]="loading()" />

      @if (!loading()) {
        <mat-card>
          <mat-tab-group dynamicHeight>
            @for (provider of providers(); track provider) {
              <mat-tab [label]="provider | titlecase">
                <div class="p-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold capitalize">{{ provider }} Configuration</h3>
                    <button mat-stroked-button (click)="openAddForm(provider)">
                      <mat-icon>add</mat-icon> Add Key
                    </button>
                  </div>

                  <mat-table [dataSource]="configMap()[provider] || []" class="w-full">
                    <ng-container matColumnDef="key">
                      <mat-header-cell *matHeaderCellDef>Key</mat-header-cell>
                      <mat-cell *matCellDef="let c" class="font-mono text-sm font-medium">{{ c.configKey }}</mat-cell>
                    </ng-container>
                    <ng-container matColumnDef="value">
                      <mat-header-cell *matHeaderCellDef>Value</mat-header-cell>
                      <mat-cell *matCellDef="let c" class="font-mono text-sm">
                        {{ c.sensitive ? '••••••••' : c.configValue }}
                      </mat-cell>
                    </ng-container>
                    <ng-container matColumnDef="description">
                      <mat-header-cell *matHeaderCellDef>Description</mat-header-cell>
                      <mat-cell *matCellDef="let c" class="text-sm text-gray-500">{{ c.description || '—' }}</mat-cell>
                    </ng-container>
                    <ng-container matColumnDef="enabled">
                      <mat-header-cell *matHeaderCellDef>Enabled</mat-header-cell>
                      <mat-cell *matCellDef="let c">
                        <mat-slide-toggle [checked]="c.enabled" (change)="toggleEnabled(c, $event.checked)"></mat-slide-toggle>
                      </mat-cell>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
                      <mat-cell *matCellDef="let c">
                        <button mat-icon-button (click)="editEntry(c)" title="Edit"><mat-icon>edit</mat-icon></button>
                        <button mat-icon-button (click)="deleteEntry(c)" title="Delete" class="text-red-500"><mat-icon>delete</mat-icon></button>
                      </mat-cell>
                    </ng-container>
                    <mat-header-row *matHeaderRowDef="cols"></mat-header-row>
                    <mat-row *matRowDef="let row; columns: cols;"></mat-row>
                  </mat-table>
                </div>
              </mat-tab>
            }
          </mat-tab-group>
        </mat-card>

        <!-- Add/Edit Form -->
        @if (showForm()) {
          <mat-card class="p-6 max-w-lg">
            <h2 class="text-lg font-semibold mb-4">{{ editingEntry() ? 'Edit Config' : 'Add Config Key' }}</h2>
            <form [formGroup]="form" (ngSubmit)="saveConfig()" class="space-y-4">
              @if (!editingEntry()) {
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Key</mat-label>
                  <input matInput formControlName="key">
                </mat-form-field>
              }
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Value</mat-label>
                <input matInput formControlName="value">
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Description</mat-label>
                <input matInput formControlName="description">
              </mat-form-field>
              <div class="flex gap-3 justify-end">
                <button mat-button type="button" (click)="showForm.set(false)">Cancel</button>
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                  {{ saving() ? 'Saving…' : 'Save' }}
                </button>
              </div>
            </form>
          </mat-card>
        }
      }
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private readonly settingsApi = inject(SettingsApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly providers = signal<string[]>([]);
  readonly configMap = signal<Record<string, IntegrationConfigDto[]>>({});
  readonly editingEntry = signal<IntegrationConfigDto | null>(null);
  readonly activeProvider = signal('');
  readonly cols = ['key', 'value', 'description', 'enabled', 'actions'];

  form = this.fb.group({
    key: [''],
    value: ['', Validators.required],
    description: [''],
    sensitive: [false]
  });

  ngOnInit(): void {
    this.settingsApi.getProviders().subscribe({
      next: providers => {
        this.providers.set(providers);
        let loaded = 0;
        const map: Record<string, IntegrationConfigDto[]> = {};
        providers.forEach(p => {
          this.settingsApi.getProviderConfig(p).subscribe(entries => {
            map[p] = entries;
            if (++loaded === providers.length) {
              this.configMap.set({ ...map });
              this.loading.set(false);
            }
          });
        });
        if (providers.length === 0) this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openAddForm(provider: string): void {
    this.editingEntry.set(null);
    this.activeProvider.set(provider);
    this.form.reset({ key: '', value: '', description: '', sensitive: false });
    this.showForm.set(true);
  }

  editEntry(entry: IntegrationConfigDto): void {
    this.editingEntry.set(entry);
    this.activeProvider.set(entry.provider);
    this.form.patchValue({ value: '', description: entry.description ?? '' });
    this.showForm.set(true);
  }

  saveConfig(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    const entry = this.editingEntry();
    const provider = this.activeProvider();
    const onSuccess = () => {
      this.saving.set(false);
      this.showForm.set(false);
      this.snackBar.open('Saved', 'OK', { duration: 2000 });
      this.refreshProvider(provider);
    };
    const onError = (err: any) => {
      this.saving.set(false);
      this.snackBar.open(err?.error?.message ?? 'Error', 'Close', { duration: 3000 });
    };

    if (entry) {
      this.settingsApi.updateEntry(entry.id, { value: v.value! }).subscribe({ next: onSuccess, error: onError });
    } else {
      this.settingsApi.setConfig(provider, v.key!, { value: v.value!, description: v.description, sensitive: v.sensitive ?? false }).subscribe({ next: onSuccess, error: onError });
    }
  }

  toggleEnabled(entry: IntegrationConfigDto, enabled: boolean): void {
    this.settingsApi.setEnabled(entry.provider, entry.configKey, enabled).subscribe({
      next: () => this.snackBar.open(`${enabled ? 'Enabled' : 'Disabled'}`, 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Failed to toggle', 'Close', { duration: 3000 })
    });
  }

  deleteEntry(entry: IntegrationConfigDto): void {
    this.settingsApi.deleteConfig(entry.provider, entry.configKey).subscribe({
      next: () => { this.refreshProvider(entry.provider); this.snackBar.open('Deleted', 'OK', { duration: 2000 }); },
      error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
    });
  }

  private refreshProvider(provider: string): void {
    this.settingsApi.getProviderConfig(provider).subscribe(entries => {
      this.configMap.update(m => ({ ...m, [provider]: entries }));
    });
  }
}


