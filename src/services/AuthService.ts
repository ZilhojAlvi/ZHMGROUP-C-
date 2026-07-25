import { AuthSession, UserRecord } from "@/types";
import { apiGet, apiPost } from "@/lib/apiClient";

export interface SignupPayload {
  fname: string;
  lname: string;
  email: string;
  password: string;
  phone: string;
  role: "customer" | "agent";
  licenceNumber?: string;
  agency?: string;
}

function toSession(user: UserRecord): AuthSession {
  return {
    userId: user.userId,
    role: user.role,
    fname: user.fname,
    lname: user.lname,
    email: user.email,
  };
}

/**
 * AuthService now talks to the real backend (/api/auth/*) instead of
 * localStorage. Sessions are httpOnly cookies set by the server — the
 * client never touches a token directly.
 */
export const AuthService = {
  /** Authenticates against the backend and establishes an httpOnly session cookie. */
  async login(email: string, password: string): Promise<AuthSession> {
    const { user } = await apiPost<{ user: UserRecord }>("/api/auth/login", { email, password });
    return toSession(user);
  },

  /**
   * Registers a new account. Unlike the old mock flow, signup does NOT
   * automatically log the user in — a verification email must be
   * confirmed first. Returns the created user's basic info for UX
   * purposes ("check your inbox, <fname>").
   */
  async signup(payload: SignupPayload): Promise<{ fname: string; email: string }> {
    const { user } = await apiPost<{ user: UserRecord }>("/api/auth/signup", payload);
    return { fname: user.fname, email: user.email };
  },

  async logout(): Promise<void> {
    await apiPost("/api/auth/logout").catch(() => undefined);
  },

  /** Resolves the current session from the server (httpOnly cookie), or null if not logged in. */
  async fetchSession(): Promise<AuthSession | null> {
    try {
      const { user } = await apiGet<{ user: UserRecord | null }>("/api/auth/me");
      return user ? toSession(user) : null;
    } catch {
      return null;
    }
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    return apiPost("/api/auth/resend-verification", { email });
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiPost("/api/auth/verify-email", { token });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiPost("/api/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiPost("/api/auth/reset-password", { token, password });
  },
};
