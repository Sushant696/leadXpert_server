/**
 * Central Event Bus
 * ===================
 * Plain in-memory EventEmitter singleton used to fan out change
 * notifications to SSE subscribers. Single Node process — no Redis
 * pub/sub needed unless this service ever runs PM2 in cluster mode.
 *
 * Topic convention: "lead:<leadId>" today. Other features (e.g. a
 * dashboard feed) can subscribe/emit on their own topic prefix using
 * the same bus instance.
 */

import { EventEmitter } from "events";

export const eventBus = new EventEmitter();
// Many concurrent SSE subscribers are expected — don't warn on this.
eventBus.setMaxListeners(0);

export type LeadEventType = "activity" | "note" | "task" | "score";

export interface LeadEvent {
  leadId: string;
  type: LeadEventType;
  at: string;
}

export function leadTopic(leadId: string): string {
  return `lead:${leadId}`;
}

export function emitLeadEvent(leadId: string, type: LeadEventType): void {
  const event: LeadEvent = {
    leadId,
    type,
    at: new Date().toISOString(),
  };
  eventBus.emit(leadTopic(leadId), event);
}
