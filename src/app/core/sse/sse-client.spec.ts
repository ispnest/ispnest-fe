import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SseAuthError, sseStream } from './sse-client';

/** Builds a Response whose body streams the given SSE chunks then ends. */
function sseResponse(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(stream, {
    status,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

/** A response whose stream stays open until fail() is called. */
function hangingResponse(): { response: Response; push: (chunk: string) => void; fail: () => void } {
  const encoder = new TextEncoder();
  let ctrl!: ReadableStreamDefaultController<Uint8Array>;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      ctrl = controller;
    },
  });
  return {
    response: new Response(stream, { status: 200 }),
    push: (chunk: string) => ctrl.enqueue(encoder.encode(chunk)),
    fail: () => ctrl.error(new Error('network drop')),
  };
}

describe('sseStream', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    localStorage.setItem('ispnest_access_token', 'test-token');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  /** Flushes microtasks so the async reader loop makes progress. */
  const settle = async () => {
    await vi.advanceTimersByTimeAsync(0);
  };

  it('parses event blocks and emits JSON data', async () => {
    fetchMock.mockResolvedValueOnce(
      sseResponse(['event:usage-delta\ndata:{"inputOctets":123}\n\n']),
    );
    const received: unknown[] = [];
    const sub = sseStream<{ inputOctets: number }>('/api/x').subscribe((v) => received.push(v));
    await settle();
    expect(received).toEqual([{ inputOctets: 123 }]);
    sub.unsubscribe();
  });

  it('joins multi-line data and handles chunks split mid-line', async () => {
    fetchMock.mockResolvedValueOnce(
      sseResponse(['data:{"a":\ndata:1', '}\n\n']),
    );
    const received: unknown[] = [];
    const sub = sseStream('/api/x').subscribe((v) => received.push(v));
    await settle();
    expect(received).toEqual([{ a: 1 }]);
    sub.unsubscribe();
  });

  it('ignores comment keepalives', async () => {
    fetchMock.mockResolvedValueOnce(
      sseResponse([':keepalive\n\n:connected\n\ndata:{"b":2}\n\n']),
    );
    const received: unknown[] = [];
    const sub = sseStream('/api/x').subscribe((v) => received.push(v));
    await settle();
    expect(received).toEqual([{ b: 2 }]);
    sub.unsubscribe();
  });

  it('filters by event name when events option is set', async () => {
    fetchMock.mockResolvedValueOnce(
      sseResponse([
        'event:other\ndata:{"skip":true}\n\nevent:wanted\ndata:{"keep":true}\n\n',
      ]),
    );
    const received: unknown[] = [];
    const sub = sseStream('/api/x', { events: ['wanted'] }).subscribe((v) => received.push(v));
    await settle();
    expect(received).toEqual([{ keep: true }]);
    sub.unsubscribe();
  });

  it('sends the Bearer token and event-stream headers', async () => {
    fetchMock.mockResolvedValueOnce(sseResponse([]));
    const sub = sseStream('/api/x').subscribe();
    await settle();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/x',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          Accept: 'text/event-stream',
        }),
      }),
    );
    sub.unsubscribe();
  });

  it('reconnects after a clean stream end', async () => {
    fetchMock
      .mockResolvedValueOnce(sseResponse(['data:{"n":1}\n\n']))
      .mockResolvedValueOnce(sseResponse(['data:{"n":2}\n\n']));
    const received: { n: number }[] = [];
    const sub = sseStream<{ n: number }>('/api/x').subscribe((v) => received.push(v));

    await settle();
    expect(received).toEqual([{ n: 1 }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // first stream ended cleanly → backoff (≤1.5s) then reconnect
    await vi.advanceTimersByTimeAsync(2_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(received).toEqual([{ n: 1 }, { n: 2 }]);
    sub.unsubscribe();
  });

  it('reconnects after a network error', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(sseResponse(['data:{"ok":true}\n\n']));
    const received: unknown[] = [];
    const sub = sseStream('/api/x').subscribe((v) => received.push(v));

    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(received).toEqual([{ ok: true }]);
    sub.unsubscribe();
  });

  it('backs off exponentially across consecutive failures', async () => {
    fetchMock.mockRejectedValue(new Error('down'));
    const sub = sseStream('/api/x').subscribe({ error: () => undefined });

    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // retry 1 after ≤1.5s
    await vi.advanceTimersByTimeAsync(1_600);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // retry 2 after ~2s more (not yet at 1s)
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1_600);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    sub.unsubscribe();
  });

  it('treats 401 as terminal and does not retry', async () => {
    fetchMock.mockResolvedValueOnce(sseResponse([], 401));
    let error: unknown;
    const sub = sseStream('/api/x').subscribe({ error: (e: unknown) => (error = e) });

    await settle();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(error).toBeInstanceOf(SseAuthError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    sub.unsubscribe();
  });

  it('aborts the connection and stops reconnecting on unsubscribe', async () => {
    const hanging = hangingResponse();
    fetchMock.mockResolvedValueOnce(hanging.response);
    const sub = sseStream('/api/x').subscribe();
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    sub.unsubscribe();
    await vi.advanceTimersByTimeAsync(120_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('resumes emitting after reconnect when the connection drops mid-stream', async () => {
    const hanging = hangingResponse();
    fetchMock
      .mockResolvedValueOnce(hanging.response)
      .mockResolvedValueOnce(sseResponse(['data:{"after":"reconnect"}\n\n']));
    const received: unknown[] = [];
    const sub = sseStream('/api/x').subscribe((v) => received.push(v));

    await settle();
    hanging.push('data:{"before":"drop"}\n\n');
    await settle();
    expect(received).toEqual([{ before: 'drop' }]);

    hanging.fail();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(received).toEqual([{ before: 'drop' }, { after: 'reconnect' }]);
    sub.unsubscribe();
  });
});
