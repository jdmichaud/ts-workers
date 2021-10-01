// rollup.config.js
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve';
import copy from 'rollup-plugin-copy'

export default {
  input: 'dev/canvas-processing/main.ts',
  output: {
    name: 'Dev',
    file: 'dev/canvas-processing/dist/main.js',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    sourcemaps(),
    typescript(),
    copy({
      targets: [
        { src: 'dev/canvas-processing/index.html', dest: 'dev/canvas-processing/dist/' },
      ]
    }),
    serve({
      contentBase: 'dev/canvas-processing/dist',
      headers: {
        'Access-Control-Allow-Origin': '*',
        // For SharedArrayBuffer
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    }),
  ],
}
