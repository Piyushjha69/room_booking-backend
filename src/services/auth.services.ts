import { PrismaClient } from '../generated/prisma';
import { AuthResponse, LoginDTO, RegisterDTO } from '../types/auth.types';
import { JwtTokens, generateTokens, verifyRefreshToken } from '../utils/jwt.utils';
import { comparePassword, hashPassword } from '../utils/password.utils';
import { ConflictError, AuthenticationError, NotFoundError } from '../errors/AppError';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
    });

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
    });

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<JwtTokens> {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
    });

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    console.log(`User ${userId} logged out`);
  }
}
