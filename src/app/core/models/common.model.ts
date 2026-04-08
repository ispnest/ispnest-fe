export type Pageable<T> = {
  content: T[];
  page: Page;
}

export type Page = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
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

