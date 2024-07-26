import { FC, PropsWithChildren, useContext, useEffect } from 'react';
import { renderHook, render } from '@testing-library/react';

import { useEmitter, TEmitter, createEmitterContext } from './useEmitter';
import { TRegistryContent } from 'registry';

describe('Emitter', () => {
  it('is created successfully', () => {
    const { result: emitterRef } = renderHook(() => useEmitter());

    expect(emitterRef.current).toHaveProperty('subscribe');
    expect(emitterRef.current).toHaveProperty('useRenderingSubscription');
    expect(emitterRef.current).toHaveProperty('emit');
  });

  it('has a correct default context', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn);
    const { CONTEXT_VALUE: DEFAULT_EMITTER_CONTEXT } = createEmitterContext();

    expect(DEFAULT_EMITTER_CONTEXT).toHaveProperty('subscribe');
    expect(DEFAULT_EMITTER_CONTEXT).toHaveProperty('useRenderingSubscription');
    expect(DEFAULT_EMITTER_CONTEXT).toHaveProperty('emit');

    const eventName = 'event';
    const handler = jest.fn();

    const unsubscribe = DEFAULT_EMITTER_CONTEXT.subscribe(eventName, handler);

    expect(typeof consoleSpy.mock.calls[0][0]).toBe('string');
    expect(unsubscribe).toBeInstanceOf(Function);

    DEFAULT_EMITTER_CONTEXT.emit(eventName);

    expect(typeof consoleSpy.mock.calls[1][0]).toBe('string');

    renderHook(() => {
      DEFAULT_EMITTER_CONTEXT.useRenderingSubscription(eventName, handler);
    });

    expect(typeof consoleSpy.mock.calls[2][0]).toBe('string');
  });

  it('passes context correctly', () => {
    const emitterRef = {} as TEmitter<TRegistryContent>;
    const { Context: EmitterContext } =
      createEmitterContext<TRegistryContent>();

    const EmitterProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
      const emitter = useEmitter();

      return (
        <EmitterContext.Provider value={emitter}>
          {children}
        </EmitterContext.Provider>
      );
    };

    const EmitterConsumer: FC = () => {
      const emitter = useContext(EmitterContext);

      Object.assign(emitterRef, emitter);

      return null;
    };

    render(
      <EmitterProvider>
        <EmitterConsumer />
      </EmitterProvider>
    );

    expect(emitterRef).toHaveProperty('subscribe');
    expect(emitterRef).toHaveProperty('useRenderingSubscription');
    expect(emitterRef).toHaveProperty('emit');
  });

  it('subscribes and emits single handler without any arguments successfully', () => {
    const { result: emitterRef } = renderHook(() => useEmitter());

    const eventName = 'callHandler';
    const handler = jest.fn();

    emitterRef.current.subscribe(eventName, handler);
    emitterRef.current.emit(eventName);

    // single call without any parameters
    expect(handler.mock.calls).toHaveLength(1);
    expect(handler.mock.calls[0]).toHaveLength(0);
  });

  it('subscribes and emits multiple handlers without any arguments successfully', () => {
    const { result: emitterRef } = renderHook(() => useEmitter());

    const eventName = 'callHandlers';
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    emitterRef.current.subscribe(eventName, handler1);
    emitterRef.current.subscribe(eventName, handler2);
    emitterRef.current.emit(eventName);

    expect(handler1.mock.calls).toHaveLength(1);
    expect(handler1.mock.calls[0]).toHaveLength(0);
    expect(handler2.mock.calls).toHaveLength(1);
    expect(handler2.mock.calls[0]).toHaveLength(0);
  });

  it('subscribes and emits single handler with multiple arguments successfully', () => {
    const { result: emitterRef } = renderHook(() => useEmitter());

    const eventName = 'callHandler';
    const handler = jest.fn();

    emitterRef.current.subscribe(eventName, handler);
    emitterRef.current.emit(eventName, 'value1', 'value2');

    expect(handler.mock.calls).toHaveLength(1);
    expect(handler.mock.calls[0]).toHaveLength(2);
    expect(handler.mock.calls[0][0]).toEqual('value1');
    expect(handler.mock.calls[0][1]).toEqual('value2');
  });

  it('subscribes and emits multiple handlers with multiple arguments successfully', () => {
    const { result: emitterRef } = renderHook(() => useEmitter());

    const eventName = 'callHandlers';
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    emitterRef.current.subscribe(eventName, handler1);
    emitterRef.current.subscribe(eventName, handler2);
    emitterRef.current.emit(eventName, 'value1', 'value2');

    expect(handler1.mock.calls).toHaveLength(1);
    expect(handler1.mock.calls[0]).toHaveLength(2);
    expect(handler1.mock.calls[0][0]).toEqual('value1');
    expect(handler1.mock.calls[0][1]).toEqual('value2');
    expect(handler2.mock.calls).toHaveLength(1);
    expect(handler2.mock.calls[0]).toHaveLength(2);
    expect(handler2.mock.calls[0][0]).toEqual('value1');
    expect(handler2.mock.calls[0][1]).toEqual('value2');
  });

  it('subscribes and emits with "useRenderingSubscription" successfully', () => {
    const { result: emitterRef } = renderHook(() => useEmitter());

    const eventName = 'callHandler';
    const handler = jest.fn();

    renderHook(() =>
      emitterRef.current.useRenderingSubscription(eventName, handler)
    );

    emitterRef.current.emit(eventName, 'value');

    expect(handler.mock.calls).toHaveLength(1);
    expect(handler.mock.calls[0]).toHaveLength(1);
    expect(handler.mock.calls[0][0]).toEqual('value');
  });

  it('unsubscribes single handler successfully', () => {
    const { result: emitterRef } = renderHook(() => useEmitter());

    const eventName = 'callHandlers';
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    const unsubscribeHandler1 = emitterRef.current.subscribe(
      eventName,
      handler1
    );

    emitterRef.current.subscribe(eventName, handler2);

    unsubscribeHandler1();

    emitterRef.current.emit(eventName);

    expect(handler1.mock.calls).toHaveLength(0);
    expect(handler2.mock.calls).toHaveLength(1);
  });

  it('unsubscribes single handler wich was subscrigbed with "useRenderingSubscription" successfully', () => {
    const { result: emitterRef } = renderHook(() => useEmitter());

    const eventName = 'callHandlers';
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    const { unmount: unmountSubscription1 } = renderHook(() =>
      emitterRef.current.useRenderingSubscription(eventName, handler1)
    );

    renderHook(() =>
      emitterRef.current.useRenderingSubscription(eventName, handler2)
    );

    // unsubscribe the handler during unmounting
    unmountSubscription1();

    emitterRef.current.emit(eventName);

    expect(handler1.mock.calls).toHaveLength(0);
    expect(handler2.mock.calls).toHaveLength(1);
  });

  it("doesn't rerender component after it's changing", () => {
    const emitterRef = {} as TEmitter<TRegistryContent>;
    const effectFn = jest.fn();

    const TestComponent: FC = () => {
      const emitter = useEmitter();

      Object.assign(emitterRef, emitter);

      useEffect(effectFn, [emitter]);

      return null;
    };

    render(<TestComponent />);

    const eventName = 'callHandler';
    const handler = jest.fn();

    const unsubscribe = emitterRef.subscribe(eventName, handler);
    emitterRef.emit(eventName);

    unsubscribe();

    expect(handler.mock.calls).toHaveLength(1);
    expect(effectFn.mock.calls).toHaveLength(1);
  });
});
