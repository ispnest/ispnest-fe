// Public API barrel for real-estate domain data layer
export { PropertyApiService } from './property-api.service';
export type {
  PropertyType,
  RentalType,
  PropertyStatus,
  HousekeepingStatus,
  PropertyDocumentType,
  AmenityDto,
  PropertyDto,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyPhotoDto,
  PropertyDocumentDto,
  UpdateHousekeepingStatusRequest,
} from './property.model';
export { OwnerApiService } from './owner-api.service';
export type {
  OwnerStatus,
  OwnerDto,
  CreateOwnerRequest,
  UpdateOwnerRequest,
  OwnerPortalAccessDto,
  GrantPortalAccessResponse,
} from './owner.model';
export { AmenityApiService } from './amenity-api.service';
export type { CreateAmenityRequest } from './amenity.model';
export { RenterApiService } from './renter-api.service';
export type { RenterStatus, RenterDto, CreateRenterRequest, UpdateRenterRequest } from './renter.model';
export { LeaseApiService } from './lease-api.service';
export type {
  LeaseStatus,
  BillingCycle,
  LeaseDto,
  CreateLeaseRequest,
  UpdateLeaseRequest,
  TerminateLeaseRequest,
} from './lease.model';
export { GuestApiService } from './guest-api.service';
export type { GuestStatus, GuestDto, CreateGuestRequest, UpdateGuestRequest } from './guest.model';
export { BookingApiService } from './booking-api.service';
export type {
  BookingStatus,
  BookingDto,
  CreateBookingRequest,
  UpdateBookingRequest,
  CancelBookingRequest,
} from './booking.model';
