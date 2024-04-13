// "any" usage explanation: Typescript's Parameters utility doesn't work with the "Function" type, only works with the type which described below
// eslint-disable-next-line
export type TBaseHandler<R = any> = (...args: any[]) => R;

export type TAction<T, P> = {
  type: T;
  payload: P;
};

export type TStateReducers<
  S extends Record<string, unknown>,
  P extends Record<string, unknown>,
> = {
  [Property in keyof P]: (arg0: S, arg1: TAction<Property, P[Property]>) => S;
};

export type TStateActions<P extends Record<string, unknown>> = {
  [Property in keyof P]: (arg0: P[Property]) => void;
};

export type TActionPayload<D extends Record<string, unknown>> = {
  [P in keyof D as `set${Capitalize<string & P>}`]: D[P];
} & {
  setState: D;
  cleanState: void;
};

export type TSelectorHooks<D extends Record<string, unknown>> = {
  [P in keyof D as `use${Capitalize<string & P>}`]: () => D[P];
} & {
  useState: () => D;
};
