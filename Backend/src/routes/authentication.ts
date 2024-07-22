import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../services/JWTService";

declare global {
  namespace Express {
    /**
     * Wir erweitern das Interface `Request` um die Felder `userId` und `role`.
     */
    export interface Request {
      /**
       * Mongo-ID of currently logged in user; or undefined, if user is a guest.
       */
      userId?: string;
      role: "u" | "a";
    }
  }
}

/**
 * Prüft Authentifizierung und schreibt `userId` mit Mongo-ID des Users und `role` mit Kürzel der Rolle in den Request.
 * Falls Authentifizierung fehlschlägt, wird ein Fehler (401) erzeugt.
 */
export async function requiresAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer ")) {
      const token = authorization.substring("Bearer ".length);
      const { userId, role } = verifyJWT(token);
      if (!userId || !role) {
        res.status(401);
        return next(new Error("Authentication Failed"));
      }
      req.userId = userId;
      req.role = role;
      next();
    } else {
      res.status(401);
      res.setHeader("WWW-Authenticate", ["Bearer", 'realm="app"']);
      next(new Error("authentication required!"));
    }
  } catch (err) {
    res.status(401);
    res.setHeader("WWW-Authenticate", [
      "Bearer",
      'realm="app"',
      'error="invalid_token"',
    ]);
    next(err);
  }
}

/**
 * Prüft Authentifizierung und schreibt `userId` mit Mongo-ID des Users und `role` mit Kürzel der Rolle in den Request.
 * Falls kein JSON-Web-Token im Request-Header vorhanden ist, wird kein Fehler erzeugt (und auch nichts in den Request geschrieben).
 * Falls Authentifizierung fehlschlägt, wird ein Fehler (401) erzeugt.
 */
export async function optionalAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;
  if (authorization) {
    try {
      const token = authorization.split(" ")[1];
      const { userId, role } = verifyJWT(token);
      if (!userId || !role) {
        res.status(401);
        return next(new Error("Authentication Failed"));
      }
      req.userId = userId;
      req.role = role;
      next();
    } catch (err) {
      res.status(401);
      next(err);
    }
  } else {
    next();
  }
}
