import { useEffect } from 'react';
import { renderHook, act } from '@testing-library/react';

import { TAction } from 'types';

import { useState } from './useState';

type TState = {
  name: string;
  age: number | null;
};

type TRenderStateParams = Partial<{
  effectFn: jest.Mock;
  renderingFn: jest.Mock;
}>;

const renderState = ({ effectFn, renderingFn }: TRenderStateParams = {}) => {
  const initialState: TState = {
    name: '',
    age: null,
  };

  const reducers = {
    setName: (state: TState, action: TAction<string, string>) => ({
      ...state,
      name: action.payload,
    }),
    setAge: (state: TState, action: TAction<string, number>) => ({
      ...state,
      age: action.payload,
    }),
  };

  return renderHook(() => {
    const state = useState({
      initialState,
      reducers,
    });

    renderingFn?.();

    useEffect(() => {
      effectFn?.();
    }, [state]);

    return state;
  });
};

const selectName = (state: TState) => state.name;
const selectAge = (state: TState) => state.age;

describe('UseState', () => {
  it('is created successfully', () => {
    const { result: stateRef } = renderState();

    expect(stateRef.current).toHaveProperty('getState');
    expect(stateRef.current).toHaveProperty('actions');
    expect(stateRef.current).toHaveProperty('useSelector');
    expect(stateRef.current.getState().name).toEqual('');
    expect(stateRef.current.getState().age).toBeNull();

    const { result: nameRef } = renderHook(() =>
      stateRef.current.useSelector(selectName)
    );
    const { result: ageRef } = renderHook(() =>
      stateRef.current.useSelector(selectAge)
    );

    expect(nameRef.current).toEqual('');
    expect(ageRef.current).toBeNull();
  });

  it('is updated successfully', () => {
    const effectFn = jest.fn();

    const { result: stateRef } = renderState();

    const { result: nameRef } = renderHook(() => {
      const name = stateRef.current.useSelector(selectName);

      useEffect(() => {
        effectFn(name);
      }, [name]);

      return name;
    });

    expect(effectFn.mock.calls).toHaveLength(1);
    expect(effectFn.mock.calls[0][0]).toEqual('');

    act(() => stateRef.current.actions.setName('Alice'));

    expect(effectFn.mock.calls).toHaveLength(2);
    expect(effectFn.mock.calls[1][0]).toEqual('Alice');

    let name = stateRef.current.getState().name;

    expect(nameRef.current).toEqual('Alice');
    expect(name).toEqual('Alice');

    act(() => stateRef.current.actions.setName('Bob'));

    expect(effectFn.mock.calls).toHaveLength(3);
    expect(effectFn.mock.calls[2][0]).toEqual('Bob');

    name = stateRef.current.getState().name;

    expect(nameRef.current).toEqual('Bob');
    expect(name).toEqual('Bob');
  });

  it("doesn't rerender unused selector after changing another state value", () => {
    const nameEffectFn = jest.fn();
    const nameRenderingFn = jest.fn();
    const ageEffectFn = jest.fn();
    const ageRenderingFn = jest.fn();

    const { result: stateRef } = renderState();

    const { result: nameRef } = renderHook(() => {
      const name = stateRef.current.useSelector(selectName);

      nameRenderingFn();

      useEffect(() => {
        nameEffectFn(name);
      }, [name]);

      return name;
    });

    const { result: ageRef } = renderHook(() => {
      const age = stateRef.current.useSelector(selectAge);

      ageRenderingFn();

      useEffect(() => {
        ageEffectFn(age);
      }, [age]);

      return age;
    });

    expect(nameRef.current).toEqual('');
    expect(ageRef.current).toBeNull();
    expect(nameEffectFn.mock.calls).toHaveLength(1);
    expect(nameEffectFn.mock.calls[0][0]).toEqual('');
    expect(nameRenderingFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls[0][0]).toBeNull();
    expect(ageRenderingFn.mock.calls).toHaveLength(1);

    act(() => stateRef.current.actions.setAge(20));

    expect(nameRef.current).toEqual('');
    expect(ageRef.current).toEqual(20);
    expect(nameEffectFn.mock.calls).toHaveLength(1);
    expect(nameEffectFn.mock.calls[0][0]).toEqual('');
    expect(nameRenderingFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls).toHaveLength(2);
    expect(ageEffectFn.mock.calls[1][0]).toEqual(20);
    expect(ageRenderingFn.mock.calls).toHaveLength(2);
  });

  it('creates immutable state', () => {
    const stateFn = jest.fn();

    const { result: stateRef } = renderState({
      effectFn: stateFn,
    });

    expect(stateFn.mock.calls).toHaveLength(1);

    act(() => stateRef.current.actions.setName('Alice'));

    expect(stateFn.mock.calls).toHaveLength(1);
  });

  xit("doesn't rerender component in wich the state was created", () => {
    const stateFn = jest.fn();

    const { result: stateRef } = renderState({
      renderingFn: stateFn,
    });

    expect(stateFn.mock.calls).toHaveLength(1);

    act(() => stateRef.current.actions.setName('Alice'));

    expect(stateFn.mock.calls).toHaveLength(1);
  });
});
