import { useEffect, useMemo, useState } from "react";
import { storageGet, storageSubscribe } from "../../shared/storage";

export const useChromeStorageValue = <T,>(key: string, fallback: T) => {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const result = await storageGet<Record<string, T>>({ [key]: fallback });
      if (!mounted) return;
      setValue(result[key] ?? fallback);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [fallback, key]);

  useEffect(() => {
    return storageSubscribe((changes) => {
      const change = changes[key];
      if (!change) return;
      setValue((change.newValue ?? fallback) as T);
    });
  }, [fallback, key]);

  return useMemo(() => ({ value, setValue, ready }), [ready, value]);
};
