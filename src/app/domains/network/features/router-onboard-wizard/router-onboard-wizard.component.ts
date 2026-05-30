import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { extractErrorMessage } from '@/app/core/http/api-errors';
import {
  CIDR_OPTIONS,
  OnboardRouterResponse,
  PoolApiService,
  PoolDto,
  RouterApiService,
  computePool,
} from '@/app/domains/network/data';
import { OnboardingStatusPanelComponent } from '../onboarding/onboarding-status-panel.component';

type DraftPool = {
  id?: string;
  name: string;
  networkIp: string;
  cidr: number;
  saving?: boolean;
  saved?: boolean;
  error?: string;
};

/**
 * Three-step router onboarding wizard at `/admin/routers/new`.
 *
 *  1. **Identity** — minimal name/description/coordinates. Submitting calls
 *     `POST /api/routers/onboard` which atomically persists the router, allocates a
 *     WireGuard peer, and renders the first onboarding script. **The router exists
 *     from this point on**, so step 2 can attach pools live.
 *  2. **Pools** — each pool row attaches live via `POST /api/pools` against the real
 *     router id. Per-row save state + error display.
 *  3. **Verify** — fetch-command (copy button), WireGuard peer summary, live SSE
 *     status panel.
 *
 * Back navigation is disabled after step 1 commits so the operator can't accidentally
 * re-trigger router creation (which would 409 on the duplicate name).
 */
@Component({
  selector: 'app-router-onboard-wizard',
  standalone: true,
  host: { class: 'flex flex-auto flex-col' },
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCard,
    MatDivider,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatHint,
    MatInput,
    MatSelect,
    MatOption,
    OnboardingStatusPanelComponent,
  ],
  templateUrl: './router-onboard-wizard.component.html',
})
export class RouterOnboardWizardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly routerApi = inject(RouterApiService);
  private readonly poolApi = inject(PoolApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly steps = [
    { key: 'identity', label: '1. Identity' },
    { key: 'pools', label: '2. IP pools' },
    { key: 'verify', label: '3. Verify' },
  ];

  readonly step = signal(0);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly result = signal<OnboardRouterResponse | null>(null);
  readonly pools = signal<DraftPool[]>([]);
  readonly cidrOptions = CIDR_OPTIONS;

  /** Disable "Continue" while any pool has unsaved edits — forces explicit attach or remove. */
  readonly anyPoolDirty = computed(() =>
    this.pools().some((p) => !p.saved && (p.name.trim() !== '' || p.networkIp.trim() !== '')),
  );

  readonly identity: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(2)]],
    coordinates: [
      '',
      [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/)],
    ],
  });

  // ─── Stepper navigation ──────────────────────────────────────────────

  back(): void {
    if (this.submitting()) return;
    if (this.step() === 1 && this.result()) return; // router exists, no going back
    this.errorMessage.set('');
    this.step.update((s) => Math.max(s - 1, 0));
  }

  goToVerify(): void {
    if (this.anyPoolDirty()) return;
    this.errorMessage.set('');
    this.step.set(2);
  }

  // ─── Step 1: Create router ───────────────────────────────────────────

  provision(): void {
    if (this.submitting() || this.result()) return;
    this.identity.markAllAsTouched();
    if (this.identity.invalid) {
      this.errorMessage.set('Please fix the highlighted fields and try again.');
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set('');

    const v = this.identity.value;
    this.routerApi
      .onboard({
        name: (v.name ?? '').trim(),
        description: (v.description ?? '').trim(),
        coordinates: (v.coordinates ?? '').trim(),
      })
      .subscribe({
        next: (response) => {
          this.result.set(response);
          this.submitting.set(false);
          this.snackBar.open('Router created', 'OK', { duration: 2500 });
          this.step.set(1);
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(extractErrorMessage(err, 'Could not create the router.'));
        },
      });
  }

  // ─── Step 2: Pools ───────────────────────────────────────────────────

  addPool(): void {
    this.pools.update((list) => [
      ...list,
      { name: '', networkIp: '', cidr: 24, saving: false, saved: false },
    ]);
  }

  removePool(i: number): void {
    const target = this.pools()[i];
    if (target?.saved && target.id) {
      this.poolApi.delete(target.id).subscribe({
        next: () => this.pools.update((list) => list.filter((_, idx) => idx !== i)),
        error: (err) =>
          this.snackBar.open(extractErrorMessage(err, 'Could not delete pool'), 'Close', {
            duration: 4000,
          }),
      });
    } else {
      this.pools.update((list) => list.filter((_, idx) => idx !== i));
    }
  }

  updatePool(i: number, field: keyof DraftPool, value: string | number): void {
    this.pools.update((list) =>
      list.map((p, idx) =>
        idx === i
          ? { ...p, [field]: field === 'cidr' ? Number(value) : value, error: undefined }
          : p,
      ),
    );
  }

  previewPool(p: DraftPool): { localIp: string; range: string } | null {
    return computePool(p.networkIp, p.cidr);
  }

  canSavePool(p: DraftPool): boolean {
    return !!p.name.trim() && !!computePool(p.networkIp, p.cidr) && !p.saving;
  }

  savePool(i: number): void {
    const router = this.result();
    if (!router) return;
    const draft = this.pools()[i];
    if (!draft || !this.canSavePool(draft)) return;

    const computed = computePool(draft.networkIp, draft.cidr)!;
    this.pools.update((list) =>
      list.map((p, idx) => (idx === i ? { ...p, saving: true, error: undefined } : p)),
    );

    this.poolApi
      .create({
        name: draft.name.trim(),
        routerId: router.router.id,
        localIp: computed.localIp,
        rangeIp: computed.range,
      })
      .subscribe({
        next: (saved: PoolDto) => {
          this.pools.update((list) =>
            list.map((p, idx) =>
              idx === i ? { ...p, id: saved.id, saving: false, saved: true } : p,
            ),
          );
        },
        error: (err) => {
          this.pools.update((list) =>
            list.map((p, idx) =>
              idx === i
                ? { ...p, saving: false, error: extractErrorMessage(err, 'Pool save failed') }
                : p,
            ),
          );
        },
      });
  }

  // ─── Clipboard ───────────────────────────────────────────────────────

  copy(text: string, label: string): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      this.snackBar.open('Clipboard unavailable', 'Close', { duration: 2000 });
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => this.snackBar.open(`${label} copied`, 'OK', { duration: 1500 }),
      () => this.snackBar.open(`Could not copy ${label}`, 'Close', { duration: 2000 }),
    );
  }
}
