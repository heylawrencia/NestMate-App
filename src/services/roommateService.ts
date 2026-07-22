import {
  AllocationResult,
  CandidateGender,
  RoommateCandidate,
  RoommateGroupMember,
  RoommateGroupSuggestion,
} from '../types/roommate';
import { CURRENT_ACADEMIC_YEAR } from './hostelService';
import { fetchProfile } from './profileService';

const MOCK_NETWORK_DELAY_MS = 500;
const ALLOCATION_PROCESSING_MS = 4000;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_NETWORK_DELAY_MS));
}

function keyFor(hostelId: string, roomTypeId: string): string {
  return `${hostelId}:${roomTypeId}`;
}

interface GroupState {
  members: RoommateGroupMember[];
  candidateQueue: RoommateCandidate[];
}

const GENERIC_CANDIDATE_POOL: RoommateCandidate[] = [
  {
    id: 'cand-nana',
    name: 'Nana Yeboah',
    gender: 'male',
    matchPercent: 88,
    program: 'Business Admin',
    level: 'Level 200',
    traits: ['Night Owl', 'Social', 'Pet Friendly'],
    bio: "I love meeting new people and I'm pretty easygoing about noise and guests — just give me a heads up before bringing a pet over.",
  },
  {
    id: 'cand-kojo',
    name: 'Kojo Antwi',
    gender: 'male',
    matchPercent: 79,
    program: 'Mechanical Eng.',
    level: 'Level 300',
    traits: ['Quiet', 'Tidy'],
    bio: 'I keep to myself most days — a quiet study environment and a tidy room matter a lot to me.',
  },
  {
    id: 'cand-akosua',
    name: 'Akosua Boateng',
    gender: 'female',
    matchPercent: 90,
    program: 'Nursing',
    level: 'Level 100',
    traits: ['Very Clean', 'Early Bird', 'Non-smoker'],
    bio: "Cleanliness is non-negotiable for me and I don't smoke — hoping to match with roommates who feel the same.",
  },
  {
    id: 'cand-yaw',
    name: 'Yaw Darko',
    gender: 'male',
    matchPercent: 82,
    program: 'Economics',
    level: 'Level 400',
    traits: ['Social', 'Guests OK'],
    bio: 'Social and love having friends over on weekends, but always respectful of shared space.',
  },
  {
    id: 'cand-adjoa',
    name: 'Adjoa Owusu',
    gender: 'female',
    matchPercent: 85,
    program: 'Nursing',
    level: 'Level 200',
    traits: ['Social', 'Early Bird', 'Guests OK'],
    bio: "I'm an early riser who likes a lively room — happy to host friends occasionally as long as we keep things tidy.",
  },
];

function seedState(hostelId: string, roomTypeId: string): GroupState {
  if (hostelId === 'hostel-a' && roomTypeId === '4-in-a-room') {
    return {
      members: [
        { id: 'abena-gyasi', name: 'Abena Gyasi', status: 'matched', matchPercent: 93 },
        { id: 'efua-sarpong', name: 'Efua Sarpong', status: 'friend', friendCode: 'KB92' },
      ],
      candidateQueue: [
        {
          id: 'ama-mensah',
          name: 'Ama Mensah',
          gender: 'female',
          matchPercent: 96,
          program: 'Computer Science',
          level: 'Level 300',
          traits: ['Very Clean', 'Early Bird', 'Non-smoker'],
          bio: "I keep my space spotless and I'm usually in bed by 10pm — looking for roommates who value a calm, tidy room.",
        },
        ...GENERIC_CANDIDATE_POOL,
      ],
    };
  }

  return { members: [], candidateQueue: [...GENERIC_CANDIDATE_POOL] };
}

const groupStates = new Map<string, GroupState>();
const allocationRequestedAt = new Map<string, number>();

function getState(hostelId: string, roomTypeId: string): GroupState {
  const key = keyFor(hostelId, roomTypeId);
  if (!groupStates.has(key)) {
    groupStates.set(key, seedState(hostelId, roomTypeId));
  }
  return groupStates.get(key)!;
}

function normalizeGender(profileGender?: string): CandidateGender | undefined {
  if (profileGender === 'Female') return 'female';
  if (profileGender === 'Male') return 'male';
  return undefined;
}

async function currentUserGender(): Promise<CandidateGender | undefined> {
  const profile = await fetchProfile();
  return normalizeGender(profile.gender);
}

function toMatchedMember(candidate: RoommateCandidate): RoommateGroupMember {
  return {
    id: candidate.id,
    name: candidate.name,
    status: 'matched',
    matchPercent: candidate.matchPercent,
    program: candidate.program,
    level: candidate.level,
    traits: candidate.traits,
    bio: candidate.bio,
  };
}

/**
 * Flattens matched roommates across every hostel/room-type group the user
 * has swiped in during this session (`respondToCandidate(..., true)` is what
 * populates a group's members), de-duping by candidate id since the same
 * candidate can appear in more than one room-type's pool.
 */
export async function fetchAllMatches(): Promise<RoommateGroupMember[]> {
  const seen = new Set<string>();
  const matches: RoommateGroupMember[] = [];

  for (const state of groupStates.values()) {
    for (const member of state.members) {
      if (member.status === 'matched' && !seen.has(member.id)) {
        seen.add(member.id);
        matches.push(member);
      }
    }
  }

  return delay(matches);
}

export async function fetchTopMatches(limit = 3): Promise<RoommateGroupMember[]> {
  const matches = await fetchAllMatches();
  return [...matches].sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0)).slice(0, limit);
}

export async function fetchMatchById(matchId: string): Promise<RoommateGroupMember | null> {
  const matches = await fetchAllMatches();
  return matches.find((member) => member.id === matchId) ?? null;
}

export async function fetchCandidates(
  hostelId: string,
  roomTypeId: string,
): Promise<RoommateCandidate[]> {
  const gender = await currentUserGender();
  const candidates = getState(hostelId, roomTypeId).candidateQueue;
  const matching = gender ? candidates.filter((item) => item.gender === gender) : candidates;
  return delay([...matching]);
}

export async function fetchCandidateById(
  hostelId: string,
  roomTypeId: string,
  candidateId: string,
): Promise<RoommateCandidate | null> {
  const gender = await currentUserGender();
  const state = getState(hostelId, roomTypeId);
  const candidate = state.candidateQueue.find((item) => item.id === candidateId);
  if (candidate && gender && candidate.gender !== gender) {
    return delay(null);
  }
  return delay(candidate ?? null);
}

export async function respondToCandidate(
  hostelId: string,
  roomTypeId: string,
  candidateId: string,
  liked: boolean,
): Promise<{ success: boolean }> {
  const state = getState(hostelId, roomTypeId);
  const candidate = state.candidateQueue.find((item) => item.id === candidateId);
  state.candidateQueue = state.candidateQueue.filter((item) => item.id !== candidateId);

  if (liked && candidate) {
    state.members = [...state.members, toMatchedMember(candidate)];
  }

  return delay({ success: true });
}

/**
 * Chunks the remaining candidate pool into ready-made roommate groups sized
 * to fill the room (`groupSize`), so the user reviews and accepts/rejects a
 * whole prospective group at once instead of swiping on individuals one by
 * one. Leftover candidates that don't fill a complete group are held back
 * rather than surfaced as a partial group.
 */
export async function fetchGroupSuggestions(
  hostelId: string,
  roomTypeId: string,
  groupSize: number,
): Promise<RoommateGroupSuggestion[]> {
  if (groupSize <= 0) {
    return delay([]);
  }

  const gender = await currentUserGender();
  const candidates = getState(hostelId, roomTypeId).candidateQueue;
  const pool = gender ? candidates.filter((item) => item.gender === gender) : candidates;

  const groups: RoommateGroupSuggestion[] = [];
  for (let i = 0; i + groupSize <= pool.length; i += groupSize) {
    const members = pool.slice(i, i + groupSize);
    groups.push({ id: members.map((member) => member.id).join(','), members });
  }

  return delay(groups);
}

export async function respondToGroup(
  hostelId: string,
  roomTypeId: string,
  groupId: string,
  liked: boolean,
): Promise<{ success: boolean }> {
  const state = getState(hostelId, roomTypeId);
  const memberIds = new Set(groupId.split(','));
  const groupCandidates = state.candidateQueue.filter((item) => memberIds.has(item.id));

  state.candidateQueue = state.candidateQueue.filter((item) => !memberIds.has(item.id));

  if (liked) {
    state.members = [...state.members, ...groupCandidates.map(toMatchedMember)];
  }

  return delay({ success: true });
}

export async function fetchRoommateGroupMembers(
  hostelId: string,
  roomTypeId: string,
): Promise<RoommateGroupMember[]> {
  return delay([...getState(hostelId, roomTypeId).members]);
}

export async function submitGroupForAllocation(
  hostelId: string,
  roomTypeId: string,
): Promise<{ success: boolean }> {
  allocationRequestedAt.set(keyFor(hostelId, roomTypeId), Date.now());
  return delay({ success: true });
}

export async function fetchAllocationStatus(
  hostelId: string,
  roomTypeId: string,
): Promise<AllocationResult> {
  const requestedAt = allocationRequestedAt.get(keyFor(hostelId, roomTypeId));

  if (requestedAt && Date.now() - requestedAt >= ALLOCATION_PROCESSING_MS) {
    return delay({
      status: 'assigned',
      roomNumber: '204',
      floor: 'Floor 2',
      academicYear: CURRENT_ACADEMIC_YEAR,
    });
  }

  return delay({ status: 'pending' });
}
