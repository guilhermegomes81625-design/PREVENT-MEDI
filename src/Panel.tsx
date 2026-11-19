import React, { useCallback, useEffect, useState } from 'react';
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
  ArrowDown,
  UserCheck,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { formatPhoneNumber } from './useWhatsAppRouting';
import './panel.css';

type Attendant = {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  clicks?: number;
  todayClicks?: number;
  lastClickDate?: string | null;
  lastRoutedAt?: string | null;
};

const BR_PHONE_REGEX = /^55[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/;
const TOKEN_STORAGE_KEY = 'pm_panel_token';

function normalizePhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

function formatShortDateTime(iso?: string | null): string {
  if (!iso) return 'Nenhum envio ainda';
  try {
    const date = new Date(iso);
    return `Último: ${date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })} às ${date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch {
    return 'Enviado recentemente';
  }
}

export default function Panel() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [rows, setRows] = useState<Attendant[]>([]);
  const [version, setVersion] = useState(1);
  const [updatedAt, setUpdatedAt] = useState('');
  const [totalClients, setTotalClients] = useState(0);
  const [todayClients, setTodayClients] = useState(0);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const api = useCallback(async (path: string, options: RequestInit = {}) => {
    let token: string | null = null;
    try {
      token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {}

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch('/api/' + path, {
      ...options,
      credentials: 'same-origin',
      cache: 'no-store',
      headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 && path !== 'session') {
        try {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {}
        setAuth(false);
      }
      throw new Error(data.error || 'Não foi possível concluir.');
    }
    return data;
  }, []);

  const broadcastPhone = useCallback((phoneNumber: string | null) => {
    try {
      if (phoneNumber) {
        localStorage.setItem('pm_primary_phone', phoneNumber);
      } else {
        localStorage.removeItem('pm_primary_phone');
      }
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'pm_primary_phone', newValue: phoneNumber })
      );
      window.dispatchEvent(new CustomEvent('pm_phone_updated', { detail: phoneNumber }));
    } catch {}
  }, []);

  const accept = useCallback(
    (data: any, preserveDirty = false) => {
      const list: Attendant[] = Array.isArray(data.attendants) ? data.attendants : [];
      setRows(list);
      setVersion(data.version || 1);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      const computedTotal = list.reduce((sum, item) => sum + (item.clicks || 0), 0);
      const computedToday = list.reduce((sum, item) => sum + (item.todayClicks || 0), 0);
      setTotalClients(
        typeof data.totalClientsRouted === 'number' ? data.totalClientsRouted : computedTotal
      );
      setTodayClients(
        typeof data.todayClicksTotal === 'number' ? data.todayClicksTotal : computedToday
      );
      if (!preserveDirty) {
        setDirty(false);
      }
      const firstActive = list.find((r) => r.active);
      broadcastPhone(firstActive ? firstActive.phone : null);
    },
    [broadcastPhone]
  );

  useEffect(() => {
    document.title = 'Painel de atendentes | Central de Atendimento';
    api('session')
      .then(async (data) => {
        if (data.authenticated) {
          const adminData = await api('admin');
          accept(adminData);
          setAuth(true);
        } else {
          setAuth(false);
        }
      })
      .catch(() => {
        setAuth(false);
      });
  }, [api, accept]);

  // Live background polling of client click counts while panel is open & clean
  useEffect(() => {
    if (!auth || dirty || busy) return;
    const timer = setInterval(async () => {
      try {
        const data = await api('admin');
        accept(data);
      } catch {}
    }, 5000);
    return () => clearInterval(timer);
  }, [auth, dirty, busy, api, accept]);

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
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return;
    const target = rows[index];
    const activated = { ...target, active: true };
    const next = [activated, ...rows.filter((r) => r.id !== id)];
    change(next);
    setNotice(
      `"${target.name}" foi colocado em 1º LUGAR como Número Principal do Site. Clique em "Salvar alterações" para gravar.`
    );
  };

  const moveOrder = (id: string, delta: number) => {
    const index = rows.findIndex((r) => r.id === id);
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
    setNotice('');
    try {
      const sessionRes = await api('session', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      if (sessionRes?.token) {
        try {
          sessionStorage.setItem(TOKEN_STORAGE_KEY, sessionRes.token);
        } catch {}
      }
      setPassword('');
      const adminData = await api('admin');
      accept(adminData);
      setAuth(true);
    } catch (err: any) {
      setError(err?.message || 'Senha incorreta.');
      setAuth(false);
    } finally {
      setBusy(false);
    }
  }

  async function refreshStats() {
    if (dirty && !window.confirm('Você tem alterações não salvas. Atualizar agora descartará as edições pendentes. Continuar?')) {
      return;
    }
    setRefreshing(true);
    setError('');
    try {
      const data = await api('admin');
      accept(data);
      setNotice('Contagem de clientes e lista atualizadas.');
    } catch (err: any) {
      setError(err?.message || 'Não foi possível atualizar.');
    } finally {
      setRefreshing(false);
    }
  }

  async function resetStats() {
    if (
      !window.confirm(
        'Tem certeza que deseja zerar os contadores de clientes de todos os contatos? Os números cadastrados serão mantidos.'
      )
    ) {
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const data = await api('admin/reset-stats', { method: 'POST', body: '{}' });
      accept(data);
      setNotice('Contadores de clientes zerados com sucesso.');
    } catch (err: any) {
      setError(err?.message || 'Não foi possível zerar os contadores.');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setError('');
    setNotice('');

    // Normalize and validate all rows before sending
    const normalizedRows: Attendant[] = [];
    const seenPhones = new Set<string>();
    for (const row of rows) {
      const cleanName = row.name.trim();
      const normalizedPhone = normalizePhoneInput(row.phone);
      if (!cleanName || cleanName.length > 80) {
        setError('Informe um nome válido (até 80 caracteres) para todos os atendentes.');
        return;
      }
      if (!BR_PHONE_REGEX.test(normalizedPhone)) {
        setError(
          `Número inválido em "${cleanName}". Informe 55 + DDD + número (ex.: 5511966604328).`
        );
        return;
      }
      if (seenPhones.has(normalizedPhone)) {
        setError(`O número ${formatPhoneNumber(normalizedPhone)} está repetido na lista.`);
        return;
      }
      seenPhones.add(normalizedPhone);
      normalizedRows.push({
        ...row,
        name: cleanName,
        phone: normalizedPhone,
      });
    }

    setBusy(true);
    try {
      const res = await api('admin', {
        method: 'PUT',
        body: JSON.stringify({ attendants: normalizedRows, version }),
      });
      accept(res);
      const firstActive = (res.attendants || normalizedRows).find((r: Attendant) => r.active);
      setNotice(
        firstActive
          ? `Salvo com sucesso! O número principal (${formatPhoneNumber(firstActive.phone)}) já está atualizado e salvo no site.`
          : 'Salvo com sucesso! Todos os números estão pausados no momento.'
      );
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar alterações. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  function add(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setNotice('');
    const normalized = normalizePhoneInput(phone);
    if (!BR_PHONE_REGEX.test(normalized)) {
      setError('Informe 55 + DDD + celular, por exemplo: 5511966604328.');
      return;
    }
    if (rows.some((row) => normalizePhoneInput(row.phone) === normalized)) {
      setError('Esse número já foi adicionado.');
      return;
    }
    if (rows.length >= 100) {
      setError('Limite de 100 atendentes.');
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Informe o nome do atendente.');
      return;
    }
    change([
      ...rows,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        phone: normalized,
        active: true,
        clicks: 0,
        todayClicks: 0,
        lastClickDate: null,
        lastRoutedAt: null,
      },
    ]);
    setName('');
    setPhone('');
    setNotice(`"${trimmedName}" adicionado à lista. Clique em "Salvar alterações" para publicar.`);
  }

  async function logout() {
    if (dirty && !window.confirm('Há alterações não salvas. Sair sem salvar?')) return;
    setBusy(true);
    try {
      await api('session', { method: 'DELETE' });
    } catch {}
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
    setRows([]);
    setAuth(false);
    setDirty(false);
    setNotice('');
    setError('');
    setBusy(false);
  }

  const firstActive = rows.find((r) => r.active);

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
            <Phone size={25} /> CENTRAL DE ATENDIMENTO
          </div>
          <div className="panel-lock">
            <LockKeyhole size={28} />
          </div>
          <h1>Painel de atendentes</h1>
          <p>Entre para gerenciar os números de WhatsApp do site e acompanhar os clientes direcionados.</p>
          <form onSubmit={login}>
            <label htmlFor="panel-password">Senha de acesso</label>
            <input
              id="panel-password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="panel-primary" disabled={busy}>
              {busy ? 'Entrando…' : 'Entrar no painel'}
            </button>
          </form>
          {error && (
            <p role="alert" className="panel-error">
              {error}
            </p>
          )}
          <a className="panel-back" href="/">
            Voltar ao site
          </a>
        </section>
      ) : (
        <div className="panel-content">
          <header className="panel-header">
            <div>
              <div className="panel-brand">
                <Phone size={21} /> CENTRAL DE ATENDIMENTO
              </div>
              <h1>Painel de Atendentes & WhatsApp</h1>
              <p>
                Gerencie os números do site, veja exatamente quantos clientes foram enviados para cada contato e salve suas alterações.
              </p>
            </div>
            <div className="panel-header-actions">
              <a className="panel-secondary panel-link-btn" href="/">
                Ver site
              </a>
              <button className="panel-secondary" onClick={logout} disabled={busy}>
                <LogOut size={16} /> Sair
              </button>
            </div>
          </header>

          <div className="panel-stats panel-stats-4">
            <div>
              <Users />
              <strong>{rows.length}</strong>
              <span>Atendentes</span>
            </div>
            <div>
              <CheckCircle2 />
              <strong>{rows.filter((r) => r.active).length}</strong>
              <span>Ativos</span>
            </div>
            <div>
              <Pause />
              <strong>{rows.filter((r) => !r.active).length}</strong>
              <span>Pausados</span>
            </div>
            <div className="panel-stat-clients">
              <UserCheck />
              <strong>{totalClients}</strong>
              <span>
                Clientes direcionados
                {todayClients > 0 ? ` (${todayClients} hoje)` : ''}
              </span>
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
                Este é o número oficial exibido no rodapé e nos termos do site. O{' '}
                <strong>1º número ativo da lista</strong> é automaticamente o número principal. Após editar ou trocar, clique em{' '}
                <strong>Salvar alterações</strong>.
              </p>
            </div>

            <div className="panel-primary-box">
              <div className="panel-primary-info">
                <span className="panel-primary-caption">
                  Número atualmente em 1º lugar (Exibição no Site):
                </span>
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
                    onChange={(e) => setAsPrimary(e.target.value)}
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
                <h2>Lista de Atendentes (Rodízio & Clientes por Contato)</h2>
                <p>
                  Os cliques do site são distribuídos em rodízio entre os números ativos, e a contagem exata de clientes enviados para cada contato aparece abaixo.
                </p>
              </div>
              <div className="panel-heading-tools">
                <button
                  type="button"
                  className="panel-secondary panel-compact-btn"
                  onClick={refreshStats}
                  disabled={busy || refreshing}
                  title="Atualizar contagem de clientes"
                >
                  <RefreshCw size={14} className={refreshing ? 'panel-spin' : ''} />
                  Atualizar
                </button>
                <button
                  type="button"
                  className="panel-secondary panel-compact-btn"
                  onClick={resetStats}
                  disabled={busy || totalClients === 0}
                  title="Zerar contagem de clientes de todos os contatos"
                >
                  <RotateCcw size={14} />
                  Zerar contadores
                </button>
                <span className={dirty ? 'panel-status pending' : 'panel-status'}>
                  {dirty ? 'Alterações não salvas' : 'Lista salva no servidor'}
                </span>
              </div>
            </div>

            <div className="panel-rows">
              {rows.length === 0 && (
                <p className="panel-empty">
                  Nenhum atendente cadastrado. Adicione um número abaixo e salve.
                </p>
              )}
              {rows.map((row, index) => {
                const isPrimary = row.id === firstActive?.id;
                const rowClicks = row.clicks || 0;
                const rowToday = row.todayClicks || 0;
                const share = totalClients > 0 ? Math.round((rowClicks / totalClients) * 100) : 0;

                return (
                  <article
                    className={`panel-row ${isPrimary ? 'panel-row-primary' : ''}`}
                    key={row.id}
                  >
                    <div className="panel-row-main">
                      <div className="panel-row-left">
                        <div className="panel-avatar">
                          {isPrimary ? (
                            <Star size={18} className="panel-star-icon" />
                          ) : (
                            row.name.charAt(0).toUpperCase()
                          )}
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
                            onChange={(e) =>
                              change(
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, name: e.target.value } : r
                                )
                              )
                            }
                            disabled={busy}
                          />
                        </label>
                        <label>
                          WhatsApp (55 + DDD + Número)
                          <input
                            aria-label={`WhatsApp de ${row.name}`}
                            inputMode="tel"
                            maxLength={20}
                            value={row.phone}
                            onChange={(e) =>
                              change(
                                rows.map((r) =>
                                  r.id === row.id
                                    ? { ...r, phone: e.target.value.replace(/\D/g, '') }
                                    : r
                                )
                              )
                            }
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
                          type="button"
                          className="panel-secondary"
                          disabled={busy}
                          onClick={() =>
                            change(
                              rows.map((r) =>
                                r.id === row.id ? { ...r, active: !r.active } : r
                              )
                            )
                          }
                        >
                          {row.active ? <Pause size={15} /> : <Play size={15} />}
                          {row.active ? 'Pausar' : 'Continuar'}
                        </button>

                        <button
                          type="button"
                          className="panel-delete"
                          disabled={busy}
                          aria-label={`Excluir ${row.name}`}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Excluir ${row.name}? A exclusão será aplicada ao salvar.`
                              )
                            ) {
                              change(rows.filter((r) => r.id !== row.id));
                            }
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    {/* Per-contact client routing stats */}
                    <div className="panel-row-metrics">
                      <div className="panel-metric-pill">
                        <UserCheck size={14} />
                        <strong>
                          {rowClicks} {rowClicks === 1 ? 'cliente' : 'clientes'}
                        </strong>
                        <span>({share}% do total)</span>
                      </div>
                      <span className="panel-metric-meta">
                        Hoje: <strong>{rowToday}</strong>
                      </span>
                      <span className="panel-metric-meta">
                        {formatShortDateTime(row.lastRoutedAt)}
                      </span>
                      <div className="panel-metric-bar-wrap" aria-hidden="true">
                        <div
                          className="panel-metric-bar-fill"
                          style={{ width: `${share}%` }}
                        />
                      </div>
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
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label htmlFor="attendant-phone">
                WhatsApp com DDD (55 + DDD + Celular)
                <input
                  id="attendant-phone"
                  placeholder="5511966604328"
                  inputMode="tel"
                  value={phone}
                  required
                  maxLength={22}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={busy}
                />
              </label>
              <button className="panel-secondary" disabled={busy}>
                <Plus size={17} /> Adicionar
              </button>
            </form>
          </section>

          {!rows.some((r) => r.active) && (
            <div className="panel-warning">
              Sem atendentes ativos, os botões e links de WhatsApp do site ficarão indisponíveis após salvar.
            </div>
          )}

          {error && (
            <div className="panel-error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="panel-success" role="status">
              {notice}
            </div>
          )}

          <footer className={`panel-save ${dirty ? 'panel-save-dirty' : ''}`}>
            <div>
              <strong>
                {dirty
                  ? 'Você tem alterações pendentes — clique em Salvar alterações'
                  : 'Tudo salvo e sincronizado com o site'}
              </strong>
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
            Após clicar em &quot;Salvar alterações&quot;, os números ficam gravados no servidor e atualizam automaticamente no site.
          </p>
        </div>
      )}
    </main>
  );
}
