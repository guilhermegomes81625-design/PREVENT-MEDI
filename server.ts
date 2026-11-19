import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'attendants.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const DIST_DIR = path.resolve(__dirname, 'dist');

const PANEL_PASSWORD = process.env.PANEL_PASSWORD || 'Link12345678@';
const COOKIE_NAME = 'pm_panel_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const BR_PHONE_REGEX = /^55[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/;

export interface Attendant {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  clicks: number;
  todayClicks: number;
  lastClickDate: string | null;
  lastRoutedAt: string | null;
}

interface StoreData {
  attendants: Attendant[];
  cursor: number;
  version: number;
  updatedAt: string;
  totalClicks: number;
  lastResetAt: string | null;
}

interface SessionMap {
  [tokenHash: string]: number;
}

interface LoginAttempt {
  windowStart: number;
  attempts: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

function getSaoPauloDate(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a, 'utf8').digest();
  const hashB = crypto.createHash('sha256').update(b, 'utf8').digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function atomicWriteJson(filePath: string, data: unknown) {
  ensureDataDir();
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

function normalizePhone(raw: unknown): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

function sanitizeAttendant(raw: any, fallbackId?: string): Attendant {
  const id =
    typeof raw?.id === 'string' && /^[a-zA-Z0-9-]{1,64}$/.test(raw.id)
      ? raw.id
      : fallbackId || crypto.randomUUID();
  const name = String(raw?.name || 'Atendimento').trim().slice(0, 80) || 'Atendimento';
  const phone = normalizePhone(raw?.phone);
  const active = Boolean(raw?.active);
  const clicks = Number.isFinite(Number(raw?.clicks)) && Number(raw.clicks) >= 0 ? Math.floor(Number(raw.clicks)) : 0;
  const todayClicks =
    Number.isFinite(Number(raw?.todayClicks)) && Number(raw.todayClicks) >= 0
      ? Math.floor(Number(raw.todayClicks))
      : 0;
  const lastClickDate = typeof raw?.lastClickDate === 'string' ? raw.lastClickDate : null;
  const lastRoutedAt = typeof raw?.lastRoutedAt === 'string' ? raw.lastRoutedAt : null;

  return {
    id,
    name,
    phone,
    active,
    clicks,
    todayClicks,
    lastClickDate,
    lastRoutedAt,
  };
}

function loadStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.attendants)) {
        const attendants = parsed.attendants.map((a: any, i: number) => sanitizeAttendant(a, String(i + 1)));
        const computedTotal = attendants.reduce((sum: number, a: Attendant) => sum + a.clicks, 0);
        return {
          attendants,
          cursor: Number.isInteger(parsed.cursor) && parsed.cursor >= 0 ? parsed.cursor : 0,
          version: Number.isInteger(parsed.version) && parsed.version >= 1 ? parsed.version : 1,
          updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
          totalClicks:
            Number.isFinite(Number(parsed.totalClicks)) && Number(parsed.totalClicks) >= computedTotal
              ? Math.floor(Number(parsed.totalClicks))
              : computedTotal,
          lastResetAt: typeof parsed.lastResetAt === 'string' ? parsed.lastResetAt : null,
        };
      }
    }
  } catch (err) {
    console.error('Error reading attendants.json:', err);
  }

  const initial: StoreData = {
    attendants: [
      {
        id: '1',
        name: 'Atendimento Principal',
        phone: '5511966604328',
        active: true,
        clicks: 0,
        todayClicks: 0,
        lastClickDate: null,
        lastRoutedAt: null,
      },
    ],
    cursor: 0,
    version: 1,
    updatedAt: new Date().toISOString(),
    totalClicks: 0,
    lastResetAt: null,
  };
  try {
    atomicWriteJson(DATA_FILE, initial);
  } catch (err) {
    console.error('Error initializing attendants.json:', err);
  }
  return initial;
}

function saveStore(data: StoreData) {
  atomicWriteJson(DATA_FILE, data);
}

function loadSessions(): SessionMap {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      if (parsed && typeof parsed === 'object') {
        const now = Date.now();
        const valid: SessionMap = {};
        for (const [k, exp] of Object.entries(parsed)) {
          if (typeof exp === 'number' && exp > now) {
            valid[k] = exp;
          }
        }
        return valid;
      }
    }
  } catch {}
  return {};
}

function saveSessions(sessions: SessionMap) {
  try {
    atomicWriteJson(SESSIONS_FILE, sessions);
  } catch (err) {
    console.error('Error saving sessions:', err);
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (/^[a-f0-9]{64}$/.test(bearer)) return bearer;
  }
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[COOKIE_NAME];
  if (cookieToken && /^[a-f0-9]{64}$/.test(cookieToken)) {
    return cookieToken;
  }
  return null;
}

function isAuthenticated(req: Request): boolean {
  const token = extractToken(req);
  if (!token) return false;
  const sessions = loadSessions();
  const tokenHash = sha256(token);
  const expires = sessions[tokenHash];
  return typeof expires === 'number' && expires > Date.now();
}

function isHttpsRequest(req: Request): boolean {
  if (req.secure) return true;
  const proto = req.headers['x-forwarded-proto'];
  if (typeof proto === 'string' && proto.split(',')[0].trim() === 'https') return true;
  return false;
}

function setSessionCookie(req: Request, res: Response, value: string, maxAgeSeconds: number) {
  const https = isHttpsRequest(req);
  const attrs = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${maxAgeSeconds}`,
    https ? 'SameSite=None; Secure' : 'SameSite=Lax',
  ];
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function setNoCacheHeaders(res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function formatAdminPayload(store: StoreData) {
  const today = getSaoPauloDate();
  const attendants = store.attendants.map((a) => ({
    ...a,
    todayClicks: a.lastClickDate === today ? a.todayClicks : 0,
  }));
  const todayClicksTotal = attendants.reduce((sum, a) => sum + a.todayClicks, 0);
  const totalClientsRouted = attendants.reduce((sum, a) => sum + a.clicks, 0);

  return {
    attendants,
    version: store.version,
    updatedAt: store.updatedAt,
    totalClientsRouted,
    todayClicksTotal,
    lastResetAt: store.lastResetAt,
  };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '128kb' }));

  app.use('/api', (_req, res, next) => {
    setNoCacheHeaders(res);
    next();
  });

  // Public availability endpoint (synced by landing page)
  app.get('/api/availability', (_req, res) => {
    const store = loadStore();
    const active = store.attendants.filter((a) => a.active);
    res.json({
      phone: active[0]?.phone || null,
      activeCount: active.length,
      version: store.version,
    });
  });

  // Round-robin WhatsApp routing + exact per-contact client counter
  app.post('/api/route', (_req, res) => {
    const store = loadStore();
    const active = store.attendants.filter((a) => a.active);
    if (!active.length) {
      res.status(503).json({ error: 'Nenhum atendente disponível no momento. Tente novamente mais tarde.' });
      return;
    }

    const assigned = active[store.cursor % active.length];
    store.cursor += 1;

    const today = getSaoPauloDate();
    const targetIndex = store.attendants.findIndex((a) => a.id === assigned.id);
    if (targetIndex !== -1) {
      const target = store.attendants[targetIndex];
      const currentToday = target.lastClickDate === today ? target.todayClicks : 0;
      store.attendants[targetIndex] = {
        ...target,
        clicks: (target.clicks || 0) + 1,
        todayClicks: currentToday + 1,
        lastClickDate: today,
        lastRoutedAt: new Date().toISOString(),
      };
    }
    store.totalClicks = (store.totalClicks || 0) + 1;
    saveStore(store);

    res.json({
      phone: assigned.phone,
      attendantId: assigned.id,
      attendantName: assigned.name,
    });
  });

  // Session check
  app.get('/api/session', (req, res) => {
    res.json({ authenticated: isAuthenticated(req) });
  });

  // Login
  app.post('/api/session', (req, res) => {
    const ipKey = sha256(String(req.ip || req.socket.remoteAddress || 'unknown'));
    const now = Date.now();
    const windowStart = Math.floor(now / 900_000) * 900_000;
    const prev = loginAttempts.get(ipKey);
    const currentAttempts = prev && prev.windowStart === windowStart ? prev.attempts + 1 : 1;
    loginAttempts.set(ipKey, { windowStart, attempts: currentAttempts });

    if (currentAttempts > 12) {
      res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' });
      return;
    }

    const password = req.body?.password;
    if (typeof password !== 'string' || password.length > 128 || !safeEqual(password, PANEL_PASSWORD)) {
      res.status(401).json({ error: 'Senha incorreta.' });
      return;
    }

    loginAttempts.delete(ipKey);
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256(token);
    const sessions = loadSessions();
    sessions[tokenHash] = now + SESSION_TTL_MS;
    saveSessions(sessions);

    setSessionCookie(req, res, token, Math.floor(SESSION_TTL_MS / 1000));
    res.json({ authenticated: true, token });
  });

  // Logout
  app.delete('/api/session', (req, res) => {
    const token = extractToken(req);
    if (token) {
      const sessions = loadSessions();
      delete sessions[sha256(token)];
      saveSessions(sessions);
    }
    setSessionCookie(req, res, '', 0);
    res.json({ authenticated: false });
  });

  // Protected admin GET
  app.get('/api/admin', (req, res) => {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Entre no painel para continuar.' });
      return;
    }
    const store = loadStore();
    res.json(formatAdminPayload(store));
  });

  // Protected admin PUT (save numbers, names, order, active state)
  app.put('/api/admin', (req, res) => {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Entre no painel para continuar.' });
      return;
    }

    const incoming = req.body?.attendants;
    if (!Array.isArray(incoming) || incoming.length > 100) {
      res.status(400).json({ error: 'Lista inválida. Limite de 100 atendentes.' });
      return;
    }

    const store = loadStore();
    if (Number.isInteger(req.body?.version) && req.body.version !== store.version) {
      res.status(409).json({ error: 'Outra sessão alterou a lista. Recarregue o painel antes de salvar.' });
      return;
    }

    const existingById = new Map(store.attendants.map((a) => [a.id, a]));
    const seenIds = new Set<string>();
    const seenPhones = new Set<string>();
    const nextAttendants: Attendant[] = [];

    for (const item of incoming) {
      const id = typeof item?.id === 'string' ? item.id.trim() : '';
      const name = typeof item?.name === 'string' ? item.name.trim() : '';
      const phone = normalizePhone(item?.phone);
      const active = typeof item?.active === 'boolean' ? item.active : true;

      if (!id || !/^[a-zA-Z0-9-]{1,64}$/.test(id)) {
        res.status(400).json({ error: 'Identificador de atendente inválido.' });
        return;
      }
      if (!name || name.length > 80) {
        res.status(400).json({ error: 'Informe um nome válido (até 80 caracteres) para cada atendente.' });
        return;
      }
      if (!BR_PHONE_REGEX.test(phone)) {
        res.status(400).json({
          error: `Número inválido para "${name}". Informe 55 + DDD + número (ex.: 5511966604328).`,
        });
        return;
      }
      if (seenIds.has(id)) {
        res.status(400).json({ error: 'Há atendentes duplicados na lista.' });
        return;
      }
      if (seenPhones.has(phone)) {
        res.status(400).json({ error: `O número ${phone} está repetido. Não repita números.` });
        return;
      }

      seenIds.add(id);
      seenPhones.add(phone);

      const previous = existingById.get(id);
      nextAttendants.push({
        id,
        name,
        phone,
        active,
        clicks: previous ? previous.clicks : 0,
        todayClicks: previous ? previous.todayClicks : 0,
        lastClickDate: previous ? previous.lastClickDate : null,
        lastRoutedAt: previous ? previous.lastRoutedAt : null,
      });
    }

    store.attendants = nextAttendants;
    store.version += 1;
    store.updatedAt = new Date().toISOString();
    saveStore(store);

    res.json(formatAdminPayload(store));
  });

  // Protected admin reset stats
  app.post('/api/admin/reset-stats', (req, res) => {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Entre no painel para continuar.' });
      return;
    }

    const store = loadStore();
    store.attendants = store.attendants.map((a) => ({
      ...a,
      clicks: 0,
      todayClicks: 0,
      lastClickDate: null,
      lastRoutedAt: null,
    }));
    store.totalClicks = 0;
    store.cursor = 0;
    store.lastResetAt = new Date().toISOString();
    store.version += 1;
    store.updatedAt = new Date().toISOString();
    saveStore(store);

    res.json(formatAdminPayload(store));
  });

  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
      app.use(express.static(DIST_DIR));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(DIST_DIR, 'index.html'));
      });
    } else {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
