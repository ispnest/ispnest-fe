import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading initially', () => {
    expect(component.loading()).toBeTruthy();
  });

  it('should load customers and routers on init', () => {
    fixture.detectChanges();

    const customersReq = httpMock.expectOne('/api/customers');
    const routersReq = httpMock.expectOne('/api/routers');

    customersReq.flush([
      { id: '1', status: 'active', fullName: 'Alice' },
      { id: '2', status: 'inactive', fullName: 'Bob' }
    ]);
    routersReq.flush([
      { id: 'r1', status: 'online', name: 'Router 1', ipAddress: '192.168.1.1' },
      { id: 'r2', status: 'offline', name: 'Router 2', ipAddress: '192.168.1.2' }
    ]);

    fixture.detectChanges();

    expect(component.loading()).toBeFalsy();
    expect(component.totalCustomers()).toBe(2);
    expect(component.activeCustomers()).toBe(1);
    expect(component.totalRouters()).toBe(2);
    expect(component.onlineRouters()).toBe(1);
  });
});


