import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CreatePoolRequest,
  DeploymentMode,
  DiscoveredItem,
  FirewallProfile,
  PoolApiService,
  PoolDto,
  ProvisioningProfileDto,
  RouterOnboardingApiService,
  TopologySplit,
} from '@/app/domains/network/data';

/**
 * A router's services/topology/pools form — shared between the create wizard's first-time setup
 * (no `initialProfile`) and the onboarding hub's post-onboarding edit (`initialProfile` pre-fills
 * it, and re-saving is a plain upsert against the same endpoint).
 */
@Component({
  selector: 'app-provisioning-profile-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatDivider,
    MatCheckbox,
    MatFormField,
    MatLabel,
    MatHint,
    MatIcon,
    MatInput,
    MatRadioGroup,
    MatRadioButton,
    MatSelect,
    MatOption,
  ],
  template: `
    <form [formGroup]="form" class="flex flex-col gap-y-5">
      <div>
        <h3 class="mb-2 text-sm font-semibold">Router services</h3>
        <div class="flex flex-col gap-2">
          <mat-checkbox formControlName="hotspotEnabled">Hotspot</mat-checkbox>
          <mat-checkbox formControlName="pppoeEnabled">PPPoE</mat-checkbox>
        </div>
        <p class="mt-1 text-xs text-neutral-a10">
          Leave both unchecked for management-only (no customer service configured).
        </p>
      </div>

      <mat-divider />

      <div>
        <h3 class="mb-2 text-sm font-semibold">Network deployment</h3>
        <mat-radio-group formControlName="topologySplit" class="flex flex-col gap-2">
          <mat-radio-button value="VLAN">VLAN-based</mat-radio-button>
          <mat-radio-button value="BRIDGE">Interface-based</mat-radio-button>
        </mat-radio-group>
      </div>

      @if (discoveredInterfaces().length > 0) {
        <mat-form-field class="w-full">
          <mat-label>LAN interface</mat-label>
          <mat-select formControlName="lanInterface" required>
            @for (iface of discoveredInterfaces(); track interfaceName(iface)) {
              <mat-option [value]="interfaceName(iface)">{{ interfaceLabel(iface) }}</mat-option>
            }
          </mat-select>
          <mat-hint>The physical interface these services attach to</mat-hint>
        </mat-form-field>
      } @else {
        <mat-form-field class="w-full">
          <mat-label>LAN interface</mat-label>
          <input matInput formControlName="lanInterface" placeholder="ether2" required />
          <mat-hint>
            @if (discoveryState() === 'loading') {
              Loading interfaces from router…
            } @else {
              The physical interface these services attach to
              @if (discoveryState() === 'unavailable') {
                (router unreachable — enter it manually)
              }
            }
          </mat-hint>
        </mat-form-field>
      }

      @if (form.value.topologySplit === 'VLAN') {
        <div class="grid grid-cols-2 gap-4">
          @if (form.value.hotspotEnabled) {
            <mat-form-field>
              <mat-label>Hotspot VLAN ID</mat-label>
              <input matInput type="number" formControlName="hotspotVlanId" />
              @if (vlanCollision(form.value.hotspotVlanId ?? null)) {
                <mat-hint class="text-amber-a11">Already in use on this router</mat-hint>
              }
            </mat-form-field>
          }
          @if (form.value.pppoeEnabled) {
            <mat-form-field>
              <mat-label>PPPoE VLAN ID</mat-label>
              <input matInput type="number" formControlName="pppoeVlanId" />
              @if (vlanCollision(form.value.pppoeVlanId ?? null)) {
                <mat-hint class="text-amber-a11">Already in use on this router</mat-hint>
              }
            </mat-form-field>
          }
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-4">
          @if (form.value.hotspotEnabled) {
            <mat-form-field>
              <mat-label>Hotspot bridge name</mat-label>
              <input matInput formControlName="hotspotBridgeName" />
            </mat-form-field>
          }
          @if (form.value.pppoeEnabled) {
            <mat-form-field>
              <mat-label>PPPoE bridge name</mat-label>
              <input matInput formControlName="pppoeBridgeName" />
            </mat-form-field>
          }
        </div>
      }

      @if (form.value.hotspotEnabled || form.value.pppoeEnabled) {
        <mat-divider />
        <div>
          <h3 class="mb-2 text-sm font-semibold">IP pools</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            @if (form.value.hotspotEnabled) {
              <mat-form-field>
                <mat-label>Hotspot pool</mat-label>
                <mat-select formControlName="hotspotPoolId">
                  @for (pool of pools(); track pool.id) {
                    <mat-option [value]="pool.id">{{ pool.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
            @if (form.value.pppoeEnabled) {
              <mat-form-field>
                <mat-label>PPPoE pool</mat-label>
                <mat-select formControlName="pppoePoolId">
                  @for (pool of pools(); track pool.id) {
                    <mat-option [value]="pool.id">{{ pool.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
          </div>
          @if (pools().length === 0) {
            <p class="mt-2 text-xs text-neutral-a10">
              No pools yet for this router — create one below.
            </p>
          }

          @if (!showNewPool()) {
            <button matButton class="tertiary mt-2" type="button" (click)="showNewPool.set(true)">
              <mat-icon svgIcon="plus" class="size-4" /> New pool
            </button>
          } @else {
            <form
              [formGroup]="newPoolForm"
              class="mt-3 flex flex-col gap-3 rounded-lg border border-neutral-a6 p-3"
            >
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <mat-form-field>
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" />
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Gateway</mat-label>
                  <input matInput formControlName="localIp" placeholder="10.20.0.1" />
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Range</mat-label>
                  <input
                    matInput
                    formControlName="rangeIp"
                    placeholder="10.20.0.0/24"
                    (blur)="checkNewPoolOverlap()"
                  />
                  @if (poolOverlapWarning(); as warning) {
                    <mat-hint class="text-amber-a11">{{ warning }}</mat-hint>
                  }
                </mat-form-field>
              </div>
              <div class="flex justify-end gap-2">
                <button matButton class="tertiary" type="button" (click)="cancelNewPool()">
                  Cancel
                </button>
                <button
                  matButton
                  class="primary"
                  type="button"
                  [disabled]="newPoolForm.invalid || creatingPool()"
                  (click)="createPool()"
                >
                  {{ creatingPool() ? 'Creating…' : 'Create pool' }}
                </button>
              </div>
            </form>
          }
        </div>

        <mat-form-field class="w-full">
          <mat-label>Firewall profile</mat-label>
          <mat-select formControlName="firewallProfile">
            <mat-option value="basic">Basic</mat-option>
            <mat-option value="hardened">Hardened</mat-option>
            <mat-option value="strict">Strict</mat-option>
          </mat-select>
        </mat-form-field>
      }

      @if (error()) {
        <p class="text-sm text-red-a11">{{ error() }}</p>
      }

      <div class="flex justify-end pt-2">
        <button
          matButton
          class="primary"
          type="button"
          [disabled]="form.invalid || saving()"
          (click)="save()"
        >
          {{ saving() ? 'Saving…' : submitLabel() }}
        </button>
      </div>
    </form>
  `,
})
export class ProvisioningProfileFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingApi = inject(RouterOnboardingApiService);
  private readonly poolApi = inject(PoolApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly routerId = input.required<string>();
  readonly initialProfile = input<ProvisioningProfileDto | undefined>(undefined);
  readonly submitLabel = input('Save');
  readonly saved = output<ProvisioningProfileDto>();

  readonly pools = signal<PoolDto[]>([]);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly showNewPool = signal(false);
  readonly creatingPool = signal(false);

  /**
   * Discovery is additive, never blocking: 'loading' shows a spinner-adjacent hint, 'ready' swaps
   * the LAN interface field to a real dropdown, 'unavailable' (router not yet reachable — no REST
   * credential yet, or a genuine connectivity failure) falls back to the original free-text input.
   * See `RouterDiscoveryService`/`RouterDiscoveryController` on the backend.
   */
  readonly discoveryState = signal<'loading' | 'ready' | 'unavailable'>('loading');
  readonly discoveredInterfaces = signal<DiscoveredItem[]>([]);
  readonly discoveredVlans = signal<DiscoveredItem[]>([]);
  readonly poolOverlapWarning = signal<string | null>(null);

  form = this.fb.group({
    hotspotEnabled: [false],
    pppoeEnabled: [false],
    topologySplit: ['VLAN' as TopologySplit, Validators.required],
    lanInterface: ['', Validators.required],
    hotspotVlanId: [10],
    pppoeVlanId: [20],
    hotspotBridgeName: ['br-hotspot'],
    pppoeBridgeName: ['br-pppoe'],
    hotspotPoolId: [''],
    pppoePoolId: [''],
    firewallProfile: ['hardened' as FirewallProfile],
  });
  newPoolForm = this.fb.group({
    name: ['', Validators.required],
    localIp: ['', Validators.required],
    rangeIp: ['', Validators.required],
  });

  ngOnInit(): void {
    this.poolApi.getPools(this.routerId()).subscribe((page) => this.pools.set(page.content));
    this.loadDiscovery();

    const profile = this.initialProfile();
    if (profile) {
      this.form.patchValue({
        hotspotEnabled:
          profile.deploymentMode === 'HOTSPOT' || profile.deploymentMode === 'HOTSPOT_PPPOE',
        pppoeEnabled:
          profile.deploymentMode === 'PPPOE' || profile.deploymentMode === 'HOTSPOT_PPPOE',
        topologySplit: profile.topologySplit,
        lanInterface: profile.lanInterface ?? '',
        hotspotVlanId: profile.hotspotVlanId ?? 10,
        pppoeVlanId: profile.pppoeVlanId ?? 20,
        hotspotBridgeName: profile.hotspotBridgeName ?? 'br-hotspot',
        pppoeBridgeName: profile.pppoeBridgeName ?? 'br-pppoe',
        hotspotPoolId: profile.hotspotPoolId ?? '',
        pppoePoolId: profile.pppoePoolId ?? '',
        firewallProfile: profile.firewallProfile,
      });
    }
  }

  /**
   * Best-effort — a router that hasn't reached `ONBOARDED` yet (no REST credential) or that's
   * momentarily unreachable simply has no dropdown/collision-hint data; the form still works with
   * plain manual entry either way, so failures here are swallowed, not surfaced as errors.
   */
  private loadDiscovery(): void {
    this.onboardingApi.listDiscovered(this.routerId(), 'INTERFACES').subscribe({
      next: (interfaces) => {
        this.discoveredInterfaces.set(interfaces);
        this.discoveryState.set('ready');
      },
      error: () => this.discoveryState.set('unavailable'),
    });
    this.onboardingApi.listDiscovered(this.routerId(), 'VLANS').subscribe({
      next: (vlans) => this.discoveredVlans.set(vlans),
      error: () => {
        /* no collision hints available — non-blocking, nothing to degrade */
      },
    });
  }

  interfaceName(iface: DiscoveredItem): string {
    return String(iface['name'] ?? '');
  }

  interfaceLabel(iface: DiscoveredItem): string {
    const type = String(iface['type'] ?? '');
    const running = iface['running'] === true || iface['running'] === 'true';
    return `${this.interfaceName(iface)} (${type}${running ? '' : ', down'})`;
  }

  /** True if `vlanId` already exists on the router under a VLAN this platform doesn't own. */
  vlanCollision(vlanId: number | null): boolean {
    if (vlanId == null) return false;
    return this.discoveredVlans().some((vlan) => {
      const existingId = Number(vlan['vlan-id']);
      const comment = String(vlan['comment'] ?? '');
      return existingId === vlanId && !comment.startsWith('ispnest:');
    });
  }

  checkNewPoolOverlap(): void {
    const rangeIp = this.newPoolForm.getRawValue().rangeIp;
    if (!rangeIp) {
      this.poolOverlapWarning.set(null);
      return;
    }
    this.onboardingApi.checkPoolOverlap(this.routerId(), rangeIp).subscribe({
      next: (result) => {
        this.poolOverlapWarning.set(
          result.overlapping
            ? `Overlaps existing router addressing: ${result.conflictingAddresses.join(', ')}`
            : null,
        );
      },
      error: () => this.poolOverlapWarning.set(null),
    });
  }

  cancelNewPool(): void {
    this.showNewPool.set(false);
    this.poolOverlapWarning.set(null);
  }

  createPool(): void {
    if (this.newPoolForm.invalid) return;
    this.creatingPool.set(true);
    const value = this.newPoolForm.getRawValue();
    const request: CreatePoolRequest = {
      name: value.name!,
      localIp: value.localIp,
      rangeIp: value.rangeIp!,
      routerId: this.routerId(),
    };
    this.poolApi.create(request).subscribe({
      next: (pool) => {
        this.creatingPool.set(false);
        this.pools.update((list) => [...list, pool]);
        this.showNewPool.set(false);
        this.newPoolForm.reset();
        this.poolOverlapWarning.set(null);
      },
      error: () => {
        this.creatingPool.set(false);
        this.snackBar.open('Failed to create pool', 'Close', { duration: 3000 });
      },
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    const v = this.form.getRawValue();
    const deploymentMode: DeploymentMode =
      v.hotspotEnabled && v.pppoeEnabled
        ? 'HOTSPOT_PPPOE'
        : v.hotspotEnabled
          ? 'HOTSPOT'
          : v.pppoeEnabled
            ? 'PPPOE'
            : 'MANAGEMENT_ONLY';

    this.onboardingApi
      .upsertProvisioningProfile(this.routerId(), {
        deploymentMode,
        topologySplit: v.topologySplit as TopologySplit,
        lanInterface: v.lanInterface,
        hotspotVlanId: v.hotspotEnabled ? v.hotspotVlanId : null,
        pppoeVlanId: v.pppoeEnabled ? v.pppoeVlanId : null,
        hotspotBridgeName: v.hotspotEnabled ? v.hotspotBridgeName : null,
        pppoeBridgeName: v.pppoeEnabled ? v.pppoeBridgeName : null,
        hotspotPoolId: v.hotspotEnabled && v.hotspotPoolId ? v.hotspotPoolId : null,
        pppoePoolId: v.pppoeEnabled && v.pppoePoolId ? v.pppoePoolId : null,
        firewallProfile: v.firewallProfile as FirewallProfile,
      })
      .subscribe({
        next: (profile) => {
          this.saving.set(false);
          this.saved.emit(profile);
        },
        error: (err: { error?: { message?: string } }) => {
          this.saving.set(false);
          this.error.set(err?.error?.message ?? 'Failed to save provisioning profile');
        },
      });
  }
}
