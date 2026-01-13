import { useSyncExternalStore } from 'react';

export function useMounted() {
  return useSyncExternalStore(
    () => () => {}, // subscribe (noop)
    () => true, // client snapshot
    () => false // server snapshot
  );
}
