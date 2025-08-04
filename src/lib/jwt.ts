// JWT utilities for server-side authentication
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function verifyJWT(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    // First check if token is blacklisted
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { token }
    });

    if (blacklistedToken) {
      console.log('Token is blacklisted');
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export function generateJWT(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '24h', // Extended from 1h to 24h
  });
}

export function generateRefreshToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    // Check if refresh token is blacklisted
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { token }
    });

    if (blacklistedToken) {
      console.log('Refresh token is blacklisted');
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return null;
  }
}

export async function blacklistToken(token: string, userId: string): Promise<void> {
  try {
    // Decode token to get expiration time
    const decoded = jwt.decode(token) as any;
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.tokenBlacklist.create({
      data: {
        token,
        userId,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Error blacklisting token:', error);
    // Don't throw error - logout should still work even if blacklisting fails
  }
}

export async function blacklistAllUserTokens(userId: string): Promise<void> {
  try {
    // This is a more aggressive approach - we could track all user tokens
    // For now, we'll just update the user's lastLogin to force re-authentication
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: null }
    });
  } catch (error) {
    console.error('Error blacklisting all user tokens:', error);
  }
}

export async function cleanupExpiredTokens(): Promise<void> {
  try {
    await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
}
