import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'save-products-json',
      configureServer(server) {
        server.middlewares.use('/api/save-products', (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const apiDir = path.resolve('./src/api');
                if (!fs.existsSync(apiDir)) {
                  fs.mkdirSync(apiDir, { recursive: true });
                }
                fs.writeFileSync(path.join(apiDir, 'digiflazzProduct.json'), body);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          }
        });
      }
    }
  ],
  server: {
    // Tambahkan bagian ini kalau real-time update macet
    watch: {
      usePolling: true,
    },
    // Opsional: memaksa port tetap di 5173 agar tidak pindah-pindah
    strictPort: true,
    proxy: {
      "/api/pembayaran": "http://localhost:5000",
      "/webhook/pakkasir": "http://localhost:5173", // Actually webhook should probably be hit directly or proxied
      "/api/digiflazz": {
        target: 'https://api.digiflazz.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/digiflazz/, '')
      }
    }
  },
})