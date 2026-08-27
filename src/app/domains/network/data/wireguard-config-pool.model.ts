/**
 * A pre-provisioned WireGuard client config sourced from the externally-managed WireGuard server
 * this project does not operate. Never includes key material — admin visibility never needs it.
 */
export type WireGuardConfigPoolEntryDto = {
  id: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'REVOKED';
  assignedRouterId: string | null;
  uploadedAt: string;
};

/** Pool-wide counts, so operators can see when they're running low before an enrollment fails. */
export type WireGuardConfigPoolInventoryDto = {
  available: number;
  assigned: number;
};
