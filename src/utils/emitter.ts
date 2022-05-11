import { BaseKey } from "../common/types.ts";

const emitter = <Action extends Record<BaseKey, unknown>>() => {
  // deno-lint-ignore no-explicit-any
  const listeners: Map<BaseKey, Set<(payload: any) => void>> = new Map();

  return {
    on<K extends keyof Action>(
      type: K,
      listener: (payload: Action[K]) => void
    ) {
      if (listeners.has(type)) {
        listeners.get(type)?.add(listener);
      } else {
        listeners.set(type, new Set([listener]));
      }
    },
    off<K extends keyof Action>(
      type: K,
      listener: (payload: Action[K]) => void
    ) {
      if (listeners.has(type as string)) {
        return listeners.get(type as string)?.delete(listener) as boolean;
      }
      return true;
    },
    emit<K extends keyof Action>(type: K, payload: Action[K]) {
      if (listeners.has(type)) {
        listeners.get(type)?.forEach((listener) => listener(payload));
      }
    },
  };
};

export { emitter };
