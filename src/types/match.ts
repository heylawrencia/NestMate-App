import { BackendProfile } from './profile';

export type MatchAlignment = 'ALIGNED' | 'POTENTIAL_CLASH';

export interface FactorBreakdown {
  factor: string;
  label: string;
  weight: number;
  status: MatchAlignment | string;
  yours: string;
  theirs: string;
  explanation: string;
}

export interface SharedInterest {
  label: string;
  emoji?: string;
}

export interface LegacyMatchBreakdown {
  sleep: MatchAlignment;
  cleanliness: MatchAlignment;
  noise: MatchAlignment;
  budget: MatchAlignment;
}

export interface Match {
  userId: number;
  fullName: string;
  score: number;
  summary?: string;
  breakdown?: FactorBreakdown[] | LegacyMatchBreakdown;
  sharedInterestCount?: number;
  sharedInterests?: SharedInterest[];
  profile?: BackendProfile;
  age?: number;
}

export interface PaywallQuota {
  used: number;
  limit: number;
  resetsOn?: string;
}
