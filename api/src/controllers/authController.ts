import { Request, Response } from "express";
import { authService } from "../services/authService";

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ message: "Nome, e-mail e senha são obrigatórios." });
        return;
      }

      const user = await authService.register({ name, email, password });

      res.status(201).json({
        message: "Usuário cadastrado com sucesso.",
        user,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar usuário.";
      res.status(400).json({ message });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "E-mail e senha são obrigatórios." });
        return;
      }

      const result = await authService.login({ email, password });

      res.status(200).json({
        message: "Login realizado com sucesso.",
        ...result,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao realizar login.";
      res.status(401).json({ message });
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ message: "Refresh token não fornecido." });
        return;
      }

      const tokens = await authService.refresh(refreshToken);

      res.status(200).json({
        message: "Tokens renovados com sucesso.",
        ...tokens,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao renovar tokens.";
      res.status(401).json({ message });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      await authService.logout(req.userId!);

      res.status(200).json({ message: "Logout realizado com sucesso." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao realizar logout.";
      res.status(500).json({ message });
    }
  },

  async profile(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.getProfile(req.userId!);

      res.status(200).json({ user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao buscar perfil.";
      res.status(404).json({ message });
    }
  },
};
