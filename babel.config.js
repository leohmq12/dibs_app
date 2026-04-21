module.exports = function (api) {
  api.cache(true);
  const isProduction = process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production';
  return {
    presets: ['babel-preset-expo'],
    // worklets-core/plugin is required by vision-camera's frame processors.
    // reanimated's worklet plugin is already included via babel-preset-expo.
    plugins: [
      'react-native-worklets-core/plugin',
      ...(isProduction ? ['transform-remove-console'] : []),
    ],
  };
};
