import { useEffect, useMemo, useCallback } from 'react';

import { useRegistry, TRegistryContent } from 'registry';

export type TSubscribe<R extends TRegistryContent> = (
  arg0: keyof R,
  arg1: R[keyof R]
) => () => void;

export type TEmit<R extends TRegistryContent> = (
  arg0: keyof R,
  ...args: Parameters<R[keyof R]>
) => void;

const useRenderingSubscriptionHook = <R extends TRegistryContent>(
  subscribe: TSubscribe<R>
) => {
  const useRenderingSubscription = (...args: Parameters<TSubscribe<R>>) => {
    const unsubscribe = useMemo(() => {
      return subscribe(...args);
    }, [...args]); // eslint-disable-line

    useEffect(() => unsubscribe, [unsubscribe]);
  };

  return useMemo(() => useRenderingSubscription, []); // eslint-disable-line
};

export const useEmitter = <R extends TRegistryContent>() => {
  const registry = useRegistry<R>();

  const subscribe = useCallback<TSubscribe<R>>(
    (eventName, eventHandler) => {
      const handlerKey = registry.add(eventName, eventHandler);

      return () => {
        registry.remove(eventName, handlerKey);
      };
    },
    [registry]
  );

  const emit = useCallback<TEmit<R>>(
    (eventName, ...args) => {
      const handlers = registry.get(eventName);

      handlers.forEach((handler) => handler(...args));
    },
    [registry]
  );

  const useRenderingSubscription = useRenderingSubscriptionHook(subscribe);

  return useMemo(
    () => ({
      subscribe,
      emit,
      useRenderingSubscription,
    }),
    [subscribe, emit, useRenderingSubscription]
  );
};

export type TEmitter<R extends TRegistryContent> = ReturnType<
  typeof useEmitter<R>
>;

export const DEFAULT_EMITTER_CONTEXT: TEmitter<TRegistryContent> = {
  subscribe: () => {
    console.warn(
      'Default "subscribe" method is used! Pass the emitter context for real emitter using'
    );

    return () => undefined;
  },
  useRenderingSubscription: () => {
    console.warn(
      'Default "useRenderingSubscription" method is used! Pass the emitter context for real emitter using'
    );
  },
  emit: () => {
    console.warn(
      'Default "emit" method is used! Pass the emitter context for real emitter using'
    );
  },
};
