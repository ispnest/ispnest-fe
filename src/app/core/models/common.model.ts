export type Pageable<T> = {
  content: T[];
  page: Page;
};

export type Page = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export type DashboardStats = {
  totalCustomers: number;
  activeCustomers: number;
  totalRouters: number;
  onlineRouters: number;
  totalRevenue?: number;
  pendingPayments?: number;
};

/**
 * Authenticated user identity returned by /api/auth/me
 */
export type UserIdentity = {
  id: string | null;
  email: string;
  userType: 'ADMIN' | 'TECHNICIAN' | 'SUPPORT' | 'CUSTOMER' | string;
  displayName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  /** Person-level identifier for the customer portal (maps to JWT contact_id claim). */
  contactId: string | null;
  /** When true the customer must change their password before accessing the portal. */
  forcePasswordChange: boolean;
  staffProfileId: string | null;
  roles: string[];
  permissions: string[];
  lastLoginAt: string | null;
};

/**
 * @deprecated Use UserIdentity instead
 */
export type AdminUser = {
  username: string;
  roles: string[];
};
