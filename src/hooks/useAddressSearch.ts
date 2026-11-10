import { useCallback, useEffect, useRef, useState } from 'react';

import { searchAddress, type GeocodeResult } from '@/lib/geocoding/nominatim';

export type AddressSearchStatus = 'idle' | 'loading' | 'done' | 'error';

export function useAddressSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [status, setStatus] = useState<AddressSearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const submit = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus('loading');
    setError(null);
    try {
      const found = await searchAddress(query, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setResults(found);
      setStatus('done');
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setResults([]);
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Gagal mencari alamat');
    }
  }, [query]);

  const clearResults = useCallback(() => {
    setResults([]);
    setStatus('idle');
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { query, setQuery, results, status, error, submit, clearResults };
}

export type AddressSearch = ReturnType<typeof useAddressSearch>;
