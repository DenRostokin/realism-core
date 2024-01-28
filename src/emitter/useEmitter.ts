// the next dependency is needed for the correct type declarations denerating. DO NOT REMOVE IT!
import { useEffect, useMemo, createContext, Context } from 'react';

import {
  useRegistry,
  useRegistryEmitter,
  useRegistrySubscriber,
  TRegistryType,
  TRegistrySubscriber,
  // the next dependency is needed for the correct type declarations denerating. DO NOT REMOVE IT!
  TRegistryEmitter
} from '../registry';
import { noop } from '../utils';

const useRenderingSubscriptionHook = <R extends TRegistryType>(
  subscribe: TRegistrySubscriber<R>,
) => {
  const useRenderingSubscription = (
    ...args: Parameters<TRegistrySubscriber<R>>
  ) => {
    const unsubscribe = useMemo(() => {
      return subscribe(...args);
    }, [...args]); // eslint-disable-line

    useEffect(() => unsubscribe, [unsubscribe]);
  };

  return useMemo(() => useRenderingSubscription, []); // eslint-disable-line
};

export const useEmitter = <R extends TRegistryType>() => {
  const registry = useRegistry<R>();
  const subscribe = useRegistrySubscriber(registry);
  const emit = useRegistryEmitter(registry);
  const useRenderingSubscription = useRenderingSubscriptionHook(subscribe);

  return useMemo(
    () => ({
      subscribe,
      emit,
      useRenderingSubscription,
    }),
    [subscribe, emit, useRenderingSubscription],
  );
};

export const DEFAULT_EMITTER_CONTEXT = {
  subscribe: () => noop,
  useRenderingSubscription: noop,
  emit: noop,
};

export type TEmitterType<R extends TRegistryType> = ReturnType<typeof useEmitter<R>>; 

export const createEmitterContext = <R extends TRegistryType>() => {
  return createContext<TEmitterType<R>>(DEFAULT_EMITTER_CONTEXT);
};
