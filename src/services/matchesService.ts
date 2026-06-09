import axios from "axios";

// The WC2026 match + prediction APIs live in the "other" service.
const API_URL = `${import.meta.env.VITE_PORT}/api/v1/other`;

const getHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Api-Key": token,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED";
export type MatchOutcome = "HOME" | "DRAW" | "AWAY";

export interface Match {
  id: string;
  matchId: number;
  stage: string;
  group: string | null;
  matchday: number | null;
  date: string;
  time: string;
  venue: string;
  city: string;
  country: string;
  home: string;
  homeCode: string;
  away: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  outcome: MatchOutcome | null;
  settledAt: string | null;
}

export interface UpdateMatchPayload {
  homeScore?: number;
  awayScore?: number;
  status?: MatchStatus;
  home?: string;
  homeCode?: string;
  away?: string;
  awayCode?: string;
}

export interface SettleResult {
  matchId: number;
  homeScore: number;
  awayScore: number;
  outcome: MatchOutcome;
  settledPredictions: number;
  correct: number;
  coinsAwarded: number;
}

export interface MatchPredictionsSummary {
  matchId: number;
  total: number;
  tally: { HOME: number; DRAW: number; AWAY: number };
  predictions: Array<{
    id: string;
    email: string;
    predicted: MatchOutcome;
    correct: boolean | null;
    settled: boolean;
    awarded: boolean;
  }>;
}

// Public read — no auth needed, but harmless to send admin headers.
export const listMatches = async (params?: {
  stage?: string;
  status?: MatchStatus;
}): Promise<Match[]> => {
  const res = await axios.get(`${API_URL}/matches`, {
    params,
    headers: getHeaders(),
  });
  return res.data ?? [];
};

export const updateMatch = async (
  matchId: number,
  payload: UpdateMatchPayload,
): Promise<Match> => {
  const res = await axios.put(`${API_URL}/matches/${matchId}`, payload, {
    headers: getHeaders(),
  });
  return res.data;
};

export const settleMatch = async (
  matchId: number,
  finalScore?: { homeScore: number; awayScore: number },
): Promise<SettleResult> => {
  const res = await axios.post(
    `${API_URL}/matches/${matchId}/settle`,
    finalScore ?? {},
    { headers: getHeaders() },
  );
  return res.data;
};

export const getMatchPredictions = async (
  matchId: number,
): Promise<MatchPredictionsSummary> => {
  const res = await axios.get(`${API_URL}/matches/${matchId}/predictions`, {
    headers: getHeaders(),
  });
  return res.data;
};
