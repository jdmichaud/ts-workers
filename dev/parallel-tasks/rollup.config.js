// rollup.config.js
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve';
import copy from 'rollup-plugin-copy'
import * as fs from 'fs';

// Boiler plate to check certificate files and activate https if present.
const serverKeyPath = `${process.env.HOME}/.local/share/ssl/certs/server.key`;
const serverCertPath = `${process.env.HOME}/.local/share/ssl/certs/server.crt`;
const caPath = `${process.env.HOME}/.local/share/ssl/certs/ca.pem`;

const serverKey = fs.existsSync(serverKeyPath) || (console.log(`no server.key in ${serverKeyPath}`), false);
const serverCert = fs.existsSync(serverCertPath) || (console.log(`no server.cert in ${serverCertPath}`), false);
const ca = fs.existsSync(caPath) || (console.log(`no ca in ${caPath}`), false);

const https = (serverKey && serverCert && ca) ? {
  key: fs.readFileSync(serverKeyPath),
  cert: fs.readFileSync(serverCertPath),
  ca: fs.readFileSync(caPath)
} : (console.log('https disabled'), undefined);

export default {
  input: 'dev/parallel-tasks/main.ts',
  output: {
    name: 'Dev',
    file: 'dev/parallel-tasks/dist/main.js',
    format: 'umd',
    sourcemap: true,
  },
  watch: {
    clearScreen: false,
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
      https,
    }),
  ],
}
