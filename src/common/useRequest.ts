import { useCallback, useState } from 'react';

// eslint-disable-next-line
export type TFetcher = (...args: any[]) => Promise<any>;
export type TData<T extends TFetcher> = Required<Awaited<ReturnType<T>>>;
export type TRequest<T extends TFetcher> = (
  ...arg: Parameters<T>
) => Promise<TData<T> | null>;

export type TResponse<T extends TFetcher> = {
  initialized: boolean;
  loading: boolean;
  data: TData<T> | null;
  error: Error | null;
  request: TRequest<T>;
  clearError: () => void;
};

export const useRequest = <T extends TFetcher>(fetcher: T): TResponse<T> => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TData<T> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const request = useCallback<TRequest<T>>(
    async (...args) => {
      try {
        setLoading(true);

        const response = await fetcher(...args);

        setData(response || null);
        setError(null);
        setInitialized(true);
        setLoading(false);

        return response || null;
      } catch (externalError) {
        setError(externalError as Error);
        setInitialized(true);
        setLoading(false);

        return null;
      }
    },
    [fetcher]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    initialized,
    loading,
    data,
    error,
    request,
    clearError,
  };
};
