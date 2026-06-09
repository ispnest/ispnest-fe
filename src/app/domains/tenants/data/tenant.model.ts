/**
 * Tenant status enum — mirrors backend TenantStatus.
 */
export type TenantStatus =
  | 'PENDING_PROVISIONING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DECOMMISSIONED'
  | 'PROVISIONING_FAILED';

/**
 * Provisioning status — mirrors backend ProvisioningStatus.
 */
export type ProvisioningStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

/**
 * Tenant descriptor — public read model from the backend.
 */
export type TenantDescriptor = {
  tenantId: string;
  slug: string;
  displayName: string;
  status: TenantStatus;
  provisioningStatus: ProvisioningStatus;
  databaseName: string;
  databaseHost: string;
  databasePort: number;
  databaseUser: string;
  databaseSecretReference: string;
  schemaVersion: string;
};

/**
 * Public onboarding request — self-service tenant signup.
 */
export type TenantOnboardRequest = {
  slug: string;
  displayName: string;
  adminEmail: string;
  adminDisplayName: string;
};

/**
 * Admin create tenant request.
 */
export type CreateTenantRequest = {
  slug: string;
  displayName: string;
  adminOnboarding?: {
    email: string;
    displayName: string;
  };
};
