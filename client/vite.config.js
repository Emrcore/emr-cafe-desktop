import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    cors: true,
    origin: 'http://lastsummer.emrcore.com.tr',
    allowedHosts: ['.emrcore.com.tr']
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/, // ? js, jsx, ts, tsx dosyalarýný kapsar
    exclude: []
  }
});
