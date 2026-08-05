export type RenterStatus = 'ACTIVE' | 'INACTIVE';

export type RenterDto = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  idNumber: string | null;
  notes: string | null;
  status: RenterStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateRenterRequest = {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  idNumber?: string;
  notes?: string;
};

export type UpdateRenterRequest = CreateRenterRequest & {
  status?: RenterStatus;
};
