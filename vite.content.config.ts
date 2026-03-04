import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't clear dist, as it contains the main app
    lib: {
      entry: path.resolve(__dirname, 'src/content/main.tsx'),
      name: 'ContentScript',
      fileName: () => 'content.js',
      formats: ['iife'], // Content scripts should be IIFE to avoid variable collisions
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
});
