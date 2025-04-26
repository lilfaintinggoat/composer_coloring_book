
import { useState, useCallback } from 'react';

interface ZoomPanState {
  scale: number;
  translateX: number;
  translateY: number;
}

export const useZoomPan = (initialScale = 1) => {
  const [zoomState, setZoomState] = useState<ZoomPanState>({
    scale: initialScale,
    translateX: 0,
    translateY: 0,
  });

  const zoom = useCallback((delta: number) => {
    setZoomState(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(prev.scale + delta, 3))
    }));
  }, []);

  const pan = useCallback((deltaX: number, deltaY: number) => {
    setZoomState(prev => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY
    }));
  }, []);

  const reset = useCallback(() => {
    setZoomState({
      scale: initialScale,
      translateX: 0,
      translateY: 0
    });
  }, [initialScale]);

  return {
    zoomState,
    zoom,
    pan,
    reset
  };
};
