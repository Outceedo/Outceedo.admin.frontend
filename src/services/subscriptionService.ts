import axios from "axios";

const API_URL = import.meta.env.VITE_PORT;

const getHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Api-Key": token,
    "Content-Type": "application/json",
  };
};

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "day" | "week" | "month" | "year" | "one_time";
  description?: string | null;
  stripePriceId: string;
  stripeProductId: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: string;
  status: "ACTIVE" | "CANCELED" | "EXPIRED" | "PENDING";
  stripeId: string;
  startDate: string;
  endDate: string;
  plan?: Plan;
}

export interface PremiumRow {
  subscription: SubscriptionRecord;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string;
    email: string;
    role: string;
    photo: string | null;
  } | null;
  isManual: boolean;
}

export interface GrantPremiumPayload {
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
}

export const listPlans = async (): Promise<Plan[]> => {
  const res = await axios.get(`${API_URL}/subscription/plans`, {
    headers: getHeaders(),
  });
  return res.data?.plans ?? [];
};

export const getUserSubscription = async (
  userId: string,
): Promise<SubscriptionRecord | null> => {
  const res = await axios.get(`${API_URL}/subscription/user/${userId}`, {
    headers: getHeaders(),
  });
  return res.data?.subscription ?? null;
};

export const listPremiumUsers = async (
  role?: string,
): Promise<{ count: number; rows: PremiumRow[] }> => {
  const res = await axios.get(`${API_URL}/subscription/premium-users`, {
    params: role ? { role } : undefined,
    headers: getHeaders(),
  });
  return res.data;
};

export const grantPremium = async (payload: GrantPremiumPayload) => {
  const res = await axios.post(
    `${API_URL}/subscription/grant-premium`,
    payload,
    { headers: getHeaders() },
  );
  return res.data;
};

export const revokePremium = async (userId: string) => {
  const res = await axios.post(
    `${API_URL}/subscription/revoke/${userId}`,
    {},
    { headers: getHeaders() },
  );
  return res.data;
};
