import React, { useEffect, useState } from 'react';
import { LockKeyhole, LogOut, Plus, Pause, Play, Trash2, Save, Users, Phone, CheckCircle2, LoaderCircle } from 'lucide-react';
import './panel.css';
type Attendant = { id: string; name: string; phone: string; active: boolean };
export default function Panel() {
  const [auth, setAuth] = useState<boolean | null>(null), [password, setPassword] = useState('');
  const [rows, setRows] = useState<Attendant[]>([]), [version, setVersion] = useState(0), [updatedAt, setUpdatedAt] = useState('');
  const [busy, setBusy] = useState(false), [dirty, setDirty] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [name, setName] = useState(''), [phone, setPhone] = useState('');
  async function api(path: string, options: RequestInit = {}) {
    const response = await fetch('/api/' + path, { ...options, credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', ...options.headers } });
    const data = await response.json();
    if (!response.ok) { if (response.status === 401 && path !== 'session') setAuth(false); throw new Error(data.error || 'Não foi possível concluir.'); }
    return data;
  }
  function accept(data: any) {
    setRows(data.attendants);
    setVersion(data.version);
    setUpdatedAt(data.updatedAt);
    setDirty(false);
    const firstActive = (data.attendants || []).find((r: any) => r.active);
    if (firstActive) {
      try { localStorage.setItem('pm_primary_phone', firstActive.phone); } catch {}
    }
  }
  useEffect(() => {
    document.title = 'Painel de atendentes | PREVENT-MEDI';
    api('session').then(async data => { setAuth(data.authenticated); if (data.authenticated) accept(await api('admin')); }).catch(e => { setAuth(false); setError(e.message); });
  }, []);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  const change = (next: Attendant[]) => { setRows(next); setDirty(true); setError(''); setNotice(''); };
  async function login(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await api('session', { method: 'POST', body: JSON.stringify({ password }) }); setPassword(''); accept(await api('admin')); setAuth(true); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }
  async function save() {
    setBusy(true); setError(''); setNotice('');
    try {
      const res = await api('admin', { method: 'PUT', body: JSON.stringify({ attendants: rows, version }) });
      accept(res);
      const firstActive = (res.attendants || rows).find((r: any) => r.active);
      if (firstActive) {
        try {
          localStorage.setItem('pm_primary_phone', firstActive.phone);
          window.dispatchEvent(new StorageEvent('storage', { key: 'pm_primary_phone', newValue: firstActive.phone }));
        } catch {}
      }
      setNotice('Salvo! A lista já está em uso no site.');
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }
  function add(event: React.FormEvent) {
    event.preventDefault(); const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.length === 11 ? '55' + cleaned : cleaned;
    if (!/^55[1-9]{2}9\d{8}$/.test(normalized)) { setError('Informe 55 + DDD + celular, por exemplo: 5511965589793.'); return; }
    if (rows.some(row => row.phone === normalized)) { setError('Esse número já foi adicionado.'); return; }
    if (rows.length >= 100) { setError('Limite de 100 atendentes.'); return; }
    change([...rows, { id: crypto.randomUUID(), name: name.trim(), phone: normalized, active: true }]); setName(''); setPhone('');
  }
  async function logout() { if (dirty && !window.confirm('Há alterações não salvas. Sair sem salvar?')) return; setBusy(true); try { await api('session', { method: 'DELETE' }); setRows([]); setAuth(false); setDirty(false); setNotice(''); } catch (e: any) { setError(e.message); } finally { setBusy(false); } }
  if (auth === null) return <main className="panel-shell"><div className="panel-login"><LoaderCircle className="panel-spin" /><p>Carregando painel…</p></div></main>;
  return <main className="panel-shell">
    {!auth ? <section className="panel-login"><div className="panel-brand"><Phone size={25} /> PREVENT-MEDI</div><div className="panel-lock"><LockKeyhole size={28} /></div><h1>Painel de atendentes</h1><p>Entre para gerenciar os números de WhatsApp do site.</p>
      <form onSubmit={login}><label htmlFor="panel-password">Senha de acesso</label><input id="panel-password" type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={e => setPassword(e.target.value)} /><button className="panel-primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar no painel'}</button></form>{error && <p role="alert" className="panel-error">{error}</p>}<a className="panel-back" href="/">Voltar ao site</a></section>
    : <div className="panel-content"><header className="panel-header"><div><div className="panel-brand"><Phone size={21} /> PREVENT-MEDI</div><h1>Painel de atendentes</h1><p>Gerencie quem recebe as conversas do site.</p></div><button className="panel-secondary" onClick={logout} disabled={busy}><LogOut size={16} /> Sair</button></header>
      <div className="panel-stats"><div><Users /><strong>{rows.length}</strong><span>Atendentes</span></div><div><CheckCircle2 /><strong>{rows.filter(r => r.active).length}</strong><span>Ativos</span></div><div><Pause /><strong>{rows.filter(r => !r.active).length}</strong><span>Pausados</span></div></div>
      <section className="panel-card"><div className="panel-card-heading"><div><h2>Seus atendentes</h2><p>Os cliques são distribuídos em rodízio entre os números ativos.</p></div><span className={dirty ? 'panel-status pending' : 'panel-status'}>{dirty ? 'Alterações não salvas' : 'Lista publicada'}</span></div>
        <div className="panel-rows">{rows.length === 0 && <p className="panel-empty">Nenhum atendente cadastrado. Adicione um número abaixo.</p>}{rows.map(row => <article className="panel-row" key={row.id}><div className="panel-avatar">{row.name.charAt(0).toUpperCase()}</div><div className="panel-row-fields"><label>Nome<input aria-label={`Nome de ${row.name}`} maxLength={80} value={row.name} onChange={e => change(rows.map(r => r.id === row.id ? { ...r, name: e.target.value } : r))} disabled={busy}/></label><label>WhatsApp<input aria-label={`WhatsApp de ${row.name}`} inputMode="tel" maxLength={20} value={row.phone} onChange={e => change(rows.map(r => r.id === row.id ? { ...r, phone: e.target.value.replace(/\D/g, '') } : r))} disabled={busy}/></label></div><div className="panel-row-actions"><span className={row.active ? 'panel-badge active' : 'panel-badge'}>{row.active ? 'Ativo' : 'Pausado'}</span><button className="panel-secondary" disabled={busy} onClick={() => change(rows.map(r => r.id === row.id ? { ...r, active: !r.active } : r))}>{row.active ? <Pause size={15} /> : <Play size={15} />}{row.active ? 'Pausar' : 'Continuar'}</button><button className="panel-delete" disabled={busy} aria-label={`Excluir ${row.name}`} onClick={() => { if (window.confirm(`Excluir ${row.name}? A exclusão será aplicada ao salvar.`)) change(rows.filter(r => r.id !== row.id)); }}><Trash2 size={17}/></button></div></article>)}</div>
      </section>
      <section className="panel-card"><h2>Adicionar atendente</h2><form className="panel-add" onSubmit={add}><label htmlFor="attendant-name">Nome<input id="attendant-name" placeholder="Ex.: Atendimento 2" value={name} required maxLength={80} onChange={e => setName(e.target.value)} disabled={busy}/></label><label htmlFor="attendant-phone">WhatsApp com DDD<input id="attendant-phone" placeholder="5511965589793" inputMode="tel" value={phone} required maxLength={22} onChange={e => setPhone(e.target.value)} disabled={busy}/></label><button className="panel-secondary" disabled={busy}><Plus size={17}/> Adicionar</button></form></section>
      {!rows.some(r => r.active) && <div className="panel-warning">Sem atendentes ativos, os botões do site ficarão indisponíveis após salvar.</div>}
      {error && <div className="panel-error" role="alert">{error}</div>}{notice && <div className="panel-success" role="status">{notice}</div>}
      <footer className="panel-save"><div><strong>{dirty ? 'Pronto para publicar suas alterações?' : 'Tudo atualizado'}</strong><p>{updatedAt ? `Último salvamento: ${new Date(updatedAt).toLocaleString('pt-BR')}` : 'Salve para aplicar as alterações no site.'}</p></div><button className="panel-primary" disabled={busy || !dirty} onClick={save}><Save size={17}/>{busy ? 'Salvando…' : 'Salvar alterações'}</button></footer><p className="panel-help">Adicionar, pausar, continuar e excluir só entram em vigor ao clicar em Salvar alterações.</p>
    </div>}
  </main>;
}
