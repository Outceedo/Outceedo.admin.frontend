import axios from "axios";

const API_URL = import.meta.env.VITE_PORT;

const getHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Api-Key": token,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export interface BanResponse {
  message: string;
  ban?: any;
  user?: any;
}

export interface SuspendResponse {
  message: string;
  ban?: any;
  user?: any;
}

export interface DeleteResponse {
  message: string;
  deletedUser?: any;
  userId?: string;
}

export interface BannedUser {
  id: string;
  email: string;
  username: string;
  isBan: boolean;
}

export interface SuspendedUser {
  id: string;
  email: string;
  username: string;
  isSuspended: boolean;
  suspendTill: string;
}

export interface DeletedUser {
  userId: string;
  email: string;
  username: string;
  reason: string | null;
  deletedAt: string;
  expiresAt: string;
  canRestore: boolean;
}

// Ban Operations
export const banUser = async (userId: string, reason: string): Promise<BanResponse> => {
  const response = await axios.post(
    `${API_URL}/ban/ban`,
    { userId, reason },
    { headers: getHeaders() }
  );
  return response.data;
};

export const unbanUser = async (userId: string): Promise<BanResponse> => {
  const response = await axios.delete(`${API_URL}/ban/ban`, {
    params: { userId },
    headers: getHeaders(),
  });
  return response.data;
};

export const checkBan = async (userId: string): Promise<{ userId: string; isBanned: boolean }> => {
  const response = await axios.get(`${API_URL}/ban/ban/check`, {
    params: { userId },
    headers: getHeaders(),
  });
  return response.data;
};

export const getBannedUsers = async (): Promise<{ count: number; users: BannedUser[] }> => {
  const response = await axios.get(`${API_URL}/ban/bans`, {
    headers: getHeaders(),
  });
  return response.data;
};

// Suspend Operations
export const suspendUser = async (
  userId: string,
  reason: string,
  suspendTill: string
): Promise<SuspendResponse> => {
  const response = await axios.post(
    `${API_URL}/ban/suspend`,
    { userId, reason, suspendTill },
    { headers: getHeaders() }
  );
  return response.data;
};

export const unsuspendUser = async (userId: string): Promise<SuspendResponse> => {
  const response = await axios.delete(`${API_URL}/ban/suspend`, {
    params: { userId },
    headers: getHeaders(),
  });
  return response.data;
};

export const checkSuspend = async (
  userId: string
): Promise<{ userId: string; isSuspended: boolean; suspendTill: string | null }> => {
  const response = await axios.get(`${API_URL}/ban/suspend/check`, {
    params: { userId },
    headers: getHeaders(),
  });
  return response.data;
};

export const getSuspendedUsers = async (): Promise<{ count: number; users: SuspendedUser[] }> => {
  const response = await axios.get(`${API_URL}/ban/suspends`, {
    headers: getHeaders(),
  });
  return response.data;
};

// Delete Operations
export const softDeleteUser = async (userId: string, reason?: string): Promise<DeleteResponse> => {
  const response = await axios.post(
    `${API_URL}/ban/delete`,
    { userId, reason },
    { headers: getHeaders() }
  );
  return response.data;
};

export const restoreUser = async (userId: string): Promise<DeleteResponse> => {
  const response = await axios.post(
    `${API_URL}/ban/restore`,
    {},
    {
      params: { userId },
      headers: getHeaders(),
    }
  );
  return response.data;
};

export const permanentDeleteUser = async (userId: string): Promise<DeleteResponse> => {
  const response = await axios.delete(`${API_URL}/ban/delete/permanent`, {
    params: { userId },
    headers: getHeaders(),
  });
  return response.data;
};

export const getDeletedUsers = async (): Promise<{ count: number; users: DeletedUser[] }> => {
  const response = await axios.get(`${API_URL}/ban/deleted`, {
    headers: getHeaders(),
  });
  return response.data;
};
