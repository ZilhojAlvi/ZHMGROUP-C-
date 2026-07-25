import { UserRecord } from "@/types";
import { apiGet, apiPatch } from "@/lib/apiClient";

export const UserService = {
  /** Admin-only: lists all users. */
  async list(): Promise<UserRecord[]> {
    const { users } = await apiGet<{ users: UserRecord[] }>("/api/users");
    return users;
  },

  async getById(id: string): Promise<UserRecord | undefined> {
    try {
      const { user } = await apiGet<{ user: UserRecord }>(`/api/users/${id}`);
      return user;
    } catch {
      return undefined;
    }
  },

  /** Admin-only: activate/deactivate a user account. */
  async setActive(userId: string, isActive: boolean): Promise<UserRecord> {
    const { user } = await apiPatch<{ user: UserRecord }>(`/api/users/${userId}`, { isActive });
    return user;
  },

  /** Admin-only: verify or reject an agent's licence. */
  async verifyAgent(agentId: string, approve: boolean): Promise<UserRecord> {
    const { user } = await apiPatch<{ user: UserRecord }>(`/api/users/${agentId}/verify-agent`, {
      approve,
    });
    return user;
  },

  /** Updates the current user's own profile fields. */
  async updateProfile(userId: string, updates: Partial<UserRecord>): Promise<UserRecord> {
    const { user } = await apiPatch<{ user: UserRecord }>(`/api/users/${userId}`, updates);
    return user;
  },
};
