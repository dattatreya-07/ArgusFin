/**
 * Privacy-Safe Domain Events for FinanceX Cross-Module Integration.
 * Zero raw message content, raw user names, or PII are logged or emitted.
 */

export type FinanceXEventType =
  | 'LEARNING_STARTED'
  | 'LESSON_COMPLETED'
  | 'QUIZ_PASSED'
  | 'CREDENTIAL_ELIGIBLE'
  | 'CREDENTIAL_MINTED'
  | 'SHIELD_ANALYSIS_COMPLETED'
  | 'SHIELD_LESSON_OPENED'
  | 'REPORT_PREPARED'
  | 'EVIDENCE_ANCHOR_STARTED'
  | 'EVIDENCE_ANCHORED';

export interface FinanceXEventPayload {
  type: FinanceXEventType;
  timestamp: string;
  trackId?: string;
  lessonSlug?: string;
  archetype?: string;
  riskBand?: string;
  tokenId?: string;
  evidenceHash?: string;
  metadata?: Record<string, string | number | boolean>;
}

export class FinanceXEventManager {
  private listeners: Array<(event: FinanceXEventPayload) => void> = [];
  private eventHistory: FinanceXEventPayload[] = [];

  public emit(event: Omit<FinanceXEventPayload, 'timestamp'>): FinanceXEventPayload {
    const fullEvent: FinanceXEventPayload = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    this.eventHistory.push(fullEvent);
    if (this.eventHistory.length > 100) {
      this.eventHistory.shift();
    }
    this.listeners.forEach((listener) => {
      try {
        listener(fullEvent);
      } catch (_) {
        // Ignore subscriber listener errors
      }
    });
    return fullEvent;
  }

  public listen(listener: (event: FinanceXEventPayload) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getHistory(): FinanceXEventPayload[] {
    return [...this.eventHistory];
  }
}

export const financeXEvents = new FinanceXEventManager();
