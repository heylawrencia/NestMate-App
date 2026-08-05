import { MOCK_HOSTELS } from '../data/hostels';
import {
  Hostel,
  HostelCategory,
  HostelFilterOptions,
  HostelSearchFilters,
  HoldView,
  RoomSummary,
  RoomType,
  VerifyAccessCodeResult,
} from '../types/hostel';
import { api, ApiError } from './apiClient';

export const CURRENT_ACADEMIC_YEAR = '2026/27';

interface BackendHostelSummary {
  hostelId: number;
  name: string;
  area: string;
  photoUrl?: string;
  photoUrls?: string[];
  rating: number;
  kind: 'HOSTEL' | 'APARTMENT';
  fromPricePerYear: number;
  bedsAvailable: number;
}

interface BackendRoomTypeInfo {
  roomTypeId: number;
  capacity: number;
  pricePerBedPerYear: number;
  bedsAvailable: number;
}

interface BackendHostelDetail extends Omit<BackendHostelSummary, 'fromPricePerYear' | 'bedsAvailable'> {
  description?: string;
  roomTypes: BackendRoomTypeInfo[];
}

interface BackendHoldView {
  holdId: number;
  bedId: number;
  roomLabel: string;
  hostelName: string;
  amount: number;
  expiresAt: string;
  status: string;
}

interface BackendBed {
  bedId: number;
  status: 'FREE' | 'HELD' | 'CONFIRMED';
}

interface BackendRoomSummary {
  roomId: number;
  label: string;
  capacity: number;
  beds: BackendBed[];
  myAvgCompatibility: number | null;
}

function toHoldView(h: BackendHoldView): HoldView {
  return {
    holdId: String(h.holdId),
    bedId: String(h.bedId),
    roomLabel: h.roomLabel,
    hostelName: h.hostelName,
    amount: h.amount,
    expiresAt: h.expiresAt,
    status: h.status,
  };
}

function toRoomSummary(r: BackendRoomSummary): RoomSummary {
  const freeBed = r.beds.find((b) => b.status === 'FREE');
  return {
    id: String(r.roomId),
    label: r.label,
    capacity: r.capacity,
    bedsAvailable: r.beds.filter((b) => b.status === 'FREE').length,
    myAvgCompatibility: r.myAvgCompatibility,
    freeBedId: freeBed ? String(freeBed.bedId) : undefined,
  };
}

function toCategory(kind: 'HOSTEL' | 'APARTMENT'): HostelCategory {
  return kind === 'APARTMENT' ? 'Apartments' : 'Hostels';
}

function toRoomType(rt: BackendRoomTypeInfo): RoomType {
  return {
    id: String(rt.roomTypeId),
    label: `${rt.capacity} in a room`,
    pricePerYear: rt.pricePerBedPerYear,
    capacity: rt.capacity,
    bedsLeft: rt.bedsAvailable,
  };
}

function summaryToHostel(h: BackendHostelSummary): Hostel {
  return {
    id: String(h.hostelId),
    name: h.name,
    shortName: h.name.split(' ')[0],
    category: toCategory(h.kind),
    location: h.area,
    distanceNote: h.area,
    rating: h.rating,
    bedsAvailable: h.bedsAvailable,
    fromPricePerYear: h.fromPricePerYear,
    imageUrl: h.photoUrls?.[0] ?? h.photoUrl,
    imageUrls: h.photoUrls,
    photoCount: h.photoUrls?.length,
    amenities: [],
    roomTypes: [],
  };
}

function detailToHostel(h: BackendHostelDetail): Hostel {
  const roomTypes = h.roomTypes.map(toRoomType);
  const prices = roomTypes.map((rt) => rt.pricePerYear);
  return {
    id: String(h.hostelId),
    name: h.name,
    shortName: h.name.split(' ')[0],
    category: toCategory(h.kind),
    location: h.area,
    distanceNote: h.area,
    rating: h.rating,
    bedsAvailable: roomTypes.reduce((sum, rt) => sum + rt.bedsLeft, 0),
    fromPricePerYear: prices.length ? Math.min(...prices) : 0,
    imageUrl: h.photoUrls?.[0] ?? h.photoUrl,
    imageUrls: h.photoUrls,
    photoCount: h.photoUrls?.length,
    amenities: [],
    roomTypes,
  };
}

export async function fetchFilterOptions(): Promise<HostelFilterOptions> {
  try {
    return await api<HostelFilterOptions>('/api/hostels/filters');
  } catch (e) {
    console.warn('Failed to fetch filter options from API:', e);
    return {
      areas: ['KNUST Campus', 'Ayeduase', 'Kotei', 'Gaza'],
      minPrice: 1000,
      maxPrice: 15000,
      capacities: [1, 2, 3, 4],
      kinds: ['HOSTEL', 'APARTMENT'],
    };
  }
}

export async function fetchHostels(filters: HostelSearchFilters = {}): Promise<Hostel[]> {
  const params = new URLSearchParams();
  if (filters.query?.trim()) params.set('search', filters.query.trim());
  if (filters.category) params.set('kind', filters.category === 'Apartments' ? 'APARTMENT' : 'HOSTEL');
  if (filters.kind && filters.kind !== 'ANY') params.set('kind', filters.kind);
  if (filters.areas && filters.areas.length > 0) params.set('area', filters.areas.join(','));
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.capacities && filters.capacities.length > 0) params.set('capacity', filters.capacities.join(','));
  if (filters.availableOnly) params.set('availableOnly', 'true');
  if (filters.sort) params.set('sort', filters.sort);

  const qs = params.toString();
  const list = await api<BackendHostelSummary[]>(`/api/hostels${qs ? `?${qs}` : ''}`);
  return (list ?? []).map(summaryToHostel);
}

export async function fetchHostelById(hostelId: string): Promise<Hostel | null> {
  const detail = await api<BackendHostelDetail>(`/api/hostels/${hostelId}`);
  return detailToHostel(detail);
}

/** Rooms of a given type in a hostel, with compatibility against current occupants. */
export async function fetchRoomsForType(hostelId: string, roomTypeId: string): Promise<RoomSummary[]> {
  try {
    const list = await api<BackendRoomSummary[]>(
      `/api/hostels/${hostelId}/rooms?roomTypeId=${roomTypeId}`,
    );
    return list.map(toRoomSummary);
  } catch (e) {
    console.warn('fetchRoomsForType failed:', e);
    return [];
  }
}

/** Starts a 48-hour hold on a bed. Throws ApiError if it was just taken. */
export async function holdBed(bedId: string): Promise<HoldView> {
  const hold = await api<BackendHoldView>(`/api/beds/${bedId}/hold`, { method: 'POST' });
  return toHoldView(hold);
}

/** The caller's active hold, or null if they don't have one (never had one, paid, cancelled, or expired). */
export async function fetchMyHold(): Promise<HoldView | null> {
  try {
    const hold = await api<BackendHoldView>('/api/holds/me');
    return toHoldView(hold);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    console.warn('fetchMyHold failed:', e);
    return null;
  }
}

export async function cancelHold(holdId: string): Promise<void> {
  await api(`/api/holds/${holdId}`, { method: 'DELETE' });
}

export async function verifyAccessCode(
  hostelId: string,
  code: string,
): Promise<VerifyAccessCodeResult> {
  try {
    const hold = await api<BackendHoldView>('/api/holds/me');
    if (!hold || !hold.holdId) {
      return {
        success: false,
        errorMessage: 'No active bed hold found. Please select a bed and start a 48-hour hold first.',
      };
    }

    const cleanCode = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const formattedCode = cleanCode.length === 6 ? `${cleanCode.slice(0, 3)}-${cleanCode.slice(3)}` : cleanCode;

    try {
      await api(`/api/holds/${hold.holdId}/confirm-code`, {
        method: 'POST',
        body: { code: formattedCode },
      });
      return { success: true };
    } catch (firstErr) {
      // Try raw unhyphenated code as fallback if formatted code failed
      await api(`/api/holds/${hold.holdId}/confirm-code`, {
        method: 'POST',
        body: { code: cleanCode },
      });
      return { success: true };
    }
  } catch (e) {
    const message =
      e instanceof ApiError
        ? e.message === 'No active hold' || e.status === 404
          ? 'No active bed hold found. Please select a room and hold a bed first.'
          : e.message
        : 'That code doesn’t look right. Check your receipt and try again.';
    return { success: false, errorMessage: message };
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

export function formatAccessCode(code: string): string {
  return code.length > 3 ? `${code.slice(0, 3)}-${code.slice(3)}` : code;
}
