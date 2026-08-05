export type PropertyType = 'HOUSE' | 'APARTMENT' | 'VILLA' | 'ROOM' | 'COMMERCIAL_UNIT' | 'LAND';

export type RentalType = 'SHORT_TERM' | 'LONG_TERM' | 'BOTH';

export type PropertyStatus = 'DRAFT' | 'AVAILABLE' | 'OCCUPIED' | 'UNDER_MAINTENANCE' | 'INACTIVE';

export type HousekeepingStatus = 'CLEAN' | 'DIRTY' | 'IN_PROGRESS';

export type PropertyDocumentType =
  | 'TITLE_DEED'
  | 'OWNER_ID'
  | 'INSPECTION_REPORT'
  | 'LEASE_AGREEMENT'
  | 'BOOKING_CONFIRMATION'
  | 'GUEST_ID_DOCUMENT'
  | 'OTHER';

export type AmenityDto = {
  id: string;
  name: string;
  icon: string | null;
  category: string | null;
};

export type PropertyDto = {
  id: string;
  ownerId: string;
  ownerName: string | null;
  name: string;
  propertyType: PropertyType;
  rentalType: RentalType;
  status: PropertyStatus;
  housekeepingStatus: HousekeepingStatus;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sizeSqm: number | null;
  notes: string | null;
  amenities: AmenityDto[];
  photoCount: number;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatePropertyRequest = {
  ownerId: string;
  name: string;
  propertyType: PropertyType;
  rentalType: RentalType;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sizeSqm?: number | null;
  notes?: string;
};

export type UpdatePropertyRequest = CreatePropertyRequest & {
  status?: PropertyStatus;
};

export type PropertyPhotoDto = {
  id: string;
  propertyId: string;
  url: string;
  originalFilename: string;
  displayOrder: number;
  caption: string | null;
  createdAt: string;
};

export type PropertyDocumentDto = {
  id: string;
  propertyId: string;
  url: string;
  originalFilename: string;
  documentType: PropertyDocumentType;
  createdAt: string;
};

export type UpdateHousekeepingStatusRequest = {
  status: HousekeepingStatus;
};
