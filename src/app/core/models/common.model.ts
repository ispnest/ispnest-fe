export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalRouters: number;
  onlineRouters: number;
  totalRevenue?: number;
  pendingPayments?: number;
}

export interface AdminUser {
  username: string;
  roles: string[];
}

