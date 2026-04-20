# Face recognition model

Place `mobilefacenet.tflite` in this directory.

**Requirements:**
- Input shape: `[1, 112, 112, 3]` (RGB)
- Input normalization: `[-1, 1]` (i.e. `(pixel - 127.5) / 127.5`)
- Output: 192-d face embedding (L2-normalized at inference time by our code)

**Recommended source:** the MobileFaceNet TFLite model from
`https://github.com/shaqian/tflite-react-native/raw/master/example/android/app/src/main/assets/mobilefacenet.tflite`
or the one in the `react-native-fast-tflite` examples repo.

After dropping the file here, rebuild the dev client with `eas build --profile development --platform android`.
