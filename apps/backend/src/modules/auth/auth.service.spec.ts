import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userSession: {
    create: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@repo/db', () => ({
  prisma: mockPrisma,
}));

import { prisma } from '@repo/db';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: await bcrypt.hash('password123', 10),
        isActive: true,
        roles: [
          {
            role: {
              slug: 'admin',
            },
          },
        ],
      };

      const mockSession = {
        id: 'session-1',
        userId: '1',
        token: 'token-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);
      prisma.userSession.create.mockResolvedValue(mockSession);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['admin'],
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        isActive: false,
        roles: [],
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      prisma.userSession.delete.mockResolvedValue({});

      await service.logout('session-1');

      expect(prisma.userSession.delete).toHaveBeenCalledWith({
        where: { id: 'session-1' },
      });
    });
  });

  describe('validateSession', () => {
    it('should successfully validate an active session', async () => {
      const mockSession = {
        id: 'session-1',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          isActive: true,
          roles: [
            {
              role: {
                slug: 'admin',
              },
            },
          ],
        },
      };

      prisma.userSession.findUnique.mockResolvedValue(mockSession);

      const result = await service.validateSession('session-1');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['admin'],
      });
    });

    it('should throw UnauthorizedException for expired session', async () => {
      const mockSession = {
        id: 'session-1',
        expiresAt: new Date(Date.now() - 1000),
        user: {
          id: '1',
          email: 'test@example.com',
          isActive: true,
          roles: [],
        },
      };

      prisma.userSession.findUnique.mockResolvedValue(mockSession);

      await expect(service.validateSession('session-1')).rejects.toThrow(UnauthorizedException);
    });
  });
});
