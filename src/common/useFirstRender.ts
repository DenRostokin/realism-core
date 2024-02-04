// the next dependency is needed for the correct type declarations denerating. DO NOT REMOVE IT!
// eslint-disable-next-line
import { useRef, useEffect, MutableRefObject } from 'react';

export const useFirstRender = () => {
  const firstRender = useRef(true);

  useEffect(() => () => {
    if (firstRender.current) {
      firstRender.current = false;
    }
  });

  return firstRender;
};
