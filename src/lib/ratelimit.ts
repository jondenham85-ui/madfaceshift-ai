const rateLimitMap = new Map>string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export const ratelimit = {
    async limit(identifier: string) {
          const now = Date.now();
          const record = rateLimitMap.get(identifier);

      if (!record || now > record.resetTime) {
              rateLimitMap.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
              return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - 1, reset: now + WINDOW_MS };
      }

      if (record.count >= MAX_REQUESTS) {
              return { success: false, limit: MAX_REQUESTS, remaining: 0, reset: record.resetTime };
      }

      record.count++;
          return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - record.count, reset: record.resetTime };
    },
};
