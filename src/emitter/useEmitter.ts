// the next dependency is needed for the correct type declarations denerating. DO NOT REMOVE IT!
// eslint-disable-next-line
import { useEffect, useMemo, createContext, Context, useCallback } from 'react';

import { useRegistry, TRegistryType } from '../registry';
import { noop } from '../utils';

export type TSubscribe<R extends TRegistryType> = (
  arg0: keyof R,
  arg1: R[keyof R]
) => () => void;

export type TEmit<R extends TRegistryType> = (
  arg0: keyof R,
  ...args: Parameters<R[keyof R]>
) => void;

const useRenderingSubscriptionHook = <R extends TRegistryType>(
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

export const useEmitter = <R extends TRegistryType>() => {
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

export const DEFAULT_EMITTER_CONTEXT = {
  subscribe: () => noop,
  useRenderingSubscription: noop,
  emit: noop,
};

export type TEmitter<R extends TRegistryType> = ReturnType<
  typeof useEmitter<R>
>;

export const createEmitterContext = <R extends TRegistryType>() => {
  return createContext<TEmitter<R>>(DEFAULT_EMITTER_CONTEXT);
};
