type TSelector<D extends Record<string, unknown>, R> = (arg0: D) => R;

export type TUseSelector<D extends Record<string, unknown>> = <R>(
  arg0: TSelector<D, R>
) => R;
