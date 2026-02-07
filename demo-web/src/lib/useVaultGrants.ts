import { useEffect, useState } from 'react';

type Grant = {
  owner: string;
  grantee: string;
  scope_hash: string;
  expires_at: number | null;
  revoked?: boolean;
};

type GrantState = {
  loading: boolean;
  error?: string;
  grants: Grant[];
};

export function useVaultGrants(apiBase?: string, enabled = false) {
  const [state, setState] = useState<GrantState>({ loading: false, grants: [] });

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }
    if (!apiBase) {
      setState({ loading: false, error: 'missing_api_base', grants: [] });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    fetch(`${apiBase}/vault/grants`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json() as Promise<{ ok: boolean; grants?: Grant[]; reason?: string }>;
      })
      .then((data) => {
        if (!data.ok) throw new Error(data.reason || 'unknown_error');
        setState({ loading: false, grants: data.grants ?? [] });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({ loading: false, error: err.message || 'fetch_failed', grants: [] });
      });

    return () => controller.abort();
  }, [apiBase, enabled]);

  return state;
}
