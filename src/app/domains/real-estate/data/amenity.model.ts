export type { AmenityDto } from './property.model';

export type CreateAmenityRequest = {
  name: string;
  icon?: string;
  category?: string;
};
