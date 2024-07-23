import { createContext } from 'react';

import { TSelectorHooks, TStateActions, TActionPayload } from 'types';

import { TSlice } from './useSlice';
import { generateKeyWithPrefix } from './utils';

export const createSliceContext = <D extends Record<string, unknown>>(
  initialState: D
) => {
  const actions = Object.keys(initialState).reduce(
    (acc, key) => ({
      ...acc,
      [generateKeyWithPrefix('set', key)]: () => undefined,
    }),
    {
      setState: () => undefined,
      cleanState: () => undefined,
    } as TStateActions<TActionPayload<D>>
  );

  const selectors = Object.keys(initialState).reduce(
    (acc, key) => ({
      ...acc,
      [generateKeyWithPrefix('use', key)]: () => initialState[key],
    }),
    {
      useState: () => initialState,
    } as TSelectorHooks<D>
  );

  const getState = () => initialState;

  const CONTEXT_VALUE: TSlice<D> = {
    actions,
    selectors,
    getState,
  };

  const Context = createContext(CONTEXT_VALUE);

  return { Context, CONTEXT_VALUE };
};
