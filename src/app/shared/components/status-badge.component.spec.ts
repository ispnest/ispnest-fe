import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return green class for active status', () => {
    component.status = 'active';
    expect(component.badgeClass).toContain('bg-green-100');
  });

  it('should return red class for failed status', () => {
    component.status = 'failed';
    expect(component.badgeClass).toContain('bg-red-100');
  });

  it('should return yellow class for pending status', () => {
    component.status = 'pending';
    expect(component.badgeClass).toContain('bg-yellow-100');
  });

  it('should return yellow class for suspended status', () => {
    component.status = 'suspended';
    expect(component.badgeClass).toContain('bg-yellow-100');
  });

  it('should return gray class for unknown status', () => {
    component.status = 'unknown-status';
    expect(component.badgeClass).toContain('bg-gray-100');
  });

  it('should handle empty status', () => {
    component.status = '';
    expect(component.badgeClass).toBeTruthy();
  });
});

