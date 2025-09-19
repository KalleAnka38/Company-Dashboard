import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
// Configure Redis client if environment variables are set
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
}) : null;
interface RateLimitOptions {
  uniqueTokenPerInterval?: number;
  interval?: number;
  limit: number;
}
interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}
/**
 * Rate limiting implementation
 * Falls back to a simple memory-based limiter if Redis is not configured
 */
export async function rateLimit(request: NextRequest, options: RateLimitOptions): Promise<RateLimitResult> {
  const {
    limit,
    interval = 60000,
    uniqueTokenPerInterval = 500
  } = options;
  // Get IP to use as rate limit key
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  // Create a token that expires after the interval
  const tokenKey = `rate-limit:${ip}:${Math.floor(Date.now() / interval)}`;
  if (redis) {
    // Redis-based rate limiting
    try {
      const currentUsage = await redis.incr(tokenKey);
      // Set expiration if this is the first request in the window
      if (currentUsage === 1) {
        await redis.expire(tokenKey, Math.floor(interval / 1000));
      }
      const remaining = Math.max(0, limit - currentUsage);
      const reset = Math.floor(interval / 1000) - Math.floor(Date.now() % interval / 1000);
      return {
        success: currentUsage <= limit,
        limit,
        remaining,
        reset
      };
    } catch (error) {
      console.error('Redis rate limiting error:', error);
      // Fall through to memory-based limiting on Redis error
    }
  }
  // Memory-based rate limiting as fallback
  const now = Date.now();
  const windowStart = now - interval;
  // Clean up old entries
  memoryStore.requests = memoryStore.requests.filter(item => item.timestamp > windowStart);
  // Count requests for this IP in the current window
  const currentUsage = memoryStore.requests.filter(item => item.ip === ip).length;
  // Add current request
  memoryStore.requests.push({
    ip,
    timestamp: now
  });
  // Ensure we don't exceed storage limit
  if (memoryStore.requests.length > uniqueTokenPerInterval * 2) {
    memoryStore.requests = memoryStore.requests.slice(-uniqueTokenPerInterval);
  }
  const remaining = Math.max(0, limit - currentUsage - 1);
  const reset = Math.floor(interval / 1000);
  return {
    success: currentUsage < limit,
    limit,
    remaining,
    reset
  };
}
// Simple memory store for fallback rate limiting
const memoryStore: {
  requests: Array<{
    ip: string;
    timestamp: number;
  }>;
} = {
  requests: []
};