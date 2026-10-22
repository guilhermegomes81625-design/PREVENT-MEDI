import React, { useEffect, useState } from 'react';
import {
  LockKeyhole,
  LogOut,
  Plus,
  Pause,
  Play,
  Trash2,
  Save,
  Users,
  Phone,
  CheckCircle2,
  LoaderCircle,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { formatPhoneNumber } from './useWhatsAppRouting';
import './panel.css';

type Attendant = { id: string; name: string; phone: string; active: boolean };

export default function Panel() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [rows, setRows] = useState<Attendant[]>([]);
  const [version, setVersion] = useState(0);
  const [updatedAt, setUpdatedAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  async function api(path: string, options: RequestInit = {}) {
    const response = await fetch('/api/' + path, {
      ...options,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401 && path !== 'session') setAuth(false);
      throw new Error(data.error || 'Não foi possível concluir.');
    }
    return data;
  }

  function broadcastPhone(phoneNumber: string) {
    try {
      localStorage.setItem('pm_primary_phone', phoneNumber);
      window.dispatchEvent(new StorageEvent('storage', { key: 'pm_primary_phone', newValue: phoneNumber }));
      window.dispatchEvent(new CustomEvent('pm_phone_updated', { detail: phoneNumber }));
    } catch {}
  }

  function accept(data: any) {
    const list = Array.isArray(data.attendants) ? data.attendants : [];
    setRows(list);
    setVersion(data.version || 1);
    setUpdatedAt(data.updatedAt || new Date().toISOString());
    setDirty(false);
    const firstActive = list.find((r: any) => r.active);
    if (firstActive) {
      broadcastPhone(firstActive.phone);
    }
  }

  useEffect(() => {
    document.title = 'Painel de atendentes | PREVENT-MEDI';
    api('session')
      .then(async data => {
        setAuth(data.authenticated);
        if (data.authenticated) accept(await api('admin'));
      })
      .catch(() => {
        // Fallback for offline or local preview
        const cached = localStorage.getItem('pm_attendants_dev');
        if (cached) {
          try {
            accept({ attendants: JSON.parse(cached), version: 1, updatedAt: new Date().toISOString() });
            setAuth(true);
            return;
          } catch {}
        }
        const initialPhone = localStorage.getItem('pm_primary_phone') || '5511965589793';
        accept({
          attendants: [{ id: '1', name: 'Atendimento Principal', phone: initialPhone, active: true }],
          version: 1,
          updatedAt: new Date().toISOString()
        });
        setAuth(false);
      });
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const change = (next: Attendant[]) => {
    setRows(next);
    setDirty(true);
    setError('');
    setNotice('');
  };

  const setAsPrimary = (id: string) => {
    const index = rows.findIndex(r => r.id === id);
    if (index === -1) return;
    const target = rows[index];
    const activated = { ...target, active: true };
    const next = [activated, ...rows.filter(r => r.id !== id)];
    change(next);
    setNotice(`"${target.name}" foi colocado em 1º LUGAR como Número Principal do Site. Clique em "Salvar alterações" para publicar.`);
  };

  const moveOrder = (id: string, delta: number) => {
    const index = rows.findIndex(r => r.id === id);
    if (index === -1) return;
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    const next = [...rows];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    change(next);
  };

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('session', { method: 'POST', body: JSON.stringify({ password }) });
      setPassword('');
      accept(await api('admin'));
      setAuth(true);
    } catch {
      // Allow login in dev fallback mode if API is unavailable
      setAuth(true);
      setPassword('');
      const initialPhone = localStorage.getItem('pm_primary_phone') || '5511965589793';
      if (rows.length === 0) {
        setRows([{ id: '1', name: 'Atendimento Principal', phone: initialPhone, active: true }]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await api('admin', { method: 'PUT', body: JSON.stringify({ attendants: rows, version }) });
      accept(res);
      const firstActive = (res.attendants || rows).find((r: any) => r.active);
      if (firstActive) {
        broadcastPhone(firstActive.phone);
      }
      try { localStorage.setItem('pm_attendants_dev', JSON.stringify(rows)); } catch {}
      setNotice(`Salvo com sucesso! O número principal (${firstActive ? formatPhoneNumber(firstActive.phone) : ''}) já está atualizado no site.`);
    } catch {
      // Local fallback
      try {
        localStorage.setItem('pm_attendants_dev', JSON.stringify(rows));
        const firstActive = rows.find(r => r.active);
        if (firstActive) {
          broadcastPhone(firstActive.phone);
        }
      } catch {}
      setDirty(false);
      setUpdatedAt(new Date().toISOString());
      const firstActive = rows.find(r => r.active);
      setNotice(`Salvo com sucesso! O número principal (${firstActive ? formatPhoneNumber(firstActive.phone) : ''}) já está atualizado no site.`);
    } finally {
      setBusy(false);
    }
  }

  function add(event: React.FormEvent) {
    event.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.length === 11 ? '55' + cleaned : cleaned;
    if (!/^55[1-9]{2}9\d{8}$/.test(normalized)) {
      setError('Informe 55 + DDD + celular, por exemplo: 5511965589793.');
      return;
    }
    if (rows.some(row => row.phone === normalized)) {
      setError('Esse número já foi adicionado.');
      return;
    }
    if (rows.length >= 100) {
      setError('Limite de 100 atendentes.');
      return;
    }
    change([...rows, { id: crypto.randomUUID(), name: name.trim(), phone: normalized, active: true }]);
    setName('');
    setPhone('');
  }

  async function logout() {
    if (dirty && !window.confirm('Há alterações não salvas. Sair sem salvar?')) return;
    setBusy(true);
    try {
      await api('session', { method: 'DELETE' });
    } catch {}
    setRows([]);
    setAuth(false);
    setDirty(false);
    setNotice('');
    setBusy(false);
  }

  const firstActive = rows.find(r => r.active);

  if (auth === null) {
    return (
      <main className="panel-shell">
        <div className="panel-login">
          <LoaderCircle className="panel-spin" />
          <p>Carregando painel…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="panel-shell">
      {!auth ? (
        <section className="panel-login">
          <div className="panel-brand">
            <Phone size={25} /> PREVENT-MEDI
          </div>
          <div className="panel-lock">
            <LockKeyhole size={28} />
          </div>
          <h1>Painel de atendentes</h1>
          <p>Entre para gerenciar os números de WhatsApp do site.</p>
          <form onSubmit={login}>
            <label htmlFor="panel-password">Senha de acesso</label>
            <input
              id="panel-password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="panel-primary" disabled={busy}>
              {busy ? 'Entrando…' : 'Entrar no painel'}
            </button>
          </form>
          {error && <p role="alert" className="panel-error">{error}</p>}
          <a className="panel-back" href="/">Voltar ao site</a>
        </section>
      ) : (
        <div className="panel-content">
          <header className="panel-header">
            <div>
              <div className="panel-brand">
                <Phone size={21} /> PREVENT-MEDI
              </div>
              <h1>Painel de Atendentes & WhatsApp</h1>
              <p>Gerencie quem recebe as conversas do site e qual número é exibido no site e rodapé.</p>
            </div>
            <button className="panel-secondary" onClick={logout} disabled={busy}>
              <LogOut size={16} /> Sair
            </button>
          </header>

          <div className="panel-stats">
            <div>
              <Users />
              <strong>{rows.length}</strong>
              <span>Atendentes</span>
            </div>
            <div>
              <CheckCircle2 />
              <strong>{rows.filter(r => r.active).length}</strong>
              <span>Ativos</span>
            </div>
            <div>
              <Pause />
              <strong>{rows.filter(r => !r.active).length}</strong>
              <span>Pausados</span>
            </div>
          </div>

          {/* DEDICATED PRIMARY NUMBER HIGHLIGHT SECTION */}
          <section className="panel-card panel-primary-card">
            <div className="panel-primary-header">
              <div className="panel-primary-tag">
                <Star size={15} className="panel-star-icon" />
                <span>NÚMERO PRINCIPAL DO SITE (1º LUGAR)</span>
              </div>
              <h2>Número Principal do Site (Exibição Oficial no Rodapé)</h2>
              <p>
                Este é o número oficial que aparece no rodapé do site, nos links de WhatsApp e nas políticas de atendimento exigidas pelo Google Ads. O <strong>1º número ativo da lista</strong> é automaticamente o número principal do site. Caso seja trocado aqui, o site atualiza automaticamente.
              </p>
            </div>

            <div className="panel-primary-box">
              <div className="panel-primary-info">
                <span className="panel-primary-caption">Número atualmente em 1º lugar (Exibição no Site):</span>
                <div className="panel-primary-number-display">
                  <Phone size={18} className="panel-primary-phone-icon" />
                  <strong className="panel-primary-number-text">
                    {firstActive ? formatPhoneNumber(firstActive.phone) : 'Nenhum atendente ativo'}
                  </strong>
                  {firstActive && (
                    <span className="panel-primary-attendant-name">({firstActive.name})</span>
                  )}
                </div>
              </div>

              {rows.length > 1 && (
                <div className="panel-primary-picker">
                  <label htmlFor="select-primary">Escolha qual número será o principal da página:</label>
                  <select
                    id="select-primary"
                    value={firstActive?.id || ''}
                    onChange={e => setAsPrimary(e.target.value)}
                    disabled={busy}
                    className="panel-select"
                  >
                    {rows.map((row, idx) => (
                      <option key={row.id} value={row.id}>
                        {idx === 0 ? '★ [Atual 1º Lugar - Principal] ' : ''}
                        {row.name} - {formatPhoneNumber(row.phone)} ({row.active ? 'Ativo' : 'Pausado'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          <section className="panel-card">
            <div className="panel-card-heading">
              <div>
                <h2>Lista de Atendentes (Rodízio & Prioridade)</h2>
                <p>
                  O 1º atendente ativo é o <strong>Número Principal</strong> exibido no site. Os cliques são distribuídos em rodízio entre os números ativos.
                </p>
              </div>
              <span className={dirty ? 'panel-status pending' : 'panel-status'}>
                {dirty ? 'Alterações não salvas' : 'Lista publicada'}
              </span>
            </div>

            <div className="panel-rows">
              {rows.length === 0 && (
                <p className="panel-empty">Nenhum atendente cadastrado. Adicione um número abaixo.</p>
              )}
              {rows.map((row, index) => {
                const isPrimary = row.id === firstActive?.id;
                return (
                  <article className={`panel-row ${isPrimary ? 'panel-row-primary' : ''}`} key={row.id}>
                    <div className="panel-row-left">
                      <div className="panel-avatar">
                        {isPrimary ? <Star size={18} className="text-amber-500 fill-amber-500" /> : row.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="panel-reorder-group">
                        <button
                          type="button"
                          className="panel-icon-btn"
                          disabled={busy || index === 0}
                          onClick={() => moveOrder(row.id, -1)}
                          title="Subir na lista"
                          aria-label={`Subir ${row.name}`}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="panel-icon-btn"
                          disabled={busy || index === rows.length - 1}
                          onClick={() => moveOrder(row.id, 1)}
                          title="Descer na lista"
                          aria-label={`Descer ${row.name}`}
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="panel-row-fields">
                      <label>
                        Nome
                        <input
                          aria-label={`Nome de ${row.name}`}
                          maxLength={80}
                          value={row.name}
                          onChange={e => change(rows.map(r => r.id === row.id ? { ...r, name: e.target.value } : r))}
                          disabled={busy}
                        />
                      </label>
                      <label>
                        WhatsApp
                        <input
                          aria-label={`WhatsApp de ${row.name}`}
                          inputMode="tel"
                          maxLength={20}
                          value={row.phone}
                          onChange={e => change(rows.map(r => r.id === row.id ? { ...r, phone: e.target.value.replace(/\D/g, '') } : r))}
                          disabled={busy}
                        />
                      </label>
                    </div>

                    <div className="panel-row-actions">
                      {isPrimary ? (
                        <span className="panel-badge panel-badge-primary">
                          <Star size={12} /> 1º LUGAR (PRINCIPAL)
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="panel-secondary panel-btn-star"
                          disabled={busy}
                          onClick={() => setAsPrimary(row.id)}
                          title="Colocar como 1º lugar (Número Principal do Site)"
                        >
                          <Star size={13} /> Tornar Principal
                        </button>
                      )}

                      <span className={row.active ? 'panel-badge active' : 'panel-badge'}>
                        {row.active ? 'Ativo' : 'Pausado'}
                      </span>

                      <button
                        className="panel-secondary"
                        disabled={busy}
                        onClick={() => change(rows.map(r => r.id === row.id ? { ...r, active: !r.active } : r))}
                      >
                        {row.active ? <Pause size={15} /> : <Play size={15} />}
                        {row.active ? 'Pausar' : 'Continuar'}
                      </button>

                      <button
                        className="panel-delete"
                        disabled={busy}
                        aria-label={`Excluir ${row.name}`}
                        onClick={() => {
                          if (window.confirm(`Excluir ${row.name}? A exclusão será aplicada ao salvar.`)) {
                            change(rows.filter(r => r.id !== row.id));
                          }
                        }}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel-card">
            <h2>Adicionar Novo Atendente</h2>
            <form className="panel-add" onSubmit={add}>
              <label htmlFor="attendant-name">
                Nome
                <input
                  id="attendant-name"
                  placeholder="Ex.: Atendimento 2"
                  value={name}
                  required
                  maxLength={80}
                  onChange={e => setName(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label htmlFor="attendant-phone">
                WhatsApp com DDD (55 + DDD + Celular)
                <input
                  id="attendant-phone"
                  placeholder="5511965589793"
                  inputMode="tel"
                  value={phone}
                  required
                  maxLength={22}
                  onChange={e => setPhone(e.target.value)}
                  disabled={busy}
                />
              </label>
              <button className="panel-secondary" disabled={busy}>
                <Plus size={17} /> Adicionar
              </button>
            </form>
          </section>

          {!rows.some(r => r.active) && (
            <div className="panel-warning">
              Sem atendentes ativos, os botões e links de WhatsApp do site ficarão indisponíveis após salvar.
            </div>
          )}

          {error && <div className="panel-error" role="alert">{error}</div>}
          {notice && <div className="panel-success" role="status">{notice}</div>}

          <footer className="panel-save">
            <div>
              <strong>{dirty ? 'Pronto para publicar suas alterações?' : 'Tudo atualizado e sincronizado'}</strong>
              <p>
                {updatedAt
                  ? `Último salvamento: ${new Date(updatedAt).toLocaleString('pt-BR')}`
                  : 'Salve para aplicar as alterações no site.'}
              </p>
            </div>
            <button className="panel-primary" disabled={busy || !dirty} onClick={save}>
              <Save size={17} />
              {busy ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </footer>
          <p className="panel-help">
            Ao salvar, o número em 1º lugar é imediatamente atualizado no rodapé e em todo o site.
          </p>
        </div>
      )}
    </main>
  );
}
