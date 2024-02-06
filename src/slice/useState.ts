import {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState as useReactState,
} from 'react';

import { useEmitter } from 'emitter';
import { TStateReducers, TAction, TStateActions } from 'types';

export type TUseStateParams<
  S extends Record<string, unknown>,
  P extends Record<string, unknown>,
> = {
  initialState: S;
  reducers: TStateReducers<S, P>;
};

type TStateRegistry<S extends Record<string, unknown>> = {
  changeState: (arg0: S) => void;
};

const useStateReducer = <
  S extends Record<string, unknown>,
  P extends Record<string, unknown>,
>(
  reducers: TStateReducers<S, P>
) => {
  return useCallback((state: S, action: TAction<keyof P, P[keyof P]>) => {
    if (!(action.type in reducers)) {
      return state;
    }

    return reducers[action.type](state, action);
  }, []); // eslint-disable-line
};

export const useState = <
  S extends Record<string, unknown>,
  P extends Record<string, unknown>,
>({
  initialState,
  reducers,
}: TUseStateParams<S, P>) => {
  const { emit, subscribe } = useEmitter<TStateRegistry<S>>();
  const reducer = useStateReducer(reducers);
  const stateRef = useRef(initialState);

  const dispatch = useCallback((action: TAction<keyof P, P[keyof P]>) => {
    const newState = reducer(stateRef.current, action);

    stateRef.current = newState;

    emit('changeState', newState);
  }, []); // eslint-disable-line

  const getState = useCallback(() => {
    return stateRef.current;
  }, []);

  type TSelector<R> = (arg0: S) => R;

  const useSelector = useCallback(function useSelector<R>(
    selector: TSelector<R>
  ) {
    const [selectorState, setSelectorState] = useReactState(
      selector(getState())
    );

    useEffect(
      () =>
        subscribe('changeState', (newState) =>
          setSelectorState(selector(newState))
        ),
      [selector, setSelectorState]
    );

    return selectorState;
  }, []); // eslint-disable-line

  const actions = useMemo(() => {
    return Object.keys(reducers).reduce(
      (acc, type: keyof P) => ({
        ...acc,
        [type]: (payload: P[keyof P]) => {
          dispatch({
            type,
            payload,
          });
        },
      }),
      {} as TStateActions<P>
    );
  }, []); // eslint-disable-line

  return useMemo(
    () => ({
      getState,
      useSelector,
      actions,
    }),
    [] // eslint-disable-line
  );
};
