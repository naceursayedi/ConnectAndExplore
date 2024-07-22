import { JwtPayload, sign, verify } from "jsonwebtoken";
import { User } from "../model/UserModel";
import dotenv from "dotenv";
dotenv.config();
/**
 * @param email E-Mail-Adresse des Users
 * @param password Das Passwort des Users
 * @returns JWT als String, im JWT ist sub gesetzt mit der Mongo-ID des Users als String sowie role mit "u" oder "a" (User oder Admin);
 *      oder undefined wenn Authentifizierung fehlschlägt.
 */
export async function verifyPasswordAndCreateJWT(
  email: string,
  password: string
): Promise<string | undefined> {
  const users = await User.find({ email: email, isActive: true }).exec();
  if (!users || users.length != 1) {
    return undefined;
  }
  const user = users[0];
  if (!(await user.isCorrectPassword(password))) {
    return undefined;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not set");
  }
  const timeInSec = Math.floor(Date.now() / 1000);

  const ttl = process.env.JWT_TTL;
  if (!ttl) {
    throw new Error("TTL not set");
  }

  const exp = timeInSec + 24 * 60 * 60;
  const role = user.isAdministrator ? "a" : "u";

  const payload: JwtPayload = {
    sub: user.id,
    iat: timeInSec,
    exp: exp,
    role: role,
  };
  const jwtString = sign(payload, secret, { algorithm: "HS256" });
  return jwtString;
}

/**
 * Gibt user id (Mongo-ID) und ein Kürzel der Rolle zurück, falls Verifizierung erfolgreich, sonst wird ein Error geworfen.
 *
 * Die zur Prüfung der Signatur notwendige Passphrase wird aus der Umgebungsvariable `JWT_SECRET` gelesen,
 * falls diese nicht gesetzt ist, wird ein Fehler geworfen.
 *
 * @param jwtString das JWT
 * @return user id des Users (Mongo ID als String) und Rolle (u oder a) des Benutzers;
 *      niemals undefined (bei Fehler wird ein Error geworfen)
 */
export function verifyJWT(jwtString: string | undefined): {
  userId: string;
  role: "u" | "a";
} {
  if (!jwtString) {
    throw new Error("No JWT-string");
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not set");
  }
  try {
    const payload = verify(jwtString, secret);
    if (typeof payload === "object" && "sub" in payload && payload.sub) {
      const result = { userId: payload.sub?.toString()!, role: payload.role };
      return result;
    }
  } catch (err) {
    throw new Error("verify_error");
  }
  throw new Error("invalid_token");
}
