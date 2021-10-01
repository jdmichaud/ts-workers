// rollup.config.js
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve';
import copy from 'rollup-plugin-copy'

export default {
  input: 'dev/parallel-tasks/main.ts',
  output: {
    name: 'Dev',
    file: 'dev/parallel-tasks/dist/main.js',
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
        { src: 'dev/parallel-tasks/index.html', dest: 'dev/parallel-tasks/dist/' },
      ]
    }),
    serve({
      contentBase: 'dev/parallel-tasks/dist',
      headers: {
        'Access-Control-Allow-Origin': '*',
        // For SharedArrayBuffer
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    }),
  ],
}
