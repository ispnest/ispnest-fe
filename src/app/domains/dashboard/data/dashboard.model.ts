import { PaymentSummaryPoint } from '@/app/domains/payments/data';

/** One row of the active-subscriptions-per-plan ranking. */
export type PlanPopularity = {
  planId: string;
  planName: string;
  activeCount: number;
};

/** Composite KPI snapshot for the admin dashboard, assembled from several modules on the backend. */
export type DashboardKpis = {
  totalCustomers: number;
  activeCustomers: number;
  totalRouters: number;
  onlineRouters: number;
  revenueToday: number;
  /** Last 7 days of completed-payment totals, oldest first. */
  revenueSparkline: PaymentSummaryPoint[];
  /** Completed payments as a fraction of (completed + failed) today, in [0, 1]; null if none today. */
  paymentSuccessRate: number | null;
  overdueInvoiceCount: number;
  overdueAmount: number;
  /** Active subscriptions per plan, most-popular first. */
  planPopularity: PlanPopularity[];
  /** Customers currently in a lapsed subscription state. */
  expiredCount: number;
  expiredAvgDaysOverdue: number;
};

/** Response of the "expiring soon" lookup for a given day window. */
export type ExpiringSoon = {
  count: number;
};
