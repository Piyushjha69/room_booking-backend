import jwt from 'jsonwebtoken';
import { getEnv } from './env.utils';

const ACCESS_TOKEN_SECRET = getEnv('ACCESS_TOKEN_SECRET');
const REFRESH_TOKEN_SECRET = getEnv('REFRESH_TOKEN_SECRET');
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (payload: TokenPayload): JwtTokens => {
  const accessToken = jwt.sign(
    payload,
    ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY as string,
    } as any
  );

  const refreshToken = jwt.sign(
    payload,
    REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY as string,
    } as any
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const extractTokenFromHeader = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] ?? null;
};
