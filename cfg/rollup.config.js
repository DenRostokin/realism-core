import { dts } from 'rollup-plugin-dts';

const dtsConfig = {
  external: ['react', 'react-dom'],
  input: 'src/index.ts',
  output: {
    file: 'dist/index.d.ts',
    format: 'esm',
  },
  plugins: [
    dts({
      respectExternal: true,
      tsconfig: 'tsconfig.json',
    }),
  ],
};

export default [dtsConfig];
