import { useEffect, useState } from 'react';

type ApiStatus = {
  ok: boolean;
  version?: string;
  message?: string;
};

type ApiStatusState = {
  loading: boolean;
  status?: ApiStatus;
  error?: string;
};

export function useApiStatus(baseUrl: string | undefined, enabled: boolean) {
  const [state, setState] = useState<ApiStatusState>({ loading: false });

  useEffect(() => {
    if (!enabled || !baseUrl) {
      setState({ loading: false });
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    setState({ loading: true });

    const url = baseUrl.replace(/\/$/, '');

    fetch(`${url}/status`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        return (await res.json()) as ApiStatus;
      })
      .then((data) => {
        if (!cancelled) {
          setState({ loading: false, status: { ...data, ok: data.ok ?? true } });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unable to reach API';
          setState({ loading: false, error: message });
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [baseUrl, enabled]);

  return state;
}
