import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type DataMode = 'mock' | 'live';

type DataModeContextValue = {
  mode: DataMode;
  setMode: (mode: DataMode) => void;
};

const DataModeContext = createContext<DataModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'echovault.dataMode';

export function DataModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DataMode>('mock');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'mock' || stored === 'live') {
      setModeState(stored);
    }
  }, []);

  const setMode = (next: DataMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return <DataModeContext.Provider value={value}>{children}</DataModeContext.Provider>;
}

export function useDataMode() {
  const ctx = useContext(DataModeContext);
  if (!ctx) {
    throw new Error('useDataMode must be used within a DataModeProvider');
  }
  return ctx;
}
