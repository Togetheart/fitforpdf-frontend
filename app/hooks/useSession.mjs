'use client';

import { useCallback, useEffect, useState } from 'react';

export default function useSession() {
  const [account, setAccount] = useState(null);
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/me', { method: 'GET', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAccount(data && data.account ? data.account : null);
        setQuota(data && data.quota ? data.quota : null);
      } else {
        setAccount(null);
        setQuota(null);
      }
    } catch {
      setAccount(null);
      setQuota(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore — clear locally regardless */
    }
    setAccount(null);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { account, quota, loading, refresh, logout };
}
