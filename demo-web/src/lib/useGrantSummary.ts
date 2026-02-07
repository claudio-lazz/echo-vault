import { useEffect, useState } from 'react';

type GrantSummary = {
  total: number;
  counts: {
    active: number;
    revoked: number;
    expired: number;
  };
};

type GrantSummaryState = {
  loading: boolean;
  error?: string;
  summary?: GrantSummary;
};

export function useGrantSummary(apiBase?: string, enabled = false) {
  const [state, setState] = useState<GrantSummaryState>({ loading: false });

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }
    if (!apiBase) {
      setState({ loading: false, error: 'missing_api_base' });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    fetch(`${apiBase}/vault/grants/summary`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json() as Promise<{ ok: boolean; total?: number; counts?: GrantSummary['counts']; reason?: string }>;
      })
      .then((data) => {
        if (!data.ok) throw new Error(data.reason || 'unknown_error');
        setState({ loading: false, summary: { total: data.total ?? 0, counts: data.counts ?? { active: 0, revoked: 0, expired: 0 } } });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({ loading: false, error: err.message || 'fetch_failed' });
      });

    return () => controller.abort();
  }, [apiBase, enabled]);

  return state;
}
