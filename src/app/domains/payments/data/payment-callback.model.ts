export type PaymentCallbackLogDto = {
  id: string;
  provider: string;
  callbackMetadata: Record<string, unknown> | null;
  status: 'PENDING' | 'PROCESSED' | 'ERROR';
  errorMessage: string | null;
  attemptCount: number;
  receivedAt: string;
  processedAt: string | null;
  terminal: boolean;
  originalCallbackMetadata: Record<string, unknown> | null;
  correctionReason: string | null;
  correctedBy: string | null;
  correctedAt: string | null;
  correctionCount: number;
  payerNotifiedAt: string | null;

  /**
   * Whether this log can currently be corrected — computed server-side; the frontend never needs
   * to know which provider strings are supported.
   */
  correctable: boolean;

  /**
   * The `callbackMetadata` keys that can be edited via correction, declared by the provider (e.g.
   * `["account_number"]` for ABSA) — empty when `correctable` is false. The frontend renders
   * exactly these inputs; everything else (amount, transaction ID, payer phone/name, payment
   * method, ...) is a fact reported by the payment gateway and is never editable.
   */
  editableFields: string[];
};

export type CorrectCallbackRequest = {
  /** Partial map — only the fields being changed, restricted server-side to `editableFields`. */
  correctedFields: Record<string, unknown>;
  reason: string;
};
