import { renderHook, act } from '@testing-library/react';

import { useRequest } from './useRequest';

const successfullRequest = async (
  name?: string
): Promise<string | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(name);
    }, 500);
  });
};

const failureRequest = () => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error());
    }, 500);
  });
};

describe('UseRequest', () => {
  it('returns correct value', () => {
    const { result: requestRef } = renderHook(() =>
      useRequest(successfullRequest)
    );

    expect(requestRef.current).toHaveProperty('initialized');
    expect(requestRef.current).toHaveProperty('loading');
    expect(requestRef.current).toHaveProperty('data');
    expect(requestRef.current).toHaveProperty('error');
    expect(requestRef.current).toHaveProperty('request');
    expect(requestRef.current).toHaveProperty('clearError');

    expect(requestRef.current.initialized).toBeFalsy();
    expect(requestRef.current.loading).toBeFalsy();
    expect(requestRef.current.data).toBeNull();
    expect(requestRef.current.error).toBeNull();
    expect(requestRef.current.clearError).toBeInstanceOf(Function);
    expect(requestRef.current.request).toBeInstanceOf(Function);
  });

  it('sets loading flags and data correctly', async () => {
    const { result: requestRef } = renderHook(() =>
      useRequest(successfullRequest)
    );

    expect(requestRef.current.initialized).toBeFalsy();
    expect(requestRef.current.loading).toBeFalsy();
    expect(requestRef.current.data).toBeNull();
    expect(requestRef.current.error).toBeNull();

    let response = null;

    await act(async () => {
      response = await requestRef.current.request('John');
    });

    expect(requestRef.current.initialized).toBeTruthy();
    expect(requestRef.current.loading).toBeFalsy();
    expect(requestRef.current.data).toEqual('John');
    expect(requestRef.current.error).toBeNull();
    expect(response).toEqual('John');
  });

  it('sets loading flags and error correctly', async () => {
    const { result: requestRef } = renderHook(() => useRequest(failureRequest));

    await act(async () => {
      await requestRef.current.request();
    });

    expect(requestRef.current.initialized).toBeTruthy();
    expect(requestRef.current.loading).toBeFalsy();
    expect(requestRef.current.data).toBeNull();
    expect(requestRef.current.error).toBeInstanceOf(Error);
  });

  it('clears error correctly', async () => {
    const { result: requestRef } = renderHook(() => useRequest(failureRequest));

    await act(async () => {
      await requestRef.current.request();
    });

    expect(requestRef.current.initialized).toBeTruthy();
    expect(requestRef.current.loading).toBeFalsy();
    expect(requestRef.current.data).toBeNull();
    expect(requestRef.current.error).toBeInstanceOf(Error);

    act(() => {
      requestRef.current.clearError();
    });

    expect(requestRef.current.initialized).toBeTruthy();
    expect(requestRef.current.loading).toBeFalsy();
    expect(requestRef.current.data).toBeNull();
    expect(requestRef.current.error).toBeNull();
  });

  it('sets empty data correctly', async () => {
    const { result: requestRef } = renderHook(() =>
      useRequest(successfullRequest)
    );

    await act(async () => {
      await requestRef.current.request();
    });

    expect(requestRef.current.initialized).toBeTruthy();
    expect(requestRef.current.loading).toBeFalsy();
    expect(requestRef.current.data).toBeNull();
    expect(requestRef.current.error).toBeNull();
  });
});
