import { FC, useContext, PropsWithChildren } from 'react';
import { render, renderHook } from '@testing-library/react';

import { useSlice, TSlice } from './useSlice';
import { createSliceContext } from './createSliceContext';

type TPerson = {
  name: string;
  age: number | null;
};

const initialSlice: TPerson = {
  name: '',
  age: null,
};

const validatePersonSlice = (slice: TSlice<TPerson>) => {
  expect(slice).toHaveProperty('actions');
  expect(slice).toHaveProperty('selectors');
  expect(slice).toHaveProperty('getState');
  expect(slice.actions).toHaveProperty('setState');
  expect(slice.actions).toHaveProperty('cleanState');
  expect(slice.actions).toHaveProperty('setName');
  expect(slice.actions).toHaveProperty('setAge');
  expect(slice.selectors).toHaveProperty('useState');
  expect(slice.selectors).toHaveProperty('useName');
  expect(slice.selectors).toHaveProperty('useAge');
};

describe('CreateSliceContext', () => {
  it('creates a default context value successfully', () => {
    const { CONTEXT_VALUE } = createSliceContext(initialSlice);

    validatePersonSlice(CONTEXT_VALUE);
  });

  it('creates selectors correctly', () => {
    const { CONTEXT_VALUE } = createSliceContext(initialSlice);
    const { result: sliceValueRef } = renderHook(() =>
      CONTEXT_VALUE.selectors.useState()
    );
    const { result: nameRef } = renderHook(() =>
      CONTEXT_VALUE.selectors.useName()
    );
    const { result: ageRef } = renderHook(() =>
      CONTEXT_VALUE.selectors.useAge()
    );

    expect(sliceValueRef.current).toHaveProperty('name');
    expect(sliceValueRef.current).toHaveProperty('age');
    expect(nameRef.current).toEqual('');
    expect(ageRef.current).toBeNull();
  });

  it('creates getState method correctly', () => {
    const { CONTEXT_VALUE } = createSliceContext(initialSlice);
    const sliceValue = CONTEXT_VALUE.getState();

    expect(sliceValue).toHaveProperty('name');
    expect(sliceValue).toHaveProperty('age');
    expect(sliceValue.name).toEqual('');
    expect(sliceValue.age).toBeNull();
  });

  it('creates actions correctly', () => {
    const { CONTEXT_VALUE } = createSliceContext(initialSlice);

    expect(
      CONTEXT_VALUE.actions.setState({
        name: 'John',
        age: 30,
      })
    ).toBeUndefined();
    expect(CONTEXT_VALUE.actions.cleanState()).toBeUndefined();
    expect(CONTEXT_VALUE.actions.setName('John')).toBeUndefined();
    expect(CONTEXT_VALUE.actions.setAge(30)).toBeUndefined();
  });

  it('pass a slice throught a context successfully', () => {
    const sliceRef = {} as TSlice<TPerson>;
    const { Context } = createSliceContext(initialSlice);

    const SliceConsumer: FC = () => {
      const slice = useContext(Context);

      Object.assign(sliceRef, slice);

      return null;
    };

    const SliceProvider: FC<PropsWithChildren> = ({ children }) => {
      const slice = useSlice(initialSlice);

      return <Context.Provider value={slice}>{children}</Context.Provider>;
    };

    render(
      <SliceProvider>
        <SliceConsumer />
      </SliceProvider>
    );

    validatePersonSlice(sliceRef);
  });
});
