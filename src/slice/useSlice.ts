/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */
import { useMemo } from 'react';

import { TStateReducers, TStateActions, TActionPayload } from 'types';

import { useState } from './useState';
import { useSelectors } from './useSelectors';
import { generateKeyWithPrefix } from './utils';

export const useSlice = <D extends Record<string, unknown>>(
  initialState: D,
  externalReducers: Partial<TStateReducers<D, TActionPayload<D>>> = {}
) => {
  const reducers = useMemo(() => {
    return Object.keys(initialState).reduce(
      (acc, key) => ({
        ...acc,
        // The "any" type is not important in the place. It simplifies reducers generation
        [generateKeyWithPrefix('set', key)]: (state: D, action: any) => ({
          ...state,
          [key]: action.payload,
        }),
      }),
      {
        setState: (_, action) => action.payload,
        cleanState: () => initialState,
      } as TStateReducers<D, TActionPayload<D>>
    );
  }, []); // eslint-disable-line

  const { actions, getState, useSelector } = useState({
    initialState,
    reducers: {
      ...reducers,
      ...externalReducers,
    },
  });

  const selectors = useSelectors(initialState, useSelector);

  return useMemo(
    () => ({
      actions: actions as TStateActions<TActionPayload<D>>,
      selectors,
      getState,
    }),
    [] // eslint-disable-line
  );
};

export type TSlice<D extends Record<string, unknown>> = ReturnType<
  typeof useSlice<D>
>;
