import {
  AllocationResult,
  CandidateGender,
  RoommateCandidate,
  RoommateGroupMember,
  RoommateGroupSuggestion,
} from '../types/roommate';
import { CURRENT_ACADEMIC_YEAR } from './hostelService';
import { api } from './apiClient';

/**
 * HYBRID real implementation.
 * - Candidates come from the REAL backend matching engine (GET /api/matches) -
 *   live compatibility scores from the weighted algorithm, same for every
 *   hostel/room-type (the backend does not scope matches per-room yet).
 * - Gender filtering is DROPPED: the backend profile has no gender field
 *   today, so `gender` is stubbed 'female' on every real candidate rather
 *   than guessed. If a screen filters strictly by the user's own gender,
 *   candidates will still display (union of the pool) but the split is not
 *   backend-driven yet - documented as a known gap.
 * - Friend codes and group-suggestion chunking are session-local (no backend
 *   model for either) - "liking" a candidate still adds them to your matched
 *   list, exactly like the mock did, just seeded with real people + real scores.
 * - Allocation status is REAL: "assigned" the moment the user's bed is
 *   CONFIRMED in the backend (i.e. after code verification).
 */

interface BackendMatch {
  userId: number;
  fullName: string;
  score: number;
  profile?: { gender?: string; city?: string; sleepSchedule?: string; seekingType?: string };
  breakdown?: { sleep?: string; cleanliness?: string; noise?: string; budget?: string };
}

interface BackendHousing {
  hasRoom: boolean;
  hostelName?: string;
  roomNumber?: string;
  floor?: string;
}

function traitsFrom(m: BackendMatch): string[] {
  const traits: string[] = [];
  if (m.breakdown?.sleep === 'ALIGNED') traits.push('Sleep match');
  if (m.breakdown?.cleanliness === 'ALIGNED') traits.push('Tidiness match');
  if (m.breakdown?.noise === 'ALIGNED') traits.push('Noise fit');
  if (m.breakdown?.budget === 'ALIGNED') traits.push('Budget fit');
  if (m.profile?.sleepSchedule === 'NIGHT_OWL') traits.push('Night Owl');
  if (m.profile?.sleepSchedule === 'EARLY_BIRD') traits.push('Early Bird');
  return traits.length ? traits : ['NESTMATE user'];
}

function toCandidateGender(backendGender?: string): CandidateGender {
  switch (backendGender) {
    case 'FEMALE': return 'female';
    case 'MALE': return 'male';
    case 'NON_BINARY': return 'non-binary';
    default: return 'prefer-not-to-say';
  }
}

function toCandidate(m: BackendMatch): RoommateCandidate {
  return {
    id: String(m.userId),
    name: m.fullName,
    gender: toCandidateGender(m.profile?.gender),
    matchPercent: Math.round(m.score),
    program: m.profile?.city ? `Based in ${m.profile.city}` : 'NESTMATE user',
    level: m.profile?.seekingType === 'OFFERING_ROOM' ? 'Offering a room' : 'Seeking a room',
    traits: traitsFrom(m),
    bio: `${Math.round(m.score)}% compatibility based on lifestyle fit.`,
  };
}

async function fetchAllCandidates(): Promise<RoommateCandidate[]> {
  try {
    const matches = await api<BackendMatch[]>('/api/matches?limit=20');
    return matches.map(toCandidate);
  } catch (e) {
    console.warn('fetchAllCandidates failed (profile created? logged in?):', e);
    return [];
  }
}

// session-local state: swiped candidates and matched members, per hostel/room-type
type GroupState = { members: RoommateGroupMember[]; seen: Set<string> };
const groupStates = new Map<string, GroupState>();
const allMatchedEver: RoommateGroupMember[] = [];

function keyFor(hostelId: string, roomTypeId: string): string {
  return `${hostelId}:${roomTypeId}`;
}
function getState(key: string): GroupState {
  if (!groupStates.has(key)) groupStates.set(key, { members: [], seen: new Set() });
  return groupStates.get(key)!;
}
function toMatchedMember(c: RoommateCandidate): RoommateGroupMember {
  return {
    id: c.id, name: c.name, status: 'matched', matchPercent: c.matchPercent,
    program: c.program, level: c.level, traits: c.traits, bio: c.bio,
  };
}

export async function fetchAllMatches(): Promise<RoommateGroupMember[]> {
  return [...allMatchedEver];
}

export async function fetchTopMatches(limit = 3): Promise<RoommateGroupMember[]> {
  const matches = await fetchAllMatches();
  return [...matches].sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0)).slice(0, limit);
}

export async function fetchMatchById(matchId: string): Promise<RoommateGroupMember | null> {
  const matches = await fetchAllMatches();
  return matches.find((m) => m.id === matchId) ?? null;
}

export async function fetchCandidates(hostelId: string, roomTypeId: string): Promise<RoommateCandidate[]> {
  const state = getState(keyFor(hostelId, roomTypeId));
  const all = await fetchAllCandidates();
  return all.filter((c) => !state.seen.has(c.id));
}

export async function fetchCandidateById(
  hostelId: string, roomTypeId: string, candidateId: string,
): Promise<RoommateCandidate | null> {
  const all = await fetchAllCandidates();
  return all.find((c) => c.id === candidateId) ?? null;
}

export async function respondToCandidate(
  hostelId: string, roomTypeId: string, candidateId: string, liked: boolean,
): Promise<{ success: boolean }> {
  const state = getState(keyFor(hostelId, roomTypeId));
  state.seen.add(candidateId);
  if (liked) {
    const all = await fetchAllCandidates();
    const candidate = all.find((c) => c.id === candidateId);
    if (candidate) {
      const member = toMatchedMember(candidate);
      state.members.push(member);
      if (!allMatchedEver.find((m) => m.id === member.id)) allMatchedEver.push(member);
    }
  }
  return { success: true };
}

/** Group suggestions: chunk the real candidate pool into room-sized groups. */
export async function fetchGroupSuggestions(
  hostelId: string, roomTypeId: string, groupSize: number,
): Promise<RoommateGroupSuggestion[]> {
  if (groupSize <= 0) return [];
  const pool = await fetchCandidates(hostelId, roomTypeId);
  const groups: RoommateGroupSuggestion[] = [];
  for (let i = 0; i + groupSize <= pool.length; i += groupSize) {
    const members = pool.slice(i, i + groupSize);
    groups.push({ id: members.map((m) => m.id).join(','), members });
  }
  return groups;
}

export async function respondToGroup(
  hostelId: string, roomTypeId: string, groupId: string, liked: boolean,
): Promise<{ success: boolean }> {
  const state = getState(keyFor(hostelId, roomTypeId));
  const memberIds = groupId.split(',');
  const all = await fetchAllCandidates();
  for (const id of memberIds) {
    state.seen.add(id);
    if (liked) {
      const candidate = all.find((c) => c.id === id);
      if (candidate) {
        const member = toMatchedMember(candidate);
        state.members.push(member);
        if (!allMatchedEver.find((m) => m.id === member.id)) allMatchedEver.push(member);
      }
    }
  }
  return { success: true };
}

export async function fetchRoommateGroupMembers(
  hostelId: string, roomTypeId: string,
): Promise<RoommateGroupMember[]> {
  return [...getState(keyFor(hostelId, roomTypeId)).members];
}

export async function submitGroupForAllocation(
  hostelId: string, roomTypeId: string,
): Promise<{ success: boolean }> {
  return { success: true };
}

export async function fetchAllocationStatus(
  hostelId: string, roomTypeId: string,
): Promise<AllocationResult> {
  try {
    const housing = await api<BackendHousing>('/api/users/me/housing');
    if (housing.hasRoom) {
      return {
        status: 'assigned',
        roomNumber: housing.roomNumber,
        floor: housing.floor,
        academicYear: CURRENT_ACADEMIC_YEAR,
      };
    }
  } catch (e) {
    console.warn('fetchAllocationStatus failed:', e);
  }
  return { status: 'pending' };
}
