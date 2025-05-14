import crypto from 'crypto';

const apiKeyMap = new Map<string, string>();
let activeSessionId: string | null = null;

export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function storeApiKey(sessionId: string, apiKey: string): void {
  apiKeyMap.set(sessionId, apiKey);
  activeSessionId = sessionId; 
}

export function getApiKey(sessionId: string): string | undefined {
  return apiKeyMap.get(sessionId);
  
}

export function getActiveSessionId(): string | null {
  return activeSessionId;
}

export function removeApiKey(sessionId: string): void {
  apiKeyMap.delete(sessionId);
}

export function isValidApiKey(providedKey: string): boolean {
  if (!activeSessionId) return false;
  return apiKeyMap.get(activeSessionId) === providedKey;
}

