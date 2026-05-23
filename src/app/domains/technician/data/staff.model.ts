export type StaffDto = {
  id: string;
  email: string;
  userType: string;
  displayName: string;
  phoneNumber: string | null;
  staffProfileId: string | null;
  roles: string[];
  lastLoginAt: string | null;
};

export type CreateStaffRequest = {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
  userType: 'ADMIN' | 'TECHNICIAN' | 'SUPPORT';
  department?: string;
  title?: string;
};

export type UpdateStaffRequest = {
  displayName?: string;
  phoneNumber?: string;
  department?: string;
  title?: string;
};

export type ActiveTechnicianDto = {
  name: string;
  phoneNumber: string | null;
  email: string;
};
