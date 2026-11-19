import { useEffect, useRef, useState } from 'react';
import type React from 'react';

const BR_PHONE_REGEX = /^55[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/;

export function formatPhoneNumber(p: string | null, loaded = true): string {
  if (!p) return loaded ? 'Indisponível no momento' : 'Carregando...';
  const clean = p.replace(/\D/g, '');
  if (clean.length === 13 && clean.startsWith('55')) {
    return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  if (clean.length === 12 && clean.startsWith('55')) {
    return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
  }
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return p;
}

export function useWhatsAppRouting() {
  const [phone, setPhone] = useState<string | null>(() => {
    try {
      const cached = localStorage.getItem('pm_primary_phone');
      if (cached === '5511965589793') return '5511966604328';
      return cached || '5511966604328';
    } catch {
      return '5511966604328';
    }
  });
  const [loaded, setLoaded] = useState(false);
  const [routingNotice, setNotice] = useState('');
  const busy = useRef(false);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/availability?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (alive && 'phone' in data) {
          const nextPhone: string | null = data.phone || null;
          setLoaded(true);
          setPhone(nextPhone);
          try {
            if (nextPhone) {
              localStorage.setItem('pm_primary_phone', nextPhone);
            } else {
              localStorage.removeItem('pm_primary_phone');
            }
          } catch {}
        }
      } catch {
        // Keep current state if network briefly fails
      }
    };

    void refresh();
    const timer = setInterval(refresh, 3000);
    const visible = () => {
      if (!document.hidden) void refresh();
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'pm_primary_phone' && alive) {
        setPhone(e.newValue || null);
      }
    };

    const onCustomUpdate = (e: Event) => {
      const detail = (e as CustomEvent<string | null>).detail;
      if (alive) {
        setPhone(detail ?? null);
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('pm_phone_updated', onCustomUpdate);
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('focus', visible);

    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pm_phone_updated', onCustomUpdate);
      document.removeEventListener('visibilitychange', visible);
      window.removeEventListener('focus', visible);
    };
  }, []);

  useEffect(() => {
    if (!routingNotice) return;
    const timer = setTimeout(() => setNotice(''), 7000);
    return () => clearTimeout(timer);
  }, [routingNotice]);

  const formattedPhone = formatPhoneNumber(phone, loaded);
  const buildWhatsAppUrl = (message: string) =>
    phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : undefined;
  const contactLabel = phone ? `WhatsApp: ${formattedPhone}` : 'Atendimento temporariamente indisponível';

  async function routeWhatsApp(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest<HTMLAnchorElement>('a[href]');
    if (!link || !event.currentTarget.contains(link) || new URL(link.href).hostname !== 'wa.me') return;
    if (event.button !== 0 && event.button !== 1) return;
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    const message = new URL(link.href).searchParams.get('text') || '';
    const useNewTab =
      event.button === 1 || event.ctrlKey || event.metaKey || event.shiftKey || link.target === '_blank';
    const destination = useNewTab ? window.open('about:blank', '_blank') : null;
    if (destination) destination.opener = null;
    setNotice('Conectando com um atendente…');
    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await response.json();
      if (!response.ok || !BR_PHONE_REGEX.test(data.phone || '')) {
        throw new Error(data.error || 'Não foi possível conectar. Tente novamente.');
      }
      const href = `https://wa.me/${data.phone}?text=${encodeURIComponent(message)}`;
      if (destination) destination.location.replace(href);
      else window.location.assign(href);
      setNotice('');
    } catch (error: any) {
      destination?.close();
      setNotice(error?.message || 'Não foi possível conectar. Tente novamente.');
    } finally {
      busy.current = false;
    }
  }

  return { phone, formattedPhone, buildWhatsAppUrl, contactLabel, routeWhatsApp, routingNotice };
}
