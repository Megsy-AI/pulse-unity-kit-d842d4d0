/**
 * Captures the last unhandled server-side error so the SSR entry can report a
 * real stack instead of h3's swallowed `{"unhandled":true}` body.
 */
let lastError: unknown;

export function captureError(error: unknown) {
  lastError = error;
}

export function consumeLastCapturedError(): unknown {
  const error = lastError;
  lastError = undefined;
  return error;
}

const globalScope = globalThis as typeof globalThis & {
  __nomiErrorCaptureInstalled?: boolean;
};

if (!globalScope.__nomiErrorCaptureInstalled) {
  globalScope.__nomiErrorCaptureInstalled = true;
  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const firstError = args.find((arg) => arg instanceof Error);
    if (firstError) captureError(firstError);
    originalConsoleError(...(args as []));
  };
}
