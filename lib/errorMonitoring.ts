/**
 * Error monitoring stub. Wire into Next.js error boundaries (`app/global-error.tsx`,
 * `app/error.tsx`) and any `catch` blocks that swallow failures silently.
 *
 * To enable Sentry:
 *   1. `npm install @sentry/nextjs`
 *   2. Set `NEXT_PUBLIC_SENTRY_DSN` (browser) and/or `SENTRY_DSN` (server) in .env
 *   3. Run the Sentry wizard or follow https://docs.sentry.io/platforms/javascript/guides/nextjs/
 *      and replace `captureError` with `Sentry.captureException(err, { extra: context })`.
 *
 * Until then, this stub just logs to console — useful in dev, harmless in prod.
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initErrorMonitoring() {
  if (!SENTRY_DSN) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.info("[errorMonitoring] No NEXT_PUBLIC_SENTRY_DSN set — running in stub mode.");
    }
    return;
  }
  // Real Sentry init goes here once @sentry/nextjs is installed.
}

export function captureError(err: unknown, context?: Record<string, unknown>) {
  // Always console-log so devs can see the error during development.
  // eslint-disable-next-line no-console
  console.error("[capturedError]", err, context);
  // Real Sentry call goes here.
}
