import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsApiService } from '@/app/domains/settings/data/settings-api.service';
import { IntegrationConfigDto } from '@/app/domains/settings/data/settings.model';
import { LoadingComponent } from '@/app/ui/loading/loading.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    MatCard, MatButton,
    MatFormField, MatLabel, MatInput, MatSlideToggle,
    LoadingComponent,
  ],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        @for (provider of providers(); track provider) {
          <mat-card class="p-4">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold capitalize">{{ provider }}</h2>
            </div>

            @let configs = configsByProvider()[provider] ?? [];
            @if (configs.length === 0) {
              <p class="text-sm text-neutral-a11">No configuration entries for this provider.</p>
            }

            <div class="space-y-3">
              @for (cfg of configs; track cfg.id) {
                <div class="flex items-center gap-4 rounded-lg border p-3">
                  <div class="flex-1">
                    <div class="font-medium text-sm">{{ cfg.configKey }}</div>
                    @if (cfg.description) {
                      <div class="text-xs text-neutral-a11">{{ cfg.description }}</div>
                    }
                  </div>
                  <mat-form-field class="w-64">
                    <mat-label>Value</mat-label>
                    <input matInput
                           [type]="cfg.sensitive ? 'password' : 'text'"
                           [(ngModel)]="editValues[cfg.id]"
                           [placeholder]="cfg.sensitive ? '••••••••' : 'Enter value'" />
                  </mat-form-field>
                  <mat-slide-toggle
                    [checked]="cfg.enabled"
                    (change)="toggleEnabled(cfg, $event.checked)" />
                  <button matButton class="primary" (click)="saveConfig(cfg)">
                    Save
                  </button>
                </div>
              }
            </div>
          </mat-card>
        }
      }
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private readonly settingsApi = inject(SettingsApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly providers = signal<string[]>([]);
  readonly configsByProvider = signal<Record<string, IntegrationConfigDto[]>>({});
  editValues: Record<string, string> = {};

  ngOnInit(): void {
    this.settingsApi.getProviders().subscribe({
      next: providers => {
        this.providers.set(providers);
        let loaded = 0;
        const map: Record<string, IntegrationConfigDto[]> = {};
        if (providers.length === 0) { this.loading.set(false); return; }
        providers.forEach(p => {
          this.settingsApi.getProviderConfig(p).subscribe({
            next: configs => {
              map[p] = configs;
              configs.forEach(c => { this.editValues[c.id] = c.configValue; });
              if (++loaded === providers.length) {
                this.configsByProvider.set({ ...map });
                this.loading.set(false);
              }
            },
            error: () => { if (++loaded === providers.length) this.loading.set(false); },
          });
        });
      },
      error: () => this.loading.set(false),
    });
  }

  saveConfig(cfg: IntegrationConfigDto): void {
    this.settingsApi.updateEntry(cfg.id, { value: this.editValues[cfg.id] }).subscribe({
      next: () => this.snackBar.open('Saved', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Failed to save', 'Close', { duration: 3000 }),
    });
  }

  toggleEnabled(cfg: IntegrationConfigDto, enabled: boolean): void {
    this.settingsApi.setEnabled(cfg.provider, cfg.configKey, enabled).subscribe({
      next: () => { cfg.enabled = enabled; },
      error: () => this.snackBar.open('Failed to update', 'Close', { duration: 3000 }),
    });
  }
}



