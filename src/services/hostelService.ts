import { apiClient } from './apiClient';
import { Hostel, HostelCategory, HostelSearchFilters, RoomType, VerifyAccessCodeResult } from '../types/hostel';

export const CURRENT_ACADEMIC_YEAR = '2026/27';

type BackendHostelKind = 'HOSTEL' | 'APARTMENT';

interface BackendHostelSummary {
  hostelId: number;
  name: string;
  area: string;
  photoUrl: string | null;
  rating: number;
  kind: BackendHostelKind;
  fromPricePerYear: number;
  bedsAvailable: number;
}

interface BackendRoomTypeInfo {
  roomTypeId: number;
  capacity: number;
  pricePerBedPerYear: number;
  bedsAvailable: number;
}

interface BackendHostelDetail {
  hostelId: number;
  name: string;
  description: string;
  area: string;
  photoUrl: string | null;
  rating: number;
  kind: BackendHostelKind;
  roomTypes: BackendRoomTypeInfo[];
}

function toCategory(kind: BackendHostelKind): HostelCategory {
  return kind === 'APARTMENT' ? 'Apartments' : 'Hostels';
}

function toKind(category: HostelCategory): BackendHostelKind {
  return category === 'Apartments' ? 'APARTMENT' : 'HOSTEL';
}

function toRoomType(info: BackendRoomTypeInfo): RoomType {
  return {
    id: String(info.roomTypeId),
    label: `${info.capacity}-in-a-room`,
    pricePerYear: info.pricePerBedPerYear,
    capacity: info.capacity,
    bedsLeft: info.bedsAvailable,
  };
}

function toHostelSummary(summary: BackendHostelSummary): Hostel {
  return {
    id: String(summary.hostelId),
    name: summary.name,
    // No backend equivalent for these decorative fields - best-effort defaults so
    // existing UI (which treats them as required) doesn't need optional-chaining.
    shortName: summary.name,
    category: toCategory(summary.kind),
    location: summary.area,
    distanceNote: '',
    rating: summary.rating,
    bedsAvailable: summary.bedsAvailable,
    fromPricePerYear: summary.fromPricePerYear,
    imageUrl: summary.photoUrl ?? undefined,
    amenities: [],
    roomTypes: [],
  };
}

function toHostelDetail(detail: BackendHostelDetail): Hostel {
  const roomTypes = detail.roomTypes.map(toRoomType);
  const bedsAvailable = roomTypes.reduce((sum, roomType) => sum + roomType.bedsLeft, 0);
  const fromPricePerYear = roomTypes.length
    ? Math.min(...roomTypes.map((roomType) => roomType.pricePerYear))
    : 0;

  return {
    id: String(detail.hostelId),
    name: detail.name,
    shortName: detail.name,
    category: toCategory(detail.kind),
    location: detail.area,
    distanceNote: '',
    rating: detail.rating,
    bedsAvailable,
    fromPricePerYear,
    imageUrl: detail.photoUrl ?? undefined,
    amenities: [],
    roomTypes,
  };
}

export async function fetchHostels(filters: HostelSearchFilters = {}): Promise<Hostel[]> {
  const params = new URLSearchParams();
  if (filters.query?.trim()) {
    params.set('search', filters.query.trim());
  }
  if (filters.category) {
    params.set('kind', toKind(filters.category));
  }
  const query = params.toString();
  const summaries = await apiClient.get<BackendHostelSummary[]>(`/api/hostels${query ? `?${query}` : ''}`);
  return summaries.map(toHostelSummary);
}

export async function fetchHostelById(hostelId: string): Promise<Hostel | null> {
  try {
    const detail = await apiClient.get<BackendHostelDetail>(`/api/hostels/${hostelId}`);
    return toHostelDetail(detail);
  } catch {
    return null;
  }
}

export function getRoomType(hostel: Hostel, roomTypeId: string): RoomType | undefined {
  return hostel.roomTypes.find((roomType) => roomType.id === roomTypeId);
}

export function getPriceRange(hostel: Hostel): { min: number; max: number } {
  const prices = hostel.roomTypes.map((roomType) => roomType.pricePerYear);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getRoomTypeSummary(hostel: Hostel): string {
  return hostel.roomTypes
    .map((roomType) => roomType.label.match(/^\d+/)?.[0] ?? roomType.label)
    .join(' · ');
}

// AccessCode/CodeVerified screens are reworked in Phase 2 to hit the real
// hold-confirmation endpoint; this stays a stub until that lands.
export async function verifyAccessCode(hostelId: string, code: string): Promise<VerifyAccessCodeResult> {
  return { success: Boolean(hostelId) && code.length === 6 };
}

export function formatAccessCode(code: string): string {
  return code.length > 3 ? `${code.slice(0, 3)}-${code.slice(3)}` : code;
}
