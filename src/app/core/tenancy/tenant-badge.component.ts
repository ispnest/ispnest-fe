import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TenancyService } from '../tenancy/tenancy.service';

/**
 * Persistent badge shown when a PLATFORM_ADMIN has impersonated a tenant.
 * Visible across all tenant routes so the operator never forgets they are switched.
 */
@Component({
  selector: 'app-tenant-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tenancy.superAdminSwitched() && tenancy.tenantSlug()) {
      <div
        class="fixed bottom-4 left-4 z-50 rounded-full bg-amber-500 text-white px-4 py-2 shadow-lg text-sm"
      >
        <strong>Super-admin mode</strong> — viewing tenant
        <code class="ml-1 underline">{{ tenancy.tenantSlug() }}</code>
      </div>
    }
  `,
})
export class TenantBadgeComponent {
  readonly tenancy = inject(TenancyService);
}
