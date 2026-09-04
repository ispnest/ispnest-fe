/**
 * Moving a completed payment off a wrong-but-valid account code onto the account it was meant for.
 *
 * Distinct from the callback correction in `payment-callback.model.ts`: that one fixes a callback
 * that *failed* because the typed code matched no customer at all. These types cover the case
 * where the code matched a real but wrong subscriber, so the payment succeeded and the money is
 * already sitting on their account.
 */

/** Audit record of a completed reallocation, plus what the operation actually did. */
export type PaymentReallocationDto = {
  id: string;
  paymentId: string;
  amount: number;

  fromCustomerId: string;
  fromAccountCode: string | null;
  toCustomerId: string;
  toAccountCode: string | null;

  /** How much was still in the wrong account's credit balance and was clawed back. */
  reclaimedFromCredit: number;

  /**
   * The remainder — already spent there on invoices or charges, so not reclaimable — raised as a
   * pending `PAYMENT_REALLOCATION` charge on that account instead. Always
   * `amount - reclaimedFromCredit`.
   */
  shortfallCharged: number;
  shortfallChargeId: string | null;

  /** The wrong account's recharge that was expired, when `revokeRecharge` was requested. */
  revokedRechargeId: string | null;
  /** The recharge the correct account got, when it had none active. */
  activatedRechargeId: string | null;

  reason: string;
  reallocatedBy: string | null;
  createdAt: string;
};

/**
 * Dry run — what the reallocation would do. Fetched as the operator types the corrected account
 * code, so they can confirm the target is who they meant and see whether `revokeRecharge` would
 * disconnect a live subscriber.
 */
export type PaymentReallocationPreviewDto = {
  paymentId: string;
  amount: number;

  fromCustomerId: string;
  fromAccountCode: string | null;
  fromCustomerName: string | null;
  fromCreditBalance: number;

  toCustomerId: string;
  toAccountCode: string | null;
  toCustomerName: string | null;

  reclaimable: number;
  shortfall: number;

  /** Non-null when the wrong account has an active recharge this payment bought. */
  rechargeToRevokeId: string | null;
  rechargeToRevokeExpiration: string | null;

  /** Whether the correct account would get a fresh active subscription out of this. */
  willActivateSubscription: boolean;
};

export type ReallocatePaymentRequest = {
  toAccountCode: string;
  reason: string;
  /** Also expire the recharge this payment bought on the wrong account — disconnects them. */
  revokeRecharge: boolean;
};
