let currentToken: string | null = null;

type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

export function getAuthToken(): string | null {
  return currentToken;
}

export function setAuthToken(token: string | null): void {
  if (currentToken === token) return;
  currentToken = token;
  for (const listener of listeners) listener(token);
}

export function subscribeAuthToken(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
