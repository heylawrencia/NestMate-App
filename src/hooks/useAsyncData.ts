import { useCallback, useEffect, useState } from 'react';

interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  // The raw thrown value, preserved alongside `error`'s message string so callers
  // that need to branch on e.g. an ApiError's status code (a 402 paywall, etc.)
  // don't have to resort to string-matching on the message.
  rawError: unknown;
}

interface UseAsyncDataResult<T> extends AsyncDataState<T> {
  reload: () => void;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

/**
 * Runs an async fetcher and exposes loading/error/data state, re-running
 * whenever `deps` changes. Used to keep screens the same shape whether
 * `fetcher` is backed by mock data or a real API call.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
): UseAsyncDataResult<T> {
  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    loading: true,
    error: null,
    rawError: null,
  });
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ data: prev.data, loading: true, error: null, rawError: null }));

    fetcher()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null, rawError: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error: toErrorMessage(error), rawError: error });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  return { ...state, reload };
}
