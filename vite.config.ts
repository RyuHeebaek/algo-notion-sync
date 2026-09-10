import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'extension/src/popup/popup.html'),
        background: resolve(__dirname, 'extension/src/background/index.ts'),
        content: resolve(__dirname, 'extension/src/content/index.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'src/background/index.js';
          if (chunkInfo.name === 'content') return 'src/content/index.js';
          if (chunkInfo.name === 'popup') return 'src/popup/popup.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  publicDir: 'extension/public',
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        const manifestSrc = resolve(__dirname, 'extension/manifest.json');
        const manifestDest = resolve(__dirname, 'dist/manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestSrc, 'utf-8'));
        
        // Adjust paths for built bundle in dist/
        manifest.background.service_worker = 'src/background/index.js';
        manifest.content_scripts[0].js = ['src/content/index.js'];
        manifest.action.default_popup = 'extension/src/popup/popup.html';
        
        fs.writeFileSync(manifestDest, JSON.stringify(manifest, null, 2));
      }
    }
  ]
});
