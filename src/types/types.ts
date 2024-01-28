// "any" usage explanation: Typescript's Parameters utility doesn't work with the "Function" type, only works with the type which described below
// eslint-disable-next-line
export type TBaseHandler<R = any> = (...args: any[]) => R;
