import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProvisioningProfileDto, RouterOnboardingApiService } from '@/app/domains/network/data';
import { ProvisioningProfileFormComponent } from '../router-onboarding/provisioning-profile-form.component';
import { RouterDetailStore } from './router-detail.store';

/**
 * The one section genuinely bulky/interactive enough to earn its own tab: the Provisioning Profile
 * form (hotspot/PPPoE, VLANs, LAN interface with live discovery, pools, firewall profile). Gated by
 * `store.provisioningAccess()` — not usable at all pre-onboarding, usable-with-a-warning if
 * onboarded but currently unreachable (see `router-status.util.ts`).
 */
@Component({
  selector: 'app-router-services',
  standalone: true,
  imports: [MatIcon, ProvisioningProfileFormComponent],
  template: `
    @if (store.provisioningAccess(); as access) {
      @if (access.allowed) {
        <p class="mb-3 text-xs text-neutral-a10">
          What this router provides and how it's laid out. Saving updates IP pool assignment
          immediately; other changes (topology, VLANs, bridges) only reach the router on its next
          bootstrap run — use "Issue Onboarding Token" above to re-run it.
        </p>
        @if (!access.reachable) {
          <div class="mb-3 flex items-start gap-2 rounded-lg border border-red-a6 bg-red-a2 p-3">
            <mat-icon svgIcon="alert-triangle" class="mt-0.5 size-4 shrink-0 text-red-a11" />
            <p class="text-xs text-red-a11">
              This router is currently unreachable, so live discovery (interfaces, VLANs, pool
              overlap checks) isn't available — entries below can't be validated against the router
              automatically. You can still save; changes apply once it reconnects, but double-check
              interface names, VLAN IDs, and pool ranges manually before saving.
            </p>
          </div>
        }
        @if (profile(); as p) {
          <app-provisioning-profile-form
            [routerId]="store.routerId"
            [initialProfile]="p"
            submitLabel="Save"
            (saved)="onProfileSaved($event)"
          />
        }
      } @else {
        <div class="flex items-start gap-2 rounded-lg border border-neutral-a6 bg-neutral-a2 p-3">
          <mat-icon svgIcon="info" class="mt-0.5 size-4 shrink-0 text-neutral-a10" />
          <p class="text-xs text-neutral-a10">
            Service configuration (hotspot, PPPoE, VLANs, IP pools) becomes available once this
            router finishes onboarding — issue an onboarding token above and run the bootstrap
            command on the router first.
          </p>
        </div>
      }
    }
  `,
})
export class RouterServicesComponent implements OnInit {
  protected readonly store = inject(RouterDetailStore);
  private readonly onboardingApi = inject(RouterOnboardingApiService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly profile = signal<ProvisioningProfileDto | null>(null);

  ngOnInit(): void {
    this.onboardingApi
      .getProvisioningProfile(this.store.routerId)
      .subscribe((profile) => this.profile.set(profile));
  }

  onProfileSaved(profile: ProvisioningProfileDto): void {
    this.profile.set(profile);
    this.snackBar.open('Provisioning profile saved', 'OK', { duration: 3000 });
  }
}
