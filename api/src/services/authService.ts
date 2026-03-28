import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository";

// Campos de input

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: number;
}

// Helpers de token

function generateAccessToken(userId: number): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("SecretJWT não definido");

  return jwt.sign({ userId } as TokenPayload, secret, { expiresIn: "15m" });
}

function generateRefreshToken(userId: number): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("SecretJTW-Refresh não definido");

  return jwt.sign({ userId } as TokenPayload, secret, { expiresIn: "7d" });
}

// Service

export const authService = {
  async register(input: RegisterInput) {
    const { name, email, password } = input;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("E-mail já cadastrado.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  },

  async login(input: LoginInput) {
    const { email, password } = input;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Credenciais inválidas.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Credenciais inválidas.");
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  },

  async refresh(token: string) {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error("SecretJTW-Refresh não definido");

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, secret) as TokenPayload;
    } catch {
      throw new Error("Refresh token inválido ou expirado.");
    }

    const user = await userRepository.findByRefreshToken(token);
    if (!user || user.id !== payload.userId) {
      throw new Error("Refresh token não reconhecido.");
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await userRepository.updateRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(userId: number) {
    await userRepository.updateRefreshToken(userId, null);
  },

  async getProfile(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  },
};
