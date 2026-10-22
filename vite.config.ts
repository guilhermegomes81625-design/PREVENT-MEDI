import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function apiDevServerPlugin(): Plugin {
  let attendants = [
    { id: '1', name: 'Atendimento Principal', phone: '5511965589793', active: true }
  ];
  let version = 1;
  let updatedAt = new Date().toISOString();
  let cursor = 0;
  let authenticated = false;

  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();

        const url = new URL(req.url, 'http://localhost:3000');
        const sendJson = (data: any, status = 200) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(data));
        };

        if (url.pathname === '/api/availability' && req.method === 'GET') {
          const active = attendants.filter(a => a.active);
          return sendJson({ phone: active[0]?.phone || null, activeCount: active.length, version });
        }

        if (url.pathname === '/api/session' && req.method === 'GET') {
          return sendJson({ authenticated });
        }

        if (url.pathname === '/api/session' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            authenticated = true;
            return sendJson({ authenticated: true });
          });
          return;
        }

        if (url.pathname === '/api/session' && req.method === 'DELETE') {
          authenticated = false;
          return sendJson({ authenticated: false });
        }

        if (url.pathname === '/api/admin' && req.method === 'GET') {
          return sendJson({ attendants, version, updatedAt });
        }

        if (url.pathname === '/api/admin' && req.method === 'PUT') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (Array.isArray(data.attendants)) {
                attendants = data.attendants;
                version += 1;
                updatedAt = new Date().toISOString();
              }
              return sendJson({ attendants, version, updatedAt });
            } catch {
              return sendJson({ error: 'Formato inválido.' }, 400);
            }
          });
          return;
        }

        if (url.pathname === '/api/route' && req.method === 'POST') {
          const active = attendants.filter(a => a.active);
          if (!active.length) return sendJson({ error: 'Nenhum atendente disponível no momento.' }, 503);
          const assigned = active[cursor % active.length];
          cursor++;
          return sendJson({ phone: assigned.phone });
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
