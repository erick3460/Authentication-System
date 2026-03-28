import { prisma } from "../lib/prisma";

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async create(data: { name: string; email: string; password: string }) {
    return prisma.user.create({
      data,
    });
  },

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  },

  async findByRefreshToken(refreshToken: string) {
    return prisma.user.findFirst({
      where: { refreshToken },
    });
  },
};