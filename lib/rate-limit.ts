/**
 * Simple in-memory rate limiter.
 * 
 * Note: Resets on server restart. Fine for portfolio/single-server.
 * For serverless (Vercel), swap to Upstash Redis later.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 100;

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Check if request is allowed under rate limit.
 * @param ip - Client IP address
 * @returns { allowed, remaining, resetAt }
 */
export function checkRateLimit(ip: string): { 
  allowed: boolean; 
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = store.get(ip);
  
  // No entry or window expired — start fresh
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }
  
  // Within window — check count
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  
  // Increment and allow
  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}
