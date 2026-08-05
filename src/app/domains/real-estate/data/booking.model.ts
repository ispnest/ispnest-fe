export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export type BookingDto = {
  id: string;
  propertyId: string;
  propertyName: string | null;
  guestId: string;
  guestName: string | null;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number | null;
  linkedCustomerId: string | null;
  status: BookingStatus;
  cancellationReason: string | null;
  notes: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBookingRequest = {
  propertyId: string;
  guestId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount?: number | null;
  notes?: string;
};

export type UpdateBookingRequest = Omit<CreateBookingRequest, 'propertyId' | 'guestId'>;

export type CancelBookingRequest = {
  reason: string;
};
