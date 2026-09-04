import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsApiService } from '@/app/domains/settings/data/settings-api.service';
import { IntegrationConfigDto } from '@/app/domains/settings/data/settings.model';
import { LoadingComponent } from '@/app/ui/loading/loading.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    FormsModule,
    MatCard,
    MatDivider,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatSlideToggle,
    LoadingComponent,
  ],
  template: `
    <div
      class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-4 p-6 pt-2 sm:gap-6 lg:p-10 lg:pt-8"
    >
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
        <p class="mt-1 text-sm text-neutral-a11">
          Manage integration providers and service configurations.
        </p>
      </div>

      <app-loading [loading]="loading()" />

      @if (!loading()) {
        <!-- ── Billing section ─────────────────────────────────────────── -->
        @if (billingConfigs().length > 0) {
          <mat-card>
            <div class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="flex size-9 items-center justify-center rounded-lg bg-amber-a3">
                  <mat-icon svgIcon="receipt" class="size-4 text-amber-a11" />
                </div>
                <div>
                  <h2 class="text-lg font-semibold">Billing</h2>
                  <p class="text-sm text-neutral-a11">Connection fees and charge settings.</p>
                </div>
              </div>
              <div class="space-y-3">
                @for (cfg of billingConfigs(); track cfg.id) {
                  <div class="flex flex-wrap items-center gap-4 rounded-xl border p-4">
                    <div class="flex-1 min-w-48">
                      <div class="text-sm font-medium">
                        @if (cfg.configKey === 'connection_fee') {
                          Connection Fee (KES)
                        } @else if (cfg.configKey === 'charge_grace_days') {
                          Charge Grace Period (days)
                        } @else {
                          {{ cfg.configKey }}
                        }
                      </div>
                      @if (cfg.description) {
                        <div class="mt-0.5 text-xs text-neutral-a11">{{ cfg.description }}</div>
                      }
                    </div>
                    <mat-form-field class="w-40">
                      <mat-label>Value</mat-label>
                      <input matInput type="number" min="0" [(ngModel)]="editValues[cfg.id]" />
                    </mat-form-field>
                    <button matButton class="primary" (click)="saveConfig(cfg)">Save</button>
                  </div>
                }
              </div>
            </div>
          </mat-card>
        }

        <!-- ── Integration providers ───────────────────────────────────── -->
        <mat-card>
          <div class="flex flex-col gap-y-12 p-6">
            @for (provider of providers(); track provider; let last = $last) {
              <div class="grid gap-8 md:grid-cols-3">
                <div>
                  <div class="flex items-center gap-2">
                    <div class="flex size-9 items-center justify-center rounded-lg bg-primary-a3">
                      <mat-icon svgIcon="plug" class="size-4 text-primary-a11" />
                    </div>
                    <h2 class="text-lg font-semibold capitalize">{{ provider }}</h2>
                  </div>
                  <p class="mt-2 text-sm text-neutral-a11">
                    Configuration keys for the {{ provider }} integration.
                  </p>
                </div>

                <div class="md:col-span-2">
                  @let configs = configsByProvider()[provider];
                  @if (configs.length === 0) {
                    <p class="text-sm text-neutral-a11">
                      No configuration entries for this provider.
                    </p>
                  } @else {
                    <div class="space-y-3">
                      @for (cfg of configs; track cfg.id) {
                        <div class="flex flex-wrap items-center gap-4 rounded-xl border p-4">
                          <div class="flex-1 min-w-48">
                            <div class="text-sm font-medium">{{ cfg.configKey }}</div>
                            @if (cfg.description) {
                              <div class="mt-0.5 text-xs text-neutral-a11">
                                {{ cfg.description }}
                              </div>
                            }
                          </div>
                          @if (isMessageTemplate(cfg)) {
                            <mat-form-field class="w-full">
                              <mat-label>Value</mat-label>
                              <textarea
                                matInput
                                rows="4"
                                [(ngModel)]="editValues[cfg.id]"
                                placeholder="Enter message template"
                              ></textarea>
                            </mat-form-field>
                          } @else {
                            <mat-form-field class="w-56">
                              <mat-label>Value</mat-label>
                              <input
                                matInput
                                [type]="cfg.sensitive ? 'password' : 'text'"
                                [(ngModel)]="editValues[cfg.id]"
                                [placeholder]="cfg.sensitive ? '••••••••' : 'Enter value'"
                              />
                            </mat-form-field>
                          }
                          <mat-slide-toggle
                            [checked]="cfg.enabled"
                            (change)="toggleEnabled(cfg, $event.checked)"
                          />
                          <button matButton class="primary" (click)="saveConfig(cfg)">Save</button>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              @if (!last) {
                <mat-divider />
              }
            }
          </div>
        </mat-card>
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
  readonly billingConfigs = signal<IntegrationConfigDto[]>([]);
  editValues: Record<string, string> = {};

  ngOnInit(): void {
    this.settingsApi.getProviders().subscribe({
      next: (providers) => {
        // Load billing separately; show remaining providers in the integration card
        const nonBillingProviders = providers.filter((p) => p !== 'billing');
        this.providers.set(nonBillingProviders);

        this.settingsApi.getProviderConfig('billing').subscribe((configs) => {
          this.billingConfigs.set(configs);
          configs.forEach((c) => {
            this.editValues[c.id] = c.configValue;
          });
        });

        let loaded = 0;
        const map: Record<string, IntegrationConfigDto[]> = {};
        if (nonBillingProviders.length === 0) {
          this.loading.set(false);
          return;
        }
        nonBillingProviders.forEach((p) => {
          this.settingsApi.getProviderConfig(p).subscribe({
            next: (configs) => {
              map[p] = configs;
              configs.forEach((c) => {
                this.editValues[c.id] = c.configValue;
              });
              if (++loaded === nonBillingProviders.length) {
                this.configsByProvider.set({ ...map });
                this.loading.set(false);
              }
            },
            error: () => {
              if (++loaded === nonBillingProviders.length) this.loading.set(false);
            },
          });
        });
      },
      error: () => this.loading.set(false),
    });
  }

  /**
   * Notification message bodies (e.g. `subscription_expiry_template`) are long, multi-line, and
   * full of `[PLACEHOLDER]` tokens — they need a textarea, not the single-line input the rest of
   * the integration config uses. Keyed on the naming convention rather than a per-key list so a
   * newly seeded template picks it up with no frontend change.
   */
  isMessageTemplate(cfg: IntegrationConfigDto): boolean {
    return !cfg.sensitive && cfg.configKey.endsWith('_template');
  }

  saveConfig(cfg: IntegrationConfigDto): void {
    this.settingsApi.updateEntry(cfg.id, { value: this.editValues[cfg.id] }).subscribe({
      next: () => this.snackBar.open('Saved', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Failed to save', 'Close', { duration: 3000 }),
    });
  }

  toggleEnabled(cfg: IntegrationConfigDto, enabled: boolean): void {
    this.settingsApi.setEnabled(cfg.provider, cfg.configKey, enabled).subscribe({
      next: () => {
        cfg.enabled = enabled;
      },
      error: () => this.snackBar.open('Failed to update', 'Close', { duration: 3000 }),
    });
  }
}
