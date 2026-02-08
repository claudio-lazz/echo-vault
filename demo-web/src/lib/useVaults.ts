import { useEffect, useState } from 'react';

type VaultSummary = {
  owner: string;
  context_uri?: string | null;
  storage?: string | null;
  grants?: {
    total?: number;
    counts?: {
      active?: number;
      revoked?: number;
      expired?: number;
    };
  };
};

type VaultState = {
  loading: boolean;
  error?: string;
  vaults: VaultSummary[];
};

export function useVaults(apiBase?: string, enabled = false) {
  const [state, setState] = useState<VaultState>({ loading: false, vaults: [] });

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }
    if (!apiBase) {
      setState({ loading: false, error: 'missing_api_base', vaults: [] });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    fetch(`${apiBase}/vaults`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json() as Promise<{ ok: boolean; vaults?: VaultSummary[]; reason?: string }>;
      })
      .then((data) => {
        if (!data.ok) throw new Error(data.reason || 'unknown_error');
        setState({ loading: false, vaults: data.vaults ?? [] });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({ loading: false, error: err.message || 'fetch_failed', vaults: [] });
      });

    return () => controller.abort();
  }, [apiBase, enabled]);

  return state;
}
