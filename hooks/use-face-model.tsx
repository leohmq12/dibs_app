/**
 * Shared MobileFaceNet model — loaded lazily when needed.
 * This avoids crashing the app on startup if the model fails to load.
 */
import { Asset } from 'expo-asset';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { loadTensorflowModel, type TensorflowModel } from 'react-native-fast-tflite';

type FaceModelContextValue = {
  model: TensorflowModel | undefined;
  state: 'loading' | 'loaded' | 'error';
  error?: string;
};

const FaceModelContext = createContext<FaceModelContextValue>({
  model: undefined,
  state: 'loading',
});

export function FaceModelProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<FaceModelContextValue>({
    model: undefined,
    state: 'loading',
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      setValue({ model: undefined, state: 'error', error: 'Web not supported' });
      return;
    }

    let cancelled = false;

    const loadModel = async () => {
      try {
        const asset = Asset.fromModule(require('@/assets/models/mobilefacenet.tflite'));
        if (!asset.downloaded) {
          await asset.downloadAsync();
        }
        const uri = asset.localUri ?? asset.uri;
        if (!uri) {
          if (!cancelled) setValue({ model: undefined, state: 'error', error: 'Failed to resolve model asset' });
          return;
        }
        const model = await loadTensorflowModel({ url: uri });
        if (!cancelled) setValue({ model, state: 'loaded' });
      } catch (err) {
        if (!cancelled) setValue({ model: undefined, state: 'error', error: String(err) });
      }
    };

    loadModel();

    return () => { cancelled = true; };
  }, []);

  return <FaceModelContext.Provider value={value}>{children}</FaceModelContext.Provider>;
}

export function useFaceModel(): FaceModelContextValue {
  return useContext(FaceModelContext);
}