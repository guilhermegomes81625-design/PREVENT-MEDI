import { useEffect, useRef, useState } from 'react';
import type React from 'react';
export function useWhatsAppRouting() {
  const [phone, setPhone] = useState<string | null>('5511966604328');
  const [routingNotice, setNotice] = useState('');
  const busy = useRef(false);
  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const response = await fetch('/api/availability', { cache: 'no-store' });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (alive) setPhone(data.phone);
      } catch { /* Clicks still consult the server and never use an offline fallback. */ }
    };
    void refresh(); const timer = setInterval(refresh, 15000);
    const visible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener('visibilitychange', visible);
    return () => { alive = false; clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, []);
  useEffect(() => { if (!routingNotice) return; const timer = setTimeout(() => setNotice(''), 7000); return () => clearTimeout(timer); }, [routingNotice]);
  const buildWhatsAppUrl = (message: string) => phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : undefined;
  const contactLabel = phone ? `WhatsApp: +${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}` : 'Atendimento temporariamente indisponível';
  async function routeWhatsApp(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest<HTMLAnchorElement>('a[href]');
    if (!link || !event.currentTarget.contains(link) || new URL(link.href).hostname !== 'wa.me') return;
    if (event.button !== 0 && event.button !== 1) return;
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    // Preserve the original wa.me href throughout event bubbling so GTM sees one real link click.
    const message = new URL(link.href).searchParams.get('text') || '';
    const useNewTab = event.button === 1 || event.ctrlKey || event.metaKey || event.shiftKey || link.target === '_blank';
    const destination = useNewTab ? window.open('about:blank', '_blank') : null;
    if (destination) destination.opener = null;
    setNotice('Conectando com um atendente…');
    try {
      const response = await fetch('/api/route', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await response.json();
      if (!response.ok || !/^55[1-9]{2}9\d{8}$/.test(data.phone || '')) throw new Error(data.error || 'Não foi possível conectar. Tente novamente.');
      const href = `https://wa.me/${data.phone}?text=${encodeURIComponent(message)}`;
      if (destination) destination.location.replace(href); else window.location.assign(href);
      setNotice('');
    } catch (error: any) { destination?.close(); setNotice(error.message || 'Não foi possível conectar. Tente novamente.'); }
    finally { busy.current = false; }
  }
  return { phone, buildWhatsAppUrl, contactLabel, routeWhatsApp, routingNotice };
}
