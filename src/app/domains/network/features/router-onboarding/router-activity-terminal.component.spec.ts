import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import {
  RouterActivityEventDto,
  RouterManagementStateDto,
  RouterOnboardingApiService,
} from '@/app/domains/network/data';
import { RouterActivityTerminalComponent } from './router-activity-terminal.component';

function activityEvent(overrides: Partial<RouterActivityEventDto>): RouterActivityEventDto {
  return {
    id: 'evt-default',
    category: 'ONBOARDING',
    fromState: 'ENROLLING',
    toState: 'BOOTSTRAPPING',
    step: 'WAN',
    source: 'SCRIPT',
    result: 'OK',
    detail: null,
    errorMessage: null,
    actor: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Backend returns recentEvents newest-first; the terminal must reverse to oldest-first-at-top,
// newest-at-bottom.
const MANAGEMENT_STATE: RouterManagementStateDto = {
  routerId: 'router-1',
  state: 'SYNCED',
  hardwareSerial: null,
  routerosVersion: null,
  boardName: null,
  lastHeartbeatAt: null,
  lastReconciledAt: null,
  consecutiveFailures: 0,
  recentEvents: [
    activityEvent({ id: 'evt-2', toState: 'ONBOARDED', fromState: 'VERIFYING' }),
    activityEvent({ id: 'evt-1', toState: 'ENROLLING', fromState: 'NEW' }),
  ],
};

describe('RouterActivityTerminalComponent', () => {
  let streamSubject: Subject<RouterActivityEventDto>;
  let fakeApi: {
    getManagementState: ReturnType<typeof vi.fn>;
    streamActivityEvents: ReturnType<typeof vi.fn>;
  };

  function createComponent() {
    streamSubject = new Subject<RouterActivityEventDto>();
    fakeApi = {
      getManagementState: vi.fn().mockReturnValue(of(MANAGEMENT_STATE)),
      streamActivityEvents: vi.fn().mockReturnValue(streamSubject.asObservable()),
    };

    TestBed.configureTestingModule({
      imports: [RouterActivityTerminalComponent],
      providers: [{ provide: RouterOnboardingApiService, useValue: fakeApi }],
    });
    const fixture = TestBed.createComponent(RouterActivityTerminalComponent);
    fixture.componentRef.setInput('routerId', 'router-1');
    fixture.detectChanges();
    return fixture;
  }

  it('renders the initial resync oldest-first (newest at the bottom)', () => {
    const fixture = createComponent();
    const text = fixture.nativeElement.textContent as string;

    expect(text.indexOf('NEW → ENROLLING')).toBeGreaterThanOrEqual(0);
    expect(text.indexOf('VERIFYING → ONBOARDED')).toBeGreaterThan(text.indexOf('NEW → ENROLLING'));
  });

  it('appends live SSE events at the bottom and emits activityRecorded', () => {
    const fixture = createComponent();
    const emitted: RouterActivityEventDto[] = [];
    fixture.componentInstance.activityRecorded.subscribe((e) => emitted.push(e));

    const pushed = activityEvent({ id: 'evt-3', fromState: 'BOOTSTRAPPING', toState: 'VERIFYING' });
    streamSubject.next(pushed);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text.indexOf('VERIFYING → ONBOARDED')).toBeLessThan(
      text.indexOf('BOOTSTRAPPING → VERIFYING'),
    );
    expect(emitted.at(-1)).toEqual(pushed);
  });

  it('shows "No activity yet" when the router has no history', () => {
    fakeApi = {
      getManagementState: vi
        .fn()
        .mockReturnValue(
          of({ ...MANAGEMENT_STATE, recentEvents: [] } satisfies RouterManagementStateDto),
        ),
      streamActivityEvents: vi
        .fn()
        .mockReturnValue(new Subject<RouterActivityEventDto>().asObservable()),
    };
    TestBed.configureTestingModule({
      imports: [RouterActivityTerminalComponent],
      providers: [{ provide: RouterOnboardingApiService, useValue: fakeApi }],
    });
    const fixture = TestBed.createComponent(RouterActivityTerminalComponent);
    fixture.componentRef.setInput('routerId', 'router-1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent as string).toContain('No activity yet');
  });
});
