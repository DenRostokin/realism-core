import { useCallback, useMemo, useRef } from 'react';

import { TBaseHandler } from 'types';

export type TRegistryContent = Record<string | symbol, TBaseHandler>;

export const useRegistry = <R extends TRegistryContent>() => {
  type TRegistryEvent = keyof R;
  type TRegistryHandler = R[keyof R];
  type TRegistryRef = Record<TRegistryEvent, Map<symbol, TRegistryHandler>>;

  const registryRef = useRef({} as TRegistryRef);

  const get = useCallback(<T extends TRegistryEvent>(eventName: T) => {
    if (!(eventName in registryRef.current)) {
      return [];
    }

    return Array.from(registryRef.current[eventName].values()) as R[T][];
  }, []);

  const add = useCallback(
    (eventName: TRegistryEvent, eventHandler: TRegistryHandler) => {
      const handlerKey = Symbol('Registry handler') as symbol;

      if (!(eventName in registryRef.current)) {
        registryRef.current[eventName] = new Map();
      }

      registryRef.current[eventName].set(handlerKey, eventHandler);

      return handlerKey;
    },
    []
  );

  const remove = useCallback(
    (eventName: TRegistryEvent, handlerKey: symbol) => {
      registryRef.current[eventName]?.delete(handlerKey);
    },
    []
  );

  const clear = useCallback((eventName: TRegistryEvent) => {
    delete registryRef.current[eventName];
  }, []);

  return useMemo(
    () => ({
      add,
      remove,
      get,
      clear,
    }),
    [add, remove, get, clear]
  );
};

export type TRegistry<R extends TRegistryContent> = ReturnType<
  typeof useRegistry<R>
>;

export const DEFAULT_REGISTRY_CONTEXT: TRegistry<TRegistryContent> = {
  add: () => {
    console.warn(
      'Default "add" method is used! Pass the registry context for real registry using'
    );

    return Symbol('Registry handler');
  },
  get: () => {
    console.warn(
      'Default "get" method is used! Pass the registry context for real registry using'
    );

    return [];
  },
  remove: () => {
    console.warn(
      'Default "remove" method is used! Pass the registry context for real registry using'
    );
  },
  clear: () => {
    console.warn(
      'Default "clear" method is used! Pass the registry context for real registry using'
    );
  },
};
