import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../services/authService";

declare global {namespace Express {interface Request {userId?: number;}}}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token de acesso não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    res.status(500).json({ message: "Configuração de servidor inválida." });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
}
