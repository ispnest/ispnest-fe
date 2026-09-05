/**
 * Manually resolving a payment stuck PENDING because the provider's callback for it never
 * arrived — the customer paid, the provider accepted the STK push, but nothing ever called back.
 *
 * Distinct from `payment-reallocation.model.ts` (payment succeeded against a real but wrong
 * account) and `payment-callback.model.ts` (a callback arrived but errored on a bad account
 * code): here nothing arrived at all, so there is no callback log row to correct.
 */

/** Whether a payment is eligible for manual resolution, and whether its provider can verify. */
export type PaymentResolutionOptionsDto = {
  /** The payment is non-terminal, so manual resolution applies at all. */
  resolvable: boolean;

  /**
   * The provider can independently verify a transaction (e.g. an M-Pesa Daraja STK query).
   * `true` → `resolveMissingCallback` is available. `false` → only `forceResolveMissingCallback`
   * applies, and only to a user holding `PAYMENTS_FORCE_RESOLVE_CALLBACK`.
   */
  verifiable: boolean;
};

export type ResolveMissingCallbackRequest = {
  providerTransactionId: string;
  reason: string;
};

/** Audit record of a payment manually completed by staff. */
export type PaymentManualResolutionDto = {
  id: string;
  paymentId: string;
  provider: string;
  providerTransactionId: string;
  /** `true` when backed by an independent provider-side check, `false` when staff-attested only. */
  verified: boolean;
  reason: string;
  resolvedBy: string | null;
  createdAt: string;
};
