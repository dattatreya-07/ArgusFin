/**
 * Executes an asynchronous operation with an explicit, bounded timeout and graceful fallback.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T,
  operationName = 'Operation'
): Promise<{ result: T; timedOut: boolean; durationMs: number }> {
  const start = Date.now();

  let timer: any;
  const timeoutPromise = new Promise<{ result: T; timedOut: boolean }>((resolve) => {
    timer = setTimeout(() => {
      resolve({ result: fallbackValue, timedOut: true });
    }, timeoutMs);
  });

  try {
    const res = await Promise.race([
      promise.then((val) => ({ result: val, timedOut: false })),
      timeoutPromise,
    ]);
    clearTimeout(timer);
    return {
      result: res.result,
      timedOut: res.timedOut,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      result: fallbackValue,
      timedOut: false,
      durationMs: Date.now() - start,
    };
  }
}
