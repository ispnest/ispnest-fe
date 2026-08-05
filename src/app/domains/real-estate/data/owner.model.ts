export type OwnerStatus = 'ACTIVE' | 'INACTIVE';

export type OwnerDto = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  idNumber: string | null;
  taxPin: string | null;
  notes: string | null;
  status: OwnerStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateOwnerRequest = {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  idNumber?: string;
  taxPin?: string;
  notes?: string;
};

export type UpdateOwnerRequest = CreateOwnerRequest & {
  status?: OwnerStatus;
};

export type OwnerPortalAccessDto = {
  hasPortalAccess: boolean;
};

export type GrantPortalAccessResponse = {
  email: string;
  initialPassword: string;
};
