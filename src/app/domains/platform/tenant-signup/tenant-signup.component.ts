import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * Tenant self-service signup form. Apex-host-only.
 *
 * Posts to POST /api/public/tenants/register and shows a confirmation card.
 * Backend transitions the tenant to PENDING_APPROVAL → APPROVED (manual) → ACTIVE.
 */
@Component({
  selector: 'app-tenant-signup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="mx-auto max-w-xl px-6 py-16">
      <h1 class="text-3xl font-semibold mb-2">Get your ISPNest workspace</h1>
      <p class="text-neutral-600 mb-8">
        Pick a workspace slug. Your team will sign in at
        <code class="px-1 py-0.5 bg-neutral-100 rounded">https://&lt;slug&gt;.ispnest.com</code>
        once approved.
      </p>

      @if (submitted()) {
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
          <h2 class="font-semibold text-emerald-900 mb-1">Registration received</h2>
          <p class="text-emerald-800 text-sm">
            We'll email you at <strong>{{ form.value.requestedByEmail }}</strong> once an operator
            approves the workspace and activation completes.
          </p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <label class="block">
            <span class="text-sm font-medium">Workspace slug</span>
            <input
              formControlName="slug"
              autocomplete="off"
              placeholder="acme"
              class="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium">Display name</span>
            <input
              formControlName="displayName"
              placeholder="Acme ISP Ltd"
              class="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium">Contact email</span>
            <input
              type="email"
              formControlName="requestedByEmail"
              placeholder="you@acme.com"
              class="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
            />
          </label>

          @if (error()) {
            <p class="text-sm text-red-600">{{ error() }}</p>
          }

          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="rounded bg-indigo-600 text-white px-4 py-2 disabled:opacity-50"
          >
            {{ loading() ? 'Submitting…' : 'Request workspace' }}
          </button>
        </form>
      }
    </section>
  `,
})
export class TenantSignupComponent {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/)]],
    displayName: ['', [Validators.required, Validators.maxLength(200)]],
    requestedByEmail: ['', [Validators.required, Validators.email]],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitted = signal(false);

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.http.post('/api/public/tenants/register', this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.detail ?? 'Registration failed. Try a different slug.');
      },
    });
  }
}
