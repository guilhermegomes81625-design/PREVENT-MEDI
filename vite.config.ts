import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const DATA_FILE = path.resolve(__dirname, 'data/attendants.json');

function loadAttendants() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.attendants) && parsed.attendants.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading attendants.json:', err);
  }
  const initial = {
    attendants: [
      { id: '1', name: 'Atendimento Principal', phone: '5511966604328', active: true }
    ],
    version: 1,
    updatedAt: new Date().toISOString()
  };
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  } catch {}
  return initial;
}

function saveAttendants(data: { attendants: any[]; version: number; updatedAt: string }) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving attendants.json:', err);
  }
}

function apiDevServerPlugin(): Plugin {
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
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          res.end(JSON.stringify(data));
        };

        if (url.pathname === '/api/availability' && req.method === 'GET') {
          const currentData = loadAttendants();
          const active = currentData.attendants.filter((a: any) => a.active);
          return sendJson({
            phone: active[0]?.phone || null,
            activeCount: active.length,
            version: currentData.version
          });
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
          const currentData = loadAttendants();
          return sendJson(currentData);
        }

        if (url.pathname === '/api/admin' && req.method === 'PUT') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (Array.isArray(data.attendants)) {
                const currentData = loadAttendants();
                const newVersion = (currentData.version || 0) + 1;
                const newUpdatedAt = new Date().toISOString();
                const updated = {
                  attendants: data.attendants,
                  version: newVersion,
                  updatedAt: newUpdatedAt
                };
                saveAttendants(updated);
                return sendJson(updated);
              }
              return sendJson({ error: 'Formato inválido.' }, 400);
            } catch {
              return sendJson({ error: 'Formato inválido.' }, 400);
            }
          });
          return;
        }

        if (url.pathname === '/api/route' && req.method === 'POST') {
          const currentData = loadAttendants();
          const active = currentData.attendants.filter((a: any) => a.active);
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
