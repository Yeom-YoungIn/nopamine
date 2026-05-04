module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
          '@screens': './src/screens',
          '@modules': './src/modules',
          '@store': './src/store',
          '@constants': './src/constants',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@theme': './src/theme',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
