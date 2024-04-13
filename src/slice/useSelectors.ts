import { useMemo, useCallback } from 'react';

import { TSelectorHooks } from 'types';

import { generateKeyWithPrefix } from './utils';
import { TUseSelector } from './types';

export const useSelectors = <D extends Record<string, unknown>>(
  initialState: D,
  useSelector: TUseSelector<D>
) => {
  const stateSelector = useCallback((state: D) => state, []);

  return useMemo(() => {
    return Object.keys(initialState).reduce(
      (acc, key) => {
        const selector = (state: D) => state[key];

        return {
          ...acc,
          // eslint-disable-next-line
          [generateKeyWithPrefix('use', key)]: () => useSelector(selector),
        };
      },
      {
        useState: () => useSelector(stateSelector),
      } as TSelectorHooks<D>
    );
  }, []); // eslint-disable-line
};
