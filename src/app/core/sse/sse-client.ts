import { EMPTY, Observable, concat, defer, throwError, timer } from 'rxjs';
import { retry } from 'rxjs/operators';

/** Terminal error: the server rejected the token — reconnecting would only hammer the API. */
export class SseAuthError extends Error {
  constructor(url: string, status: number) {
    super(`SSE auth failed (${status}) for ${url}`);
    this.name = 'SseAuthError';
  }
}

/** Internal marker: the stream ended cleanly (server timeout / proxy close) — triggers reconnect. */
export class SseStreamEndedError extends Error {
  constructor(url: string) {
    super(`SSE stream ended for ${url}`);
    this.name = 'SseStreamEndedError';
  }
}

export type SseOptions = {
  /** Only emit blocks whose `event:` name is in this list. Omit to emit all data-bearing events. */
  events?: string[];
};

const MAX_BACKOFF_MS = 30_000;
const BASE_BACKOFF_MS = 1_000;
const JITTER_MS = 500;

/**
 * Opens a Server-Sent Events stream with Bearer auth and automatic resubscription.
 *
 * &lt;p>Native `EventSource` cannot send an `Authorization` header, so this uses `fetch` with a
 * streaming body reader and a real SSE block parser (event names, multi-line data, `:` comment
 * keepalives).
 *
 * &lt;p>Resilience: the stream automatically reconnects with exponential backoff + jitter after
 * network errors AND after clean stream ends (the server times emitters out after ~30 min). The
 * backoff resets once a message arrives. 401/403 responses are terminal — an expired token must be
 * handled by the caller/interceptor, not by retrying. Unsubscribing aborts the connection and stops
 * all reconnection.
 */
export function sseStream<T>(url: string, opts: SseOptions = {}): Observable<T> {
  // SSE is browser-only; during SSR render nothing.
  if (typeof window === 'undefined') return EMPTY;

  return defer(() =>
    concat(
      connectOnce<T>(url, opts),
      // A cleanly-ended stream must also reconnect — surface it as an error for retry() to catch.
      throwError(() => new SseStreamEndedError(url)),
    ),
  ).pipe(
    retry({
      resetOnSuccess: true,
      delay: (error: unknown, retryCount: number) => {
        if (error instanceof SseAuthError) return throwError(() => error);
        const backoff = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** (retryCount - 1));
        return timer(backoff + Math.random() * JITTER_MS);
      },
    }),
  );
}

/** One fetch-based SSE connection: emits parsed events until the stream ends or errors. */
function connectOnce<T>(url: string, opts: SseOptions): Observable<T> {
  return new Observable<T>((observer) => {
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('ispnest_access_token') : null;
    const controller = new AbortController();

    fetch(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'text/event-stream',
        'X-API-Version': '1.0',
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          observer.error(new SseAuthError(url, response.status));
          return;
        }
        if (!response.ok || !response.body) {
          observer.error(new Error(`SSE connection failed: ${response.status}`));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let eventName = 'message';
        let dataLines: string[] = [];

        const dispatch = (): void => {
          if (dataLines.length > 0) {
            const wanted = !opts.events || opts.events.includes(eventName);
            if (wanted) {
              try {
                observer.next(JSON.parse(dataLines.join('\n')) as T);
              } catch {
                // ignore malformed frames
              }
            }
          }
          eventName = 'message';
          dataLines = [];
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            dispatch();
            observer.complete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const rawLine of lines) {
            const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
            if (line === '') {
              dispatch();
            } else if (line.startsWith(':')) {
              // comment / keepalive — ignore
            } else if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trimStart());
            }
          }
        }
      })
      .catch((e: unknown) => {
        if ((e as { name?: string }).name !== 'AbortError') {
          observer.error(e);
        }
      });

    return () => controller.abort();
  });
}
