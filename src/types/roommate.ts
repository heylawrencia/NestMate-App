export type RoommateMemberStatus = 'matched' | 'friend';

export type CandidateGender = 'female' | 'male';

export interface RoommateCandidate {
  id: string;
  name: string;
  gender: CandidateGender;
  matchPercent: number;
  program: string;
  level: string;
  traits: string[];
  bio?: string;
  avatarUri?: string;
}

export interface RoommateGroupMember {
  id: string;
  name: string;
  status: RoommateMemberStatus;
  matchPercent?: number;
  friendCode?: string;
  avatarUri?: string;
  program?: string;
  level?: string;
  traits?: string[];
  bio?: string;
}

export interface RoommateGroupSuggestion {
  id: string;
  members: RoommateCandidate[];
}

export type AllocationStatus = 'pending' | 'assigned';

export interface AllocationResult {
  status: AllocationStatus;
  roomNumber?: string;
  floor?: string;
  academicYear?: string;
}
