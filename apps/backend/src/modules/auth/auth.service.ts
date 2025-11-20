import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@repo/db';
import * as bcrypt from 'bcrypt';

import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let isPasswordValid = false;

    try {
      isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    } catch {
      const crypto = await import('crypto');
      const sha256Hash = crypto.createHash('sha256').update(loginDto.password).digest('hex');
      isPasswordValid = sha256Hash === user.passwordHash;
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        token: this.generateRandomToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const roles = user.roles.map((ur) => ur.role.slug);

    const accessToken = this.generateAccessToken(user.id, user.email, session.id);
    const refreshToken = this.generateRefreshToken(user.id, user.email, session.id);

    return new AuthResponseDto(accessToken, refreshToken, {
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
    });
  }

  async logout(sessionId: string): Promise<void> {
    await prisma.userSession.delete({
      where: { id: sessionId },
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'your-refresh-secret',
      });

      const session = await prisma.userSession.findUnique({
        where: { id: payload.sessionId },
        include: {
          user: {
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      const user = session.user;

      if (!user.isActive) {
        throw new UnauthorizedException('User is inactive');
      }

      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const roles = user.roles.map((ur) => ur.role.slug);

      const accessToken = this.generateAccessToken(user.id, user.email, session.id);
      const newRefreshToken = this.generateRefreshToken(user.id, user.email, session.id);

      return new AuthResponseDto(accessToken, newRefreshToken, {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateSession(sessionId: string) {
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const user = session.user;

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((ur) => ur.role.slug),
    };
  }

  private generateAccessToken(userId: string, email: string, sessionId: string): string {
    return this.jwtService.sign(
      {
        sub: userId,
        email,
        sessionId,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
        expiresIn: '15m',
      },
    );
  }

  private generateRefreshToken(userId: string, email: string, sessionId: string): string {
    return this.jwtService.sign(
      {
        sub: userId,
        email,
        sessionId,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'your-refresh-secret',
        expiresIn: '7d',
      },
    );
  }

  private generateRandomToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }
}
