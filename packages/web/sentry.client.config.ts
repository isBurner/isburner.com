import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 0,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,

  // Don't report 4xx errors — those are expected client mistakes, not bugs
  beforeSend(event) {
    const status = event.contexts?.response?.status_code;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return null;
    }
    return event;
  },
});
