import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID && process.env.NODE_ENV === "production") {
  throw new Error("GOOGLE_CLIENT_ID environment variable is not set.");
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface GoogleProfile {
  googleId: string; // "sub" claim — stable, unique Google account id
  email: string;
  emailVerified: boolean;
  fname: string;
  lname: string;
  avatarUrl?: string;
}

/**
 * Verifies a Google ID token (the `credential` returned by Google Identity
 * Services on the client) against Google's servers. This is the step that
 * guarantees the sign-in really came from Google and wasn't forged — never
 * trust an ID token without this check.
 *
 * Returns null if the token is invalid, expired, issued for a different
 * client, or the underlying Google account's email isn't verified by Google.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  if (!idToken || !GOOGLE_CLIENT_ID) return null;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) return null;

    // Google's own signal for whether the email address is a verified,
    // real address (not a spoofed/unverified one).
    if (!payload.email_verified) return null;

    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: true,
      fname: payload.given_name || payload.name?.split(" ")[0] || "Google",
      lname: payload.family_name || "",
      avatarUrl: payload.picture,
    };
  } catch {
    // Covers: expired token, bad signature, wrong audience, network error, etc.
    return null;
  }
}
