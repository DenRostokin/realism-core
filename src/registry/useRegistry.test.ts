import { renderHook } from '@testing-library/react';

import { useRegistry } from './useRegistry';

describe('Registry', () => {
  it('is cteated successfully', async () => {
    const { result: registryRef } = renderHook(() => useRegistry());

    expect(registryRef.current).toHaveProperty('add');
    expect(registryRef.current).toHaveProperty('remove');
    expect(registryRef.current).toHaveProperty('get');
    expect(registryRef.current).toHaveProperty('clear');
  });
});

describe('Registry subscriber', () => {

});

describe('Registry emitter', () => {

});
