export type HostelCategory = 'Hostels' | 'Apartments';

export type HostelSortOption =
  | 'RECOMMENDED'
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'RATING_DESC'
  | 'AVAILABILITY_DESC';

export interface RoomType {
  id: string;
  label: string;
  pricePerYear: number;
  capacity: number;
  bedsLeft: number;
  studentsMatching?: number;
}

export interface Hostel {
  id: string;
  name: string;
  shortName: string;
  category: HostelCategory;
  location: string;
  distanceNote: string;
  rating: number;
  bedsAvailable: number;
  fromPricePerYear: number;
  imageUrl?: string;
  imageUrls?: string[];
  photoCount?: number;
  amenities: string[];
  roomTypes: RoomType[];
}

export interface HostelSearchFilters {
  query?: string;
  category?: HostelCategory;
  areas?: string[];
  minPrice?: number;
  maxPrice?: number;
  capacities?: number[];
  kind?: 'HOSTEL' | 'APARTMENT' | 'ANY';
  availableOnly?: boolean;
  sort?: HostelSortOption;
}

export interface HostelFilterOptions {
  areas: string[];
  minPrice: number;
  maxPrice: number;
  capacities: number[];
  kinds: string[];
}

export interface VerifyAccessCodeResult {
  success: boolean;
  errorMessage?: string;
}

export interface RoomSummary {
  id: string;
  label: string;
  capacity: number;
  bedsAvailable: number;
  /** Average compatibility with current occupants, 0-100. Null for an empty room or profile-less user. */
  myAvgCompatibility: number | null;
  /** First free bed in this room, if any - what gets held when the room is picked. */
  freeBedId?: string;
}

export interface HoldView {
  holdId: string;
  bedId: string;
  roomLabel: string;
  hostelName: string;
  amount: number;
  expiresAt: string;
  status: string;
}
