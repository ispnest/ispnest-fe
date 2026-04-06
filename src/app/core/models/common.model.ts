export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export type DashboardStats = {
  totalCustomers: number;
  activeCustomers: number;
  totalRouters: number;
  onlineRouters: number;
  totalRevenue?: number;
  pendingPayments?: number;
}

export type AdminUser = {
  username: string;
  roles: string[];
}

