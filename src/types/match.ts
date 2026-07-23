import { BackendProfile } from './profile';

export type MatchAlignment = 'ALIGNED' | 'POTENTIAL_CLASH';

export interface MatchBreakdown {
  sleep: MatchAlignment;
  cleanliness: MatchAlignment;
  noise: MatchAlignment;
  budget: MatchAlignment;
}

export interface Match {
  userId: number;
  fullName: string;
  score: number;
  profile: BackendProfile;
  breakdown: MatchBreakdown;
}
