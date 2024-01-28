import { useCallback, useMemo, useRef } from 'react';

import { TBaseHandler } from '../types';

export type TRegistryType = Record<string | symbol, TBaseHandler>;

export interface IRegistry<R extends TRegistryType> {
  get<T extends keyof R>(arg0: T): R[T][];
  add(arg0: keyof R, arg1: R[keyof R]): symbol;
  remove(arg0: keyof R, arg1: symbol): void;
  clear(arg0: symbol): void;
}

export const useRegistry = <R extends TRegistryType>(): IRegistry<R> => {
  type TRegistryEvent = keyof R;
  type TRegistryHandler = R[keyof R];
  type TRegistry = Record<TRegistryEvent, Map<symbol, TRegistryHandler>>;

  const registry = useRef({} as TRegistry);

  const get = useCallback(<T extends TRegistryEvent>(eventName: T) => {
    if (!(eventName in registry.current)) {
      return [];
    }

    return Array.from(registry.current[eventName].values()) as R[T][];
  }, []);

  const add = useCallback(
    (eventName: TRegistryEvent, eventHandler: TRegistryHandler) => {
      const handlerKey = Symbol('Registry handler');

      if (!(eventName in registry.current)) {
        registry.current[eventName] = new Map();
      }

      registry.current[eventName].set(handlerKey, eventHandler);

      return handlerKey;
    },
    [],
  );

  const remove = useCallback(
    (eventName: TRegistryEvent, handlerKey: symbol) => {
      registry.current[eventName]?.delete(handlerKey);
    },
    [],
  );

  const clear = useCallback(
    (eventName: TRegistryEvent) => {
      delete registry.current[eventName];
    },
    []
  )

  return useMemo(
    () => ({
      add,
      remove,
      get,
      clear,
    }),
    [add, remove, get, clear],
  );
};

export type TRegistrySubscriber<R extends TRegistryType> = (
  arg0: keyof R,
  arg1: R[keyof R],
) => () => void;

export const useRegistrySubscriber = <R extends TRegistryType>(
  registry: IRegistry<R>,
) => {
  return useCallback<TRegistrySubscriber<R>>(
    (eventName, eventHandler) => {
      const handlerKey = registry.add(eventName, eventHandler);

      return () => {
        registry.remove(eventName, handlerKey);
      };
    },
    [registry],
  );
};

export type TRegistryEmitter<R extends TRegistryType> = (
  arg0: keyof R,
  ...args: Parameters<R[keyof R]>
) => void;

export const useRegistryEmitter = <R extends TRegistryType>(
  registry: IRegistry<R>,
) => {
  return useCallback<TRegistryEmitter<R>>(
    (eventName, ...args) => {
      const handlers = registry.get(eventName);

      handlers.forEach((handler) => handler(...args));
    },
    [registry],
  );
};
