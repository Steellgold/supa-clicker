interface AuditEvent {
  timestamp: number;
  userId: string;
  action: string;
  details: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ip?: string;
}

interface SecurityAlert {
  userId: string;
  alertType: string;
  count: number;
  firstOccurrence: number;
  lastOccurrence: number;
}

export class AuditLogger {
  private events: AuditEvent[] = [];
  private securityAlerts = new Map<string, SecurityAlert>();
  private maxEvents = 10000; // Keep last 10k events in memory

  log(event: Omit<AuditEvent, 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(auditEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Console logging with structured format
    const logMessage = `[${auditEvent.severity.toUpperCase()}] ${auditEvent.action} - User: ${auditEvent.userId}`;
    
    switch (auditEvent.severity) {
      case 'critical':
      case 'error':
        console.error(logMessage, auditEvent.details);
        break;
      case 'warning':
        console.warn(logMessage, auditEvent.details);
        break;
      default:
        console.log(logMessage, auditEvent.details);
    }

    // Track security alerts
    if (auditEvent.severity === 'warning' || auditEvent.severity === 'error') {
      this.trackSecurityAlert(auditEvent);
    }
  }

  private trackSecurityAlert(event: AuditEvent): void {
    const alertKey = `${event.userId}:${event.action}`;
    const existing = this.securityAlerts.get(alertKey);

    if (existing) {
      existing.count++;
      existing.lastOccurrence = event.timestamp;
    } else {
      this.securityAlerts.set(alertKey, {
        userId: event.userId,
        alertType: event.action,
        count: 1,
        firstOccurrence: event.timestamp,
        lastOccurrence: event.timestamp
      });
    }

    // Escalate if repeated violations
    const alert = this.securityAlerts.get(alertKey)!;
    if (alert.count >= 5) {
      this.log({
        userId: event.userId,
        action: 'SECURITY_ESCALATION',
        details: {
          originalAlert: event.action,
          totalViolations: alert.count,
          timespan: alert.lastOccurrence - alert.firstOccurrence
        },
        severity: 'critical'
      });
    }
  }

  // Authentication events
  logAuth(userId: string, action: 'login' | 'logout' | 'auth_failed', details?: any): void {
    this.log({
      userId,
      action: `AUTH_${action.toUpperCase()}`,
      details: details || {},
      severity: action === 'auth_failed' ? 'warning' : 'info'
    });
  }

  // Game action events
  logGameAction(userId: string, action: 'click' | 'purchase' | 'reset', details?: any): void {
    this.log({
      userId,
      action: `GAME_${action.toUpperCase()}`,
      details: details || {},
      severity: 'info'
    });
  }

  // Security violations
  logSecurityViolation(userId: string, violation: string, details: any, ip?: string): void {
    this.log({
      userId,
      action: `SECURITY_${violation}`,
      details,
      severity: 'error',
      ip
    });
  }

  // Rate limit violations
  logRateLimit(userId: string, limitType: string, details: any): void {
    this.log({
      userId,
      action: `RATE_LIMIT_${limitType}`,
      details,
      severity: 'warning'
    });
  }

  // Data integrity issues
  logDataIntegrity(userId: string, issue: string, details: any): void {
    this.log({
      userId,
      action: `DATA_INTEGRITY_${issue}`,
      details,
      severity: 'error'
    });
  }

  // Get recent events for monitoring
  getRecentEvents(limit: number = 100): AuditEvent[] {
    return this.events.slice(-limit);
  }

  // Get events for specific user
  getUserEvents(userId: string, limit: number = 50): AuditEvent[] {
    return this.events
      .filter(event => event.userId === userId)
      .slice(-limit);
  }

  // Get security alerts
  getSecurityAlerts(): SecurityAlert[] {
    return Array.from(this.securityAlerts.values())
      .sort((a, b) => b.lastOccurrence - a.lastOccurrence);
  }

  // Get high-risk users (multiple violations)
  getHighRiskUsers(): string[] {
    const riskScores = new Map<string, number>();

    for (const alert of this.securityAlerts.values()) {
      const currentScore = riskScores.get(alert.userId) || 0;
      riskScores.set(alert.userId, currentScore + alert.count);
    }

    return Array.from(riskScores.entries())
      .filter(([, score]) => score >= 10)
      .sort(([, a], [, b]) => b - a)
      .map(([userId]) => userId);
  }

  // Clean old events
  cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    this.events = this.events.filter(event => event.timestamp > cutoff);

    // Clean old alerts
    for (const [key, alert] of this.securityAlerts.entries()) {
      if (alert.lastOccurrence < cutoff) {
        this.securityAlerts.delete(key);
      }
    }
  }

  // Export audit log (for admin purposes)
  exportLog(): string {
    return JSON.stringify({
      events: this.events,
      alerts: Array.from(this.securityAlerts.values()),
      exportTime: Date.now()
    });
  }
}

export const auditLogger = new AuditLogger();

setInterval(() => {
  auditLogger.cleanup();
}, 60 * 60 * 1000);