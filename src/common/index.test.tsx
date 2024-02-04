import { renderHook } from '@testing-library/react';

import { useFirstRender } from './useFirstRender';

describe('UseFirstRender', () => {
  it('works successfully', () => {
    const { result: isFirstRenderRef, rerender } = renderHook(() =>
      useFirstRender()
    );

    expect(isFirstRenderRef.current.current).toBe(true);

    rerender();

    expect(isFirstRenderRef.current.current).toBe(false);
  });
});
