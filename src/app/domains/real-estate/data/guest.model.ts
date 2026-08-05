export type GuestStatus = 'ACTIVE' | 'INACTIVE';

export type GuestDto = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  idNumber: string | null;
  notes: string | null;
  status: GuestStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateGuestRequest = {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  idNumber?: string;
  notes?: string;
};

export type UpdateGuestRequest = CreateGuestRequest & {
  status?: GuestStatus;
};
