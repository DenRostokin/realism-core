import {
  FC,
  useEffect,
  useContext,
  PropsWithChildren,
  createContext,
} from 'react';
import { renderHook, render } from '@testing-library/react';

import {
  useRegistry,
  TRegistry,
  TRegistryContent,
  DEFAULT_REGISTRY_CONTEXT,
} from './useRegistry';

describe('Registry', () => {
  it('is cteated successfully', () => {
    const { result: registryRef } = renderHook(() => useRegistry());

    expect(registryRef.current).toHaveProperty('add');
    expect(registryRef.current).toHaveProperty('remove');
    expect(registryRef.current).toHaveProperty('get');
    expect(registryRef.current).toHaveProperty('clear');
  });

  it('has a correct default context', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn);

    expect(DEFAULT_REGISTRY_CONTEXT).toHaveProperty('add');
    expect(DEFAULT_REGISTRY_CONTEXT).toHaveProperty('remove');
    expect(DEFAULT_REGISTRY_CONTEXT).toHaveProperty('get');
    expect(DEFAULT_REGISTRY_CONTEXT).toHaveProperty('clear');

    const areaKey = 'area';
    const handler = jest.fn();

    const handleKey = DEFAULT_REGISTRY_CONTEXT.add(areaKey, handler);

    expect(typeof consoleSpy.mock.calls[0][0]).toBe('string');
    expect(typeof handleKey).toBe('symbol');

    const handlersFromRegistry = DEFAULT_REGISTRY_CONTEXT.get(areaKey);

    expect(typeof consoleSpy.mock.calls[1][0]).toBe('string');
    expect(Array.isArray(handlersFromRegistry)).toBeTruthy();
    expect(handlersFromRegistry).toHaveLength(0);

    DEFAULT_REGISTRY_CONTEXT.remove(areaKey, handleKey);

    expect(typeof consoleSpy.mock.calls[2][0]).toBe('string');

    DEFAULT_REGISTRY_CONTEXT.clear(areaKey);

    expect(typeof consoleSpy.mock.calls[3][0]).toBe('string');
  });

  it('passes context correctly', () => {
    const registryRef = {} as TRegistry<TRegistryContent>;
    const RegistryContext = createContext<TRegistry<TRegistryContent>>(
      DEFAULT_REGISTRY_CONTEXT
    );

    const RegistryProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
      const registry = useRegistry();

      return (
        <RegistryContext.Provider value={registry}>
          {children}
        </RegistryContext.Provider>
      );
    };

    const RegistryConsumer: FC = () => {
      const registry = useContext(RegistryContext);

      Object.assign(registryRef, registry);

      return null;
    };

    render(
      <RegistryProvider>
        <RegistryConsumer />
      </RegistryProvider>
    );

    expect(registryRef).toHaveProperty('add');
    expect(registryRef).toHaveProperty('remove');
    expect(registryRef).toHaveProperty('get');
    expect(registryRef).toHaveProperty('clear');
  });

  it('returns an empty array for unregistered handlers', () => {
    const { result: registryRef } = renderHook(() => useRegistry());

    const nonexistentAreaKey = 'nonexistentArea';

    const nonexistentHandlers = registryRef.current.get(nonexistentAreaKey);

    expect(nonexistentHandlers).toBeInstanceOf(Array);
    expect(nonexistentHandlers).toHaveLength(0);
  });

  it('registers a single handler successfully', () => {
    const { result: registryRef } = renderHook(() => useRegistry());

    const areaKey = 'area';
    const handler = jest.fn();

    registryRef.current.add(areaKey, handler);

    const registryHandlers = registryRef.current.get(areaKey);

    expect(registryHandlers).toBeInstanceOf(Array);
    expect(registryHandlers).toHaveLength(1);
    expect(registryHandlers[0]).toEqual(handler);
  });

  it('registers multiple handlers in a single area successfully', () => {
    const { result: registryRef } = renderHook(() => useRegistry());

    const areaKey = 'area';
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    registryRef.current.add(areaKey, handler1);
    registryRef.current.add(areaKey, handler2);

    const registryHandlers = registryRef.current.get(areaKey);

    expect(registryHandlers).toBeInstanceOf(Array);
    expect(registryHandlers).toHaveLength(2);
    expect(registryHandlers[0]).toEqual(handler1);
    expect(registryHandlers[1]).toEqual(handler2);
  });

  it('registers multiple handlers in multiple areas successfully', () => {
    const { result: registryRef } = renderHook(() => useRegistry());

    const areaKey1 = 'area1';
    const areaKey2 = 'area2';
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn();
    const handler4 = jest.fn();

    registryRef.current.add(areaKey1, handler1);
    registryRef.current.add(areaKey1, handler2);
    registryRef.current.add(areaKey2, handler3);
    registryRef.current.add(areaKey2, handler4);

    const registryHanders1 = registryRef.current.get(areaKey1);
    const registryHanders2 = registryRef.current.get(areaKey2);

    expect(registryHanders1).toBeInstanceOf(Array);
    expect(registryHanders1).toHaveLength(2);
    expect(registryHanders1[0]).toEqual(handler1);
    expect(registryHanders1[1]).toEqual(handler2);

    expect(registryHanders2).toBeInstanceOf(Array);
    expect(registryHanders2).toHaveLength(2);
    expect(registryHanders2[0]).toEqual(handler3);
    expect(registryHanders2[1]).toEqual(handler4);
  });

  it('removes handlers successfully', () => {
    const { result: registryRef } = renderHook(() => useRegistry());

    const areaKey = 'area';
    const handler = jest.fn();

    const registeredHandlerKey = registryRef.current.add(areaKey, handler);

    let registryHandlers = registryRef.current.get(areaKey);

    expect(registryHandlers).toBeInstanceOf(Array);
    expect(registryHandlers).toHaveLength(1);
    expect(registryHandlers[0]).toEqual(handler);

    expect(registeredHandlerKey).toBeDefined();

    registryRef.current.remove(areaKey, registeredHandlerKey);

    registryHandlers = registryRef.current.get(areaKey);

    expect(registryHandlers).toBeInstanceOf(Array);
    expect(registryHandlers).toHaveLength(0);
  });

  it('clears all handlers successfully', () => {
    const { result: registryRef } = renderHook(() => useRegistry());

    const areaKey = 'area';
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    registryRef.current.add(areaKey, handler1);
    registryRef.current.add(areaKey, handler2);

    let registryHandlers = registryRef.current.get(areaKey);

    expect(registryHandlers).toBeInstanceOf(Array);
    expect(registryHandlers).toHaveLength(2);

    registryRef.current.clear(areaKey);

    registryHandlers = registryRef.current.get(areaKey);

    expect(registryHandlers).toBeInstanceOf(Array);
    expect(registryHandlers).toHaveLength(0);
  });

  it("doesn't rerender component after it's changing", () => {
    const registryRef = {} as TRegistry<TRegistryContent>;
    const effectFn = jest.fn();

    const TestComponent: FC = () => {
      const registry = useRegistry();

      Object.assign(registryRef, registry);

      useEffect(effectFn, [registry]);

      return null;
    };

    render(<TestComponent />);

    const areaKey = 'area';
    const handler = jest.fn();

    registryRef.add(areaKey, handler);

    let registryHandlers = registryRef.get(areaKey);

    expect(registryHandlers).toBeInstanceOf(Array);
    expect(registryHandlers).toHaveLength(1);

    registryRef.clear(areaKey);

    registryHandlers = registryRef.get(areaKey);

    expect(registryHandlers).toBeInstanceOf(Array);
    expect(registryHandlers).toHaveLength(0);
    expect(effectFn.mock.calls).toHaveLength(1);
  });
});
