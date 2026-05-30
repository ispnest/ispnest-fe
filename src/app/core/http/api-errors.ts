/**
 * Helpers that normalise the Spring `ProblemDetail` payload (RFC 9457) that ispnest's
 * `GlobalExceptionHandler` and `RouterExceptionHandler` return on every 4xx / 5xx response.
 *
 * Spring 6's ProblemDetail shape:
 * ```
 * {
 *   "type":   "https://api.example.com/errors/validation-failed",
 *   "title":  "VALIDATION_FAILED",
 *   "status": 400,
 *   "detail": "Request validation failed",
 *   "errors": [{ "field": "coordinates", "message": "..." }]   // bean-validation
 * }
 * ```
 *
 * The frontend used to read `err.error.message` which never exists in that payload, so every
 * server-side rejection silently surfaced as "An error occurred". This helper fixes that — call
 * it from every `.subscribe({ error: … })` instead of crafting bespoke strings.
 */

export type FieldError = {
  field: string;
  message: string;
};

export type ProblemDetail = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  message?: string;
  errors?: FieldError[];
};

/**
 * Extract a single, user-readable error sentence from an HttpErrorResponse-like object.
 * Falls back to the supplied `fallback` (or a generic message) only when the body is empty
 * or in an unrecognised shape.
 */
export function extractErrorMessage(
  err: unknown,
  fallback = 'Something went wrong, please try again.',
): string {
  const body = (err as { error?: ProblemDetail | string } | null)?.error;
  if (!body) return fallback;

  // Some interceptors return the body as a JSON string — try to parse.
  let parsed: ProblemDetail;
  if (typeof body === 'string') {
    try {
      parsed = JSON.parse(body) as ProblemDetail;
    } catch {
      return body || fallback;
    }
  } else {
    parsed = body;
  }

  // 1. Bean-validation failures (most actionable).
  if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
    return parsed.errors
      .map((e) => (e.field ? `${labelize(e.field)}: ${e.message}` : e.message))
      .join(' · ');
  }

  // 2. ProblemDetail.detail.
  if (typeof parsed.detail === 'string' && parsed.detail.trim()) return parsed.detail;

  // 3. Legacy { message }.
  if (typeof parsed.message === 'string' && parsed.message.trim()) return parsed.message;

  // 4. Title (e.g. ROUTER_ALREADY_EXISTS).
  if (typeof parsed.title === 'string' && parsed.title.trim()) return prettify(parsed.title);

  return fallback;
}

/** Return field-level errors when present (for inline form display). */
export function extractFieldErrors(err: unknown): FieldError[] {
  const body = (err as { error?: ProblemDetail } | null)?.error;
  if (!body || !Array.isArray(body.errors)) return [];
  return body.errors;
}

function labelize(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function prettify(code: string): string {
  return code
    .toLowerCase()
    .split('_')
    .map((s, i) => (i === 0 ? s[0]?.toUpperCase() + s.slice(1) : s))
    .join(' ');
}
