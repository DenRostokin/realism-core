import { useEffect } from 'react';
import { renderHook, act } from '@testing-library/react';

import { useSlice } from './useSlice';

type TRenderSliceParams = Partial<{
  effectFn: jest.Mock;
  renderingFn: jest.Mock;
}>;

type TSlice = {
  name: string;
  age: number | null;
};

const initialSlice: TSlice = {
  name: '',
  age: null,
};

const renderSlice = ({ effectFn, renderingFn }: TRenderSliceParams = {}) => {
  return renderHook(() => {
    const slice = useSlice(initialSlice);

    renderingFn?.();

    useEffect(() => {
      effectFn?.();
    }, [slice]);

    return slice;
  });
};

describe('UseSlice', () => {
  it('creates a slice successfully', () => {
    const { result: sliceRef } = renderSlice();

    expect(sliceRef.current).toHaveProperty('actions');
    expect(sliceRef.current).toHaveProperty('selectors');
    expect(sliceRef.current).toHaveProperty('getState');
    expect(sliceRef.current.actions).toHaveProperty('setState');
    expect(sliceRef.current.actions).toHaveProperty('cleanState');
    expect(sliceRef.current.actions).toHaveProperty('setName');
    expect(sliceRef.current.actions).toHaveProperty('setAge');
    expect(sliceRef.current.selectors).toHaveProperty('useState');
    expect(sliceRef.current.selectors).toHaveProperty('useName');
    expect(sliceRef.current.selectors).toHaveProperty('useAge');
  });

  it('initializes values correctly', () => {
    const { result: sliceRef } = renderSlice();

    const { result: stateRef } = renderHook(() =>
      sliceRef.current.selectors.useState()
    );

    const { result: nameRef } = renderHook(() =>
      sliceRef.current.selectors.useName()
    );

    const { result: ageRef } = renderHook(() =>
      sliceRef.current.selectors.useAge()
    );

    const state = sliceRef.current.getState();

    expect(stateRef.current).toEqual(state);
    expect(nameRef.current).toEqual(state.name);
    expect(ageRef.current).toEqual(state.age);
    expect(state.name).toEqual('');
    expect(state.age).toBeNull();
  });

  it('updates values correctly', () => {
    const effectFn = jest.fn();

    const { result: sliceRef } = renderSlice();

    const { result: nameRef } = renderHook(() => {
      const name = sliceRef.current.selectors.useName();

      useEffect(() => {
        effectFn(name);
      }, [name]);

      return name;
    });

    expect(effectFn.mock.calls).toHaveLength(1);
    expect(effectFn.mock.calls[0][0]).toEqual('');

    act(() => sliceRef.current.actions.setName('Alice'));

    let name = sliceRef.current.getState().name;

    expect(nameRef.current).toEqual('Alice');
    expect(name).toEqual('Alice');
    expect(effectFn.mock.calls).toHaveLength(2);
    expect(effectFn.mock.calls[1][0]).toEqual('Alice');

    act(() => sliceRef.current.actions.setName('Bob'));

    name = sliceRef.current.getState().name;

    expect(nameRef.current).toEqual('Bob');
    expect(name).toEqual('Bob');
    expect(effectFn.mock.calls).toHaveLength(3);
    expect(effectFn.mock.calls[2][0]).toEqual('Bob');
  });

  it("doesn't rerender unused selector after changing another state value", () => {
    const nameEffectFn = jest.fn();
    const nameRenderingFn = jest.fn();
    const ageEffectFn = jest.fn();
    const ageRenderingFn = jest.fn();

    const { result: sliceRef } = renderSlice();

    const { result: nameRef } = renderHook(() => {
      const name = sliceRef.current.selectors.useName();

      nameRenderingFn();

      useEffect(() => {
        nameEffectFn(name);
      }, [name]);

      return name;
    });

    const { result: ageRef } = renderHook(() => {
      const age = sliceRef.current.selectors.useAge();

      ageRenderingFn();

      useEffect(() => {
        ageEffectFn(age);
      }, [age]);

      return age;
    });

    expect(nameRef.current).toEqual('');
    expect(ageRef.current).toBeNull();
    expect(ageRenderingFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls[0][0]).toBeNull();
    expect(nameRenderingFn.mock.calls).toHaveLength(1);
    expect(nameEffectFn.mock.calls).toHaveLength(1);
    expect(nameEffectFn.mock.calls[0][0]).toEqual('');

    act(() => sliceRef.current.actions.setName('Alice'));

    expect(nameRef.current).toEqual('Alice');
    expect(ageRef.current).toBeNull();
    expect(ageRenderingFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls[0][0]).toBeNull();
    expect(nameRenderingFn.mock.calls).toHaveLength(2);
    expect(nameEffectFn.mock.calls).toHaveLength(2);
    expect(nameEffectFn.mock.calls[1][0]).toEqual('Alice');
  });

  it('rerender all selectors after whole state changing', () => {
    const nameEffectFn = jest.fn();
    const nameRenderingFn = jest.fn();
    const ageEffectFn = jest.fn();
    const ageRenderingFn = jest.fn();

    const { result: sliceRef } = renderSlice();

    const { result: nameRef } = renderHook(() => {
      const name = sliceRef.current.selectors.useName();

      nameRenderingFn();

      useEffect(() => {
        nameEffectFn(name);
      }, [name]);

      return name;
    });

    const { result: ageRef } = renderHook(() => {
      const age = sliceRef.current.selectors.useAge();

      ageRenderingFn();

      useEffect(() => {
        ageEffectFn(age);
      }, [age]);

      return age;
    });

    expect(nameRef.current).toEqual('');
    expect(ageRef.current).toBeNull();
    expect(ageRenderingFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls[0][0]).toBeNull();
    expect(nameRenderingFn.mock.calls).toHaveLength(1);
    expect(nameEffectFn.mock.calls).toHaveLength(1);
    expect(nameEffectFn.mock.calls[0][0]).toEqual('');

    act(() =>
      sliceRef.current.actions.setState({
        name: 'Alice',
        age: 23,
      })
    );

    expect(nameRef.current).toEqual('Alice');
    expect(ageRef.current).toEqual(23);
    expect(ageRenderingFn.mock.calls).toHaveLength(2);
    expect(ageEffectFn.mock.calls).toHaveLength(2);
    expect(ageEffectFn.mock.calls[1][0]).toEqual(23);
    expect(nameRenderingFn.mock.calls).toHaveLength(2);
    expect(nameEffectFn.mock.calls).toHaveLength(2);
    expect(nameEffectFn.mock.calls[1][0]).toEqual('Alice');
  });

  it("doesn't rerender unchanged selector after changing the state wia 'setState' action", () => {
    const nameEffectFn = jest.fn();
    const nameRenderingFn = jest.fn();
    const ageEffectFn = jest.fn();
    const ageRenderingFn = jest.fn();

    const { result: sliceRef } = renderSlice();

    const { result: nameRef } = renderHook(() => {
      const name = sliceRef.current.selectors.useName();

      nameRenderingFn();

      useEffect(() => {
        nameEffectFn(name);
      }, [name]);

      return name;
    });

    const { result: ageRef } = renderHook(() => {
      const age = sliceRef.current.selectors.useAge();

      ageRenderingFn();

      useEffect(() => {
        ageEffectFn(age);
      }, [age]);

      return age;
    });

    expect(nameRef.current).toEqual('');
    expect(ageRef.current).toBeNull();
    expect(ageRenderingFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls).toHaveLength(1);
    expect(ageEffectFn.mock.calls[0][0]).toBeNull();
    expect(nameRenderingFn.mock.calls).toHaveLength(1);
    expect(nameEffectFn.mock.calls).toHaveLength(1);
    expect(nameEffectFn.mock.calls[0][0]).toEqual('');

    act(() =>
      sliceRef.current.actions.setState({
        ...sliceRef.current.getState(),
        age: 20,
      })
    );

    expect(nameRef.current).toEqual('');
    expect(ageRef.current).toEqual(20);
    expect(ageRenderingFn.mock.calls).toHaveLength(2);
    expect(ageEffectFn.mock.calls).toHaveLength(2);
    expect(ageEffectFn.mock.calls[1][0]).toEqual(20);
    expect(nameRenderingFn.mock.calls).toHaveLength(1);
    expect(nameEffectFn.mock.calls).toHaveLength(1);
    expect(nameEffectFn.mock.calls[0][0]).toEqual('');
  });

  it('clears state correctly', () => {
    const { result: sliceRef } = renderSlice();

    const { result: nameRef } = renderHook(() =>
      sliceRef.current.selectors.useName()
    );

    const { result: ageRef } = renderHook(() =>
      sliceRef.current.selectors.useAge()
    );

    expect(nameRef.current).toEqual('');
    expect(ageRef.current).toBeNull();

    act(() =>
      sliceRef.current.actions.setState({
        name: 'Alice',
        age: 23,
      })
    );

    expect(nameRef.current).toEqual('Alice');
    expect(ageRef.current).toEqual(23);

    act(() => sliceRef.current.actions.cleanState());

    expect(nameRef.current).toEqual('');
    expect(ageRef.current).toBeNull();
  });

  it("rerenders 'useState' selector after any value changing", () => {
    const stateEffectFn = jest.fn();
    const stateRenderingFn = jest.fn();

    const { result: sliceRef } = renderSlice();

    const { result: stateRef } = renderHook(() => {
      const state = sliceRef.current.selectors.useState();

      stateRenderingFn();

      useEffect(() => {
        stateEffectFn(state);
      }, [state]);

      return state;
    });

    expect(stateRef.current.name).toEqual('');
    expect(stateRef.current.age).toBeNull();
    expect(stateRenderingFn.mock.calls).toHaveLength(1);
    expect(stateEffectFn.mock.calls).toHaveLength(1);
    expect(stateEffectFn.mock.calls[0][0].name).toEqual('');
    expect(stateEffectFn.mock.calls[0][0].age).toBeNull();

    act(() => sliceRef.current.actions.setAge(20));

    expect(stateRef.current.name).toEqual('');
    expect(stateRef.current.age).toEqual(20);
    expect(stateRenderingFn.mock.calls).toHaveLength(2);
    expect(stateEffectFn.mock.calls).toHaveLength(2);
    expect(stateEffectFn.mock.calls[1][0].name).toEqual('');
    expect(stateEffectFn.mock.calls[1][0].age).toEqual(20);
  });

  it('creates immutable slice', () => {
    const sliceEffectFn = jest.fn();

    const { result: sliceRef } = renderSlice({
      effectFn: sliceEffectFn,
    });

    expect(sliceEffectFn.mock.calls).toHaveLength(1);

    act(() =>
      sliceRef.current.actions.setState({
        name: 'Alice',
        age: 23,
      })
    );

    expect(sliceEffectFn.mock.calls).toHaveLength(1);
  });

  it("doesn't rerender a component in wich the slice was created", () => {
    const sliceRenderingFn = jest.fn();

    const { result: sliceRef } = renderSlice({
      renderingFn: sliceRenderingFn,
    });

    expect(sliceRenderingFn.mock.calls).toHaveLength(1);

    act(() =>
      sliceRef.current.actions.setState({
        name: 'Alice',
        age: 23,
      })
    );

    expect(sliceRenderingFn.mock.calls).toHaveLength(1);
  });
});
