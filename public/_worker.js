const cookieName = "__Host-prevent_panel";
const headers = { "Cache-Control": "no-store, max-age=0", "Content-Type": "application/json; charset=utf-8", "X-Content-Type-Options": "nosniff" };
const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });
const hash = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((b) => b.toString(16).padStart(2, "0")).join("");
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, "0")).join("");
const cookie = (value, age) => `${cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const equal = (a, b) => {
  let result = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return result === 0;
};
async function authenticated(request, db) {
  const value = request.headers.get("Cookie")?.split(";").map((s) => s.trim()).find((s) => s.startsWith(cookieName + "="))?.slice(cookieName.length + 1);
  if (!value || !/^[a-f0-9]{64}$/.test(value)) return false;
  return !!await db.prepare("SELECT token_hash FROM sessions WHERE token_hash=? AND expires>?").bind(await hash(value), Date.now()).first();
}
async function onRequest({ request, env }) {
  const url = new URL(request.url), path = url.pathname.replace(/\/+$/, ""), db = env.PANEL_DB;
  if (!db) return json({ error: "Servi\xE7o de atendimento temporariamente indispon\xEDvel." }, 503);
  if (!["GET", "POST", "PUT", "DELETE"].includes(request.method)) return json({ error: "M\xE9todo n\xE3o permitido." }, 405);
  if (request.method !== "GET" && request.headers.get("Origin") !== url.origin) return json({ error: "Origem inv\xE1lida." }, 403);
  try {
    if (path === "/api/availability" && request.method === "GET") {
      const row = await db.prepare("SELECT attendants, version FROM settings WHERE id=1").first();
      const active = JSON.parse(row.attendants).filter((a) => a.active);
      return json({ phone: active[0]?.phone || null, activeCount: active.length, version: row.version });
    }
    if (path === "/api/route" && request.method === "POST") {
      const row = await db.prepare("UPDATE settings SET cursor=cursor+1 WHERE id=1 RETURNING attendants, cursor").first();
      const active = JSON.parse(row.attendants).filter((a) => a.active);
      if (!active.length) return json({ error: "Nenhum atendente dispon\xEDvel no momento. Tente novamente mais tarde." }, 503);
      return json({ phone: active[(row.cursor - 1) % active.length].phone });
    }
    if (path === "/api/session" && request.method === "GET") return json({ authenticated: await authenticated(request, db) });
    if (path === "/api/session" && request.method === "POST") {
      if (Number(request.headers.get("Content-Length") || 0) > 2048) return json({ error: "Requisi\xE7\xE3o inv\xE1lida." }, 413);
      const ip = await hash(request.headers.get("CF-Connecting-IP") || "unknown");
      const now = Date.now(), windowStart = Math.floor(now / 9e5) * 9e5;
      const attempt = await db.prepare("INSERT INTO login_attempts (ip, window_start, attempts) VALUES (?, ?, 1) ON CONFLICT(ip) DO UPDATE SET attempts=CASE WHEN window_start=excluded.window_start THEN attempts+1 ELSE 1 END, window_start=excluded.window_start RETURNING attempts").bind(ip, windowStart).first();
      if (attempt.attempts > 8) return json({ error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." }, 429, { "Retry-After": "900" });
      const body = await request.json();
      const row = await db.prepare("SELECT password_salt, password_hash FROM settings WHERE id=1").first();
      if (typeof body.password !== "string" || body.password.length > 128 || !equal(await hash(row.password_salt + ":" + body.password), row.password_hash)) return json({ error: "Senha incorreta." }, 401);
      const value = token();
      await db.batch([
        db.prepare("DELETE FROM sessions WHERE expires < ?").bind(now),
        db.prepare("DELETE FROM login_attempts WHERE window_start < ? OR ip=?").bind(windowStart - 9e5, ip),
        db.prepare("INSERT INTO sessions (token_hash, expires) VALUES (?, ?)").bind(await hash(value), now + 288e5)
      ]);
      return json({ authenticated: true }, 200, { "Set-Cookie": cookie(value, 28800) });
    }
    if (path === "/api/session" && request.method === "DELETE") {
      const value = request.headers.get("Cookie")?.split(";").map((s) => s.trim()).find((s) => s.startsWith(cookieName + "="))?.slice(cookieName.length + 1);
      if (value) await db.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await hash(value)).run();
      return json({ authenticated: false }, 200, { "Set-Cookie": cookie("", 0) });
    }
    if (path === "/api/admin") {
      if (!await authenticated(request, db)) return json({ error: "Entre no painel para continuar." }, 401);
      if (request.method === "GET") {
        const row = await db.prepare("SELECT attendants, version, updated_at FROM settings WHERE id=1").first();
        return json({ attendants: JSON.parse(row.attendants), version: row.version, updatedAt: row.updated_at });
      }
      if (request.method === "PUT") {
        const raw = await request.text();
        if (raw.length > 64e3) return json({ error: "Lista muito grande." }, 413);
        const body = JSON.parse(raw);
        if (!Array.isArray(body.attendants) || body.attendants.length > 100 || !Number.isInteger(body.version)) return json({ error: "Lista inv\xE1lida. Limite de 100 atendentes." }, 400);
        const ids = /* @__PURE__ */ new Set(), phones = /* @__PURE__ */ new Set();
        const attendants = [];
        for (const item of body.attendants) {
          const phone = String(item.phone || "").replace(/\D/g, ""), name = String(item.name || "").trim();
          if (!name || name.length > 80 || !/^55[1-9]{2}9\d{8}$/.test(phone) || typeof item.active !== "boolean" || typeof item.id !== "string" || !/^[a-zA-Z0-9-]{1,64}$/.test(item.id) || ids.has(item.id) || phones.has(phone)) return json({ error: "Informe nome e WhatsApp brasileiro com 55 + DDD + n\xFAmero. N\xE3o repita n\xFAmeros." }, 400);
          ids.add(item.id);
          phones.add(phone);
          attendants.push({ id: item.id, name, phone, active: item.active });
        }
        const row = await db.prepare("UPDATE settings SET attendants=?, version=version+1, updated_at=? WHERE id=1 AND version=? RETURNING version, updated_at").bind(JSON.stringify(attendants), (/* @__PURE__ */ new Date()).toISOString(), body.version).first();
        if (!row) return json({ error: "Outra sess\xE3o alterou a lista. Recarregue o painel antes de salvar." }, 409);
        return json({ attendants, version: row.version, updatedAt: row.updated_at });
      }
    }
    return json({ error: "N\xE3o encontrado." }, 404);
  } catch {
    return json({ error: "N\xE3o foi poss\xEDvel concluir. Tente novamente." }, 500);
  }
}
export {
  onRequest
};
export default {
  fetch(request, env) {
    if (new URL(request.url).pathname.startsWith('/api/')) return onRequest({ request, env });
    return env.ASSETS.fetch(request);
  }
};
