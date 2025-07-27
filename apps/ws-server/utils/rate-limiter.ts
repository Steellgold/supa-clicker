interface RateLimitEntry {
  timestamps: number[];
  suspiciousActivity: number;
  lastWarning: number;
}

interface PurchaseRateLimitEntry {
  timestamps: number[];
  lastPurchase: number;
}

export class RateLimiter {
  private clickLimits = new Map<string, RateLimitEntry>();
  private purchaseLimits = new Map<string, PurchaseRateLimitEntry>();
  private leaderboardLimits = new Map<string, RateLimitEntry>();
  private ipConnections = new Map<string, number>();

  // Click rate limiting with advanced detection
  checkClickRate(userId: string): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const entry = this.clickLimits.get(userId) || { 
      timestamps: [], 
      suspiciousActivity: 0,
      lastWarning: 0 
    };

    // Clean old timestamps (older than 1 second)
    entry.timestamps = entry.timestamps.filter(timestamp => now - timestamp < 1000);

    // Check for suspicious patterns
    if (entry.timestamps.length >= 20) {
      entry.suspiciousActivity++;
      
      // Progressive penalties for repeated violations
      if (entry.suspiciousActivity > 5) {
        const penaltyDuration = Math.min(entry.suspiciousActivity * 1000, 30000); // Max 30s
        if (now - entry.lastWarning < penaltyDuration) {
          this.clickLimits.set(userId, entry);
          return { 
            allowed: false, 
            reason: `Rate limit exceeded. Penalty: ${Math.ceil(penaltyDuration / 1000)}s` 
          };
        }
      }

      entry.lastWarning = now;
      this.clickLimits.set(userId, entry);
      return { allowed: false, reason: 'Rate limit: 20 clicks/sec' };
    }

    // Check for burst patterns (more than 10 clicks in 100ms)
    const recent = entry.timestamps.filter(timestamp => now - timestamp < 100);
    if (recent.length > 10) {
      entry.suspiciousActivity++;
      this.clickLimits.set(userId, entry);
      return { allowed: false, reason: 'Suspicious burst pattern detected' };
    }

    // Allow the click
    entry.timestamps.push(now);
    this.clickLimits.set(userId, entry);
    return { allowed: true };
  }

  // Purchase rate limiting with bulk consideration
  checkPurchaseRate(userId: string, isBulk: boolean = false, quantity: number = 1): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const entry = this.purchaseLimits.get(userId) || { 
      timestamps: [], 
      lastPurchase: 0 
    };

    // Clean old timestamps (older than 1 minute)
    entry.timestamps = entry.timestamps.filter(timestamp => now - timestamp < 60000);

    // Adjust rate limits based on purchase type
    const maxPurchasesPerMinute = isBulk ? 30 : 60; // Lower limit for bulk purchases
    const minTimeBetweenPurchases = isBulk ? 200 : 100; // Higher delay for bulk purchases

    // Limit purchases per minute
    if (entry.timestamps.length >= maxPurchasesPerMinute) {
      this.purchaseLimits.set(userId, entry);
      return { allowed: false, reason: `Purchase rate limit: ${maxPurchasesPerMinute}/minute` };
    }

    // Prevent rapid successive purchases
    if (now - entry.lastPurchase < minTimeBetweenPurchases) {
      return { allowed: false, reason: `Purchase too rapid. Wait ${minTimeBetweenPurchases}ms between purchases` };
    }

    // Additional check for large bulk purchases
    if (isBulk && quantity > 10) {
      const recentBulkPurchases = entry.timestamps.filter(timestamp => now - timestamp < 10000).length;
      if (recentBulkPurchases >= 3) {
        return { allowed: false, reason: 'Large bulk purchase limit: 3 per 10 seconds' };
      }
    }

    // Allow the purchase
    entry.timestamps.push(now);
    entry.lastPurchase = now;
    this.purchaseLimits.set(userId, entry);
    return { allowed: true };
  }

  // Leaderboard rate limiting
  checkLeaderboardRate(userId: string): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const entry = this.leaderboardLimits.get(userId) || { 
      timestamps: [], 
      suspiciousActivity: 0,
      lastWarning: 0 
    };

    // Clean old timestamps (older than 10 seconds)
    entry.timestamps = entry.timestamps.filter(timestamp => now - timestamp < 10000);

    // Limit to 10 requests per 10 seconds
    if (entry.timestamps.length >= 10) {
      entry.suspiciousActivity++;
      
      // Progressive penalties for repeated violations
      if (entry.suspiciousActivity > 3) {
        const penaltyDuration = Math.min(entry.suspiciousActivity * 5000, 60000); // Max 60s
        if (now - entry.lastWarning < penaltyDuration) {
          this.leaderboardLimits.set(userId, entry);
          return { 
            allowed: false, 
            reason: `Leaderboard rate limit exceeded. Penalty: ${Math.ceil(penaltyDuration / 1000)}s` 
          };
        }
      }

      entry.lastWarning = now;
      this.leaderboardLimits.set(userId, entry);
      return { allowed: false, reason: 'Leaderboard rate limit: 5 requests per 10 seconds' };
    }

    // Check for burst patterns (more than 3 requests in 1 second)
    const recent = entry.timestamps.filter(timestamp => now - timestamp < 1000);
    if (recent.length > 3) {
      entry.suspiciousActivity++;
      this.leaderboardLimits.set(userId, entry);
      return { allowed: false, reason: 'Suspicious leaderboard burst pattern detected' };
    }

    // Allow the request
    entry.timestamps.push(now);
    this.leaderboardLimits.set(userId, entry);
    return { allowed: true };
  }

  // IP connection limiting
  checkIPConnections(ip: string): { allowed: boolean; reason?: string } {
    const current = this.ipConnections.get(ip) || 0;
    
    if (current >= 5) {
      return { allowed: false, reason: 'Too many connections from this IP' };
    }

    this.ipConnections.set(ip, current + 1);
    return { allowed: true };
  }

  // Clean up disconnected IP
  releaseIPConnection(ip: string): void {
    const current = this.ipConnections.get(ip) || 0;
    if (current > 0) {
      this.ipConnections.set(ip, current - 1);
    }
  }

  // Get suspicious activity level for monitoring
  getSuspiciousActivityLevel(userId: string): number {
    const entry = this.clickLimits.get(userId);
    return entry?.suspiciousActivity || 0;
  }

  // Reset user limits (for admin purposes)
  resetUserLimits(userId: string): void {
    this.clickLimits.delete(userId);
    this.purchaseLimits.delete(userId);
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now();
    
    // Clean click limits older than 5 minutes
    for (const [userId, entry] of this.clickLimits.entries()) {
      if (entry.timestamps.length === 0 && now - entry.lastWarning > 300000) {
        this.clickLimits.delete(userId);
      }
    }

    // Clean purchase limits older than 5 minutes
    for (const [userId, entry] of this.purchaseLimits.entries()) {
      if (entry.timestamps.length === 0 && now - entry.lastPurchase > 300000) {
        this.purchaseLimits.delete(userId);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

setInterval(() => {
  rateLimiter.cleanup();
}, 300000);