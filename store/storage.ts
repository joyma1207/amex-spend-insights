import { Platform } from 'react-native';

/**
 * Encrypted MMKV on native, in-memory shim on web (MMKV requires JSI).
 * Keep the API surface small — we only need string get/set for V1.
 */
interface KVStore {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

let store: KVStore;

if (Platform.OS === 'web') {
  const memory = new Map<string, string>();
  store = {
    getString: (key) => memory.get(key),
    set: (key, value) => {
      memory.set(key, value);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch {
        // ignore — private mode etc.
      }
    },
    delete: (key) => {
      memory.delete(key);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // noop
      }
    },
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k) {
        const v = window.localStorage.getItem(k);
        if (v !== null) memory.set(k, v);
      }
    }
  }
} else {
  // Lazy require so web bundles don't try to resolve the native module.
  const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const mmkv = new MMKV({ id: 'amex.spend-insights', encryptionKey: 'amex-spi-v1' });
  store = {
    getString: (key) => mmkv.getString(key),
    set: (key, value) => mmkv.set(key, value),
    delete: (key) => mmkv.delete(key),
  };
}

export const storage = store;
