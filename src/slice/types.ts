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

type TSelector<D extends Record<string, unknown>, R> = (arg0: D) => R;

export type TUseSelector<D extends Record<string, unknown>> = <R>(
  arg0: TSelector<D, R>
) => R;
