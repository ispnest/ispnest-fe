import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { PaymentDetailComponent } from './payment-detail.component';

const PAYMENT_ID = 'p-1';

const payment = {
  id: PAYMENT_ID,
  customerId: 'c-wrong',
  planId: 'plan-1',
  amount: 3000,
  currency: 'KES',
  provider: 'AbsaMpesa',
  externalReference: 'MISDIRECT-1',
  status: 'COMPLETED',
  failureReason: null,
  createdAt: '2026-09-04T08:00:00Z',
  updatedAt: '2026-09-04T08:00:00Z',
  accountCode: 'DGB-00123',
};

const preview = {
  paymentId: PAYMENT_ID,
  amount: 3000,
  fromCustomerId: 'c-wrong',
  fromAccountCode: 'DGB-00123',
  fromCustomerName: 'John Karu',
  fromCreditBalance: 2000,
  toCustomerId: 'c-right',
  toAccountCode: 'DGB-00456',
  toCustomerName: 'Nancy Wangechi',
  reclaimable: 2000,
  shortfall: 1000,
  rechargeToRevokeId: 'r-1',
  rechargeToRevokeExpiration: '2026-10-04T08:00:00Z',
  willActivateSubscription: true,
};

/**
 * Boots the component and answers its two ngOnInit requests. The reallocation lookup 404s for a
 * payment that was never moved, which is the normal case.
 */
function createComponent(opts: { alreadyReallocated?: boolean } = {}) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [PaymentDetailComponent],
    providers: [
      provideHttpClient(withXhr()),
      provideHttpClientTesting(),
      provideRouter([]),
      // The component reads its id from the route snapshot.
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ id: PAYMENT_ID }) } },
      },
    ],
  });
  const fixture = TestBed.createComponent(PaymentDetailComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();

  httpMock.expectOne((r) => r.url.endsWith(`/api/payments/${PAYMENT_ID}`)).flush(payment);
  const lookups = httpMock.match((r) => r.url.endsWith('/reallocation'));
  if (opts.alreadyReallocated) {
    lookups[0]?.flush({ ...preview, id: 'ra-1', reason: 'x', reallocatedBy: 'admin' });
  } else {
    lookups[0]?.flush({ detail: 'not found' }, { status: 404, statusText: 'Not Found' });
  }

  return { fixture, component: fixture.componentInstance, httpMock };
}

describe('PaymentDetailComponent — reallocation panel', () => {
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  it('starts with the panel closed and no preview', () => {
    const c = createComponent();
    httpMock = c.httpMock;

    expect(c.component.reallocating()).toBe(false);
    expect(c.component.preview()).toBeNull();
    expect(c.component.reallocation()).toBeNull();
  });

  it('requires both an account code and a reason before it will submit', () => {
    const c = createComponent();
    httpMock = c.httpMock;
    c.component.startReallocate();

    expect(c.component.toAccountCodeControl.invalid).toBe(true);
    expect(c.component.reasonControl.invalid).toBe(true);

    // Guard: submitting an invalid form must not fire a request.
    c.component.submitReallocate();
    httpMock.expectNone((r) => r.url.includes('/reallocate'));

    c.component.toAccountCodeControl.setValue('DGB-00456');
    c.component.reasonControl.setValue('wrong code given');
    expect(c.component.toAccountCodeControl.valid).toBe(true);
    expect(c.component.reasonControl.valid).toBe(true);
  });

  it('fetches a preview on blur and exposes the credit/charge split', () => {
    const c = createComponent();
    httpMock = c.httpMock;
    c.component.startReallocate();
    c.component.toAccountCodeControl.setValue('  DGB-00456  ');
    c.component.loadPreview();

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/reallocation-preview') && r.params.get('toAccountCode') === 'DGB-00456',
    );
    expect(req.request.method).toBe('GET');
    req.flush(preview);

    expect(c.component.preview()?.toCustomerName).toBe('Nancy Wangechi');
    expect(c.component.preview()?.reclaimable).toBe(2000);
    expect(c.component.preview()?.shortfall).toBe(1000);
    expect(c.component.previewError()).toBeNull();
  });

  it('skips the preview request entirely for a blank code', () => {
    const c = createComponent();
    httpMock = c.httpMock;
    c.component.startReallocate();
    c.component.toAccountCodeControl.setValue('   ');
    c.component.loadPreview();

    httpMock.expectNone((r) => r.url.includes('/reallocation-preview'));
    expect(c.component.preview()).toBeNull();
  });

  it('surfaces the server detail and clears revokeRecharge when the code does not resolve', () => {
    const c = createComponent();
    httpMock = c.httpMock;
    c.component.startReallocate();
    c.component.toAccountCodeControl.setValue('DGB-NOPE');
    c.component.revokeRechargeControl.setValue(true);
    c.component.loadPreview();

    httpMock
      .expectOne((r) => r.url.includes('/reallocation-preview'))
      .flush(
        { detail: 'No customer found for account code: DGB-NOPE' },
        { status: 404, statusText: 'Not Found' },
      );

    expect(c.component.previewError()).toBe('No customer found for account code: DGB-NOPE');
    expect(c.component.preview()).toBeNull();
    // Stale opt-in must not survive a failed resolve, or it could be submitted blind.
    expect(c.component.revokeRechargeControl.value).toBe(false);
  });

  it('posts the trimmed code, reason and revokeRecharge flag, then shows the result', () => {
    const c = createComponent();
    httpMock = c.httpMock;
    const snack = vi.spyOn(TestBed.inject(MatSnackBar), 'open');

    c.component.startReallocate();
    c.component.toAccountCodeControl.setValue(' DGB-00456 ');
    c.component.reasonControl.setValue('customer given wrong code');
    c.component.revokeRechargeControl.setValue(true);
    c.component.submitReallocate();

    const req = httpMock.expectOne((r) => r.url.endsWith(`/api/payments/${PAYMENT_ID}/reallocate`));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      toAccountCode: 'DGB-00456',
      reason: 'customer given wrong code',
      revokeRecharge: true,
    });

    req.flush({
      id: 'ra-1',
      paymentId: PAYMENT_ID,
      amount: 3000,
      fromCustomerId: 'c-wrong',
      fromAccountCode: 'DGB-00123',
      toCustomerId: 'c-right',
      toAccountCode: 'DGB-00456',
      reclaimedFromCredit: 2000,
      shortfallCharged: 1000,
      shortfallChargeId: 'ch-1',
      revokedRechargeId: 'r-1',
      activatedRechargeId: 'rc-1',
      reason: 'customer given wrong code',
      reallocatedBy: 'admin@ispnest.com',
      createdAt: '2026-09-04T08:07:32Z',
    });

    // The payment now belongs to the other customer, so the component reloads it.
    httpMock.expectOne((r) => r.url.endsWith(`/api/payments/${PAYMENT_ID}`)).flush({
      ...payment,
      customerId: 'c-right',
      accountCode: 'DGB-00456',
    });

    expect(c.component.reallocation()?.toAccountCode).toBe('DGB-00456');
    expect(c.component.reallocating()).toBe(false);
    expect(c.component.submitting()).toBe(false);
    expect(snack).toHaveBeenCalledWith(
      expect.stringContaining('DGB-00456'),
      'OK',
      expect.anything(),
    );
  });

  it('keeps the form open and stops the spinner when the server rejects the move', () => {
    const c = createComponent();
    httpMock = c.httpMock;
    const snack = vi.spyOn(TestBed.inject(MatSnackBar), 'open');

    c.component.startReallocate();
    c.component.toAccountCodeControl.setValue('DGB-00456');
    c.component.reasonControl.setValue('again');
    c.component.submitReallocate();

    httpMock
      .expectOne((r) => r.url.includes('/reallocate'))
      .flush(
        { detail: 'it has already been reallocated once' },
        { status: 409, statusText: 'Conflict' },
      );

    expect(c.component.submitting()).toBe(false);
    // Left open on purpose so the operator can correct their input rather than start over.
    expect(c.component.reallocating()).toBe(true);
    expect(c.component.reallocation()).toBeNull();
    expect(snack).toHaveBeenCalledWith(
      'it has already been reallocated once',
      'OK',
      expect.anything(),
    );
  });

  it('shows the existing record instead of the form for an already-moved payment', () => {
    const c = createComponent({ alreadyReallocated: true });
    httpMock = c.httpMock;

    expect(c.component.reallocation()).not.toBeNull();
  });
});
