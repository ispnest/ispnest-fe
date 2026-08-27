import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoutersListComponent } from './routers-list.component';

/** An already-closed empty SSE stream — `streamHeartbeats()` completes without emitting. */
function emptySseResponse(): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
}

function createComponent() {
  TestBed.configureTestingModule({
    imports: [RoutersListComponent],
    providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideRouter([])],
  });
  const fixture = TestBed.createComponent(RoutersListComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock, component: fixture.componentInstance };
}

function router(overrides: Partial<{ status: string; managementState: string | null }> = {}) {
  return {
    id: 'router-1',
    name: 'Nairobi Branch',
    ipAddress: null,
    description: null,
    coordinates: null,
    nasType: 'mikrotik',
    status: 'offline',
    lastSeen: null,
    managementState: null,
    ...overrides,
  };
}

describe('RoutersListComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(emptySseResponse()));
  });

  afterEach(() => {
    httpMock.verify();
    vi.unstubAllGlobals();
  });

  it('a not-yet-onboarded router shows its onboarding stage, not online/offline', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    const { component } = created;

    httpMock
      .expectOne((req) => req.url === '/api/routers')
      .flush({
        content: [router({ status: 'offline', managementState: 'BOOTSTRAPPING' })],
        page: { size: 20, number: 0, totalElements: 1, totalPages: 1 },
      });

    const badge = component.status(component.routers()[0]);
    expect(badge.label).toBe('BOOTSTRAPPING');
    expect(badge.hue).toBe('amber');
  });

  it('an onboarded, reachable router shows real online status', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    const { component } = created;

    httpMock
      .expectOne((req) => req.url === '/api/routers')
      .flush({
        content: [router({ status: 'online', managementState: 'SYNCED' })],
        page: { size: 20, number: 0, totalElements: 1, totalPages: 1 },
      });

    const badge = component.status(component.routers()[0]);
    expect(badge.label).toBe('online');
    expect(badge.hue).toBe('green');
  });

  it('deleting a router removes it from the list and decrements the registered count', () => {
    const created = createComponent();
    httpMock = created.httpMock;
    const { component, fixture } = created;
    // Confirm dialog auto-confirms -- only the resulting delete behavior is under test here.
    vi.spyOn(TestBed.inject(MatDialog), 'open').mockReturnValue({
      afterClosed: () => of(true),
    } as ReturnType<MatDialog['open']>);

    httpMock
      .expectOne((req) => req.url === '/api/routers')
      .flush({
        content: [router()],
        page: { size: 20, number: 0, totalElements: 1, totalPages: 1 },
      });
    expect(component.totalElements()).toBe(1);

    component.deleteRouter(component.routers()[0]);
    httpMock.expectOne('/api/routers/router-1').flush({});
    fixture.detectChanges();

    expect(component.routers()).toHaveLength(0);
    expect(component.totalElements()).toBe(0);
  });
});
