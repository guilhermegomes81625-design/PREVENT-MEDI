import React, { useState, useRef, useEffect } from 'react';
import { useWhatsAppRouting } from './useWhatsAppRouting';
import {
  CheckCircle2,
  ChevronDown,
  Building2,
  ShieldCheck,
  CheckCheck,
  HelpCircle,
  MessageCircle,
  CalendarDays,
  Phone,
  Stethoscope,
  ClipboardCheck,
  ChevronRight,
  Clock,
  X
} from 'lucide-react';
import attendantPhoto from './assets/images/atendente_logo_1792697074218.jpg';

// Official WhatsApp Logo
function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Bom dia!';
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde!';
  } else {
    return 'Boa noite!';
  }
}

export default function App() {
  const { phone, buildWhatsAppUrl, contactLabel, routeWhatsApp, routingNotice } = useWhatsAppRouting();
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/'
  );
  const [messageStep, setMessageStep] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<'privacy' | 'policy' | 'howItWorks' | 'terms' | null>(null);
  const modalDialogRef = useRef<HTMLDialogElement>(null);

  const cleanPath = currentPath.replace(/\/+$/, '');
  const isContact = cleanPath === '/contato' || cleanPath === '/medi';

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Realistic chat typing sequence
  useEffect(() => {
    setMessageStep(0);
    const t1 = setTimeout(() => setMessageStep(1), 600);
    const t2 = setTimeout(() => setMessageStep(2), 1500);
    const t3 = setTimeout(() => setMessageStep(3), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentPath]);

  useEffect(() => {
    if (activeModal) {
      modalDialogRef.current?.showModal();
    } else {
      modalDialogRef.current?.close();
    }
  }, [activeModal]);

  const openModal = (type: 'privacy' | 'policy' | 'howItWorks' | 'terms') => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === modalDialogRef.current) {
      closeModal();
    }
  };

  const faqs = [
    {
      q: 'Como funciona o atendimento pelo WhatsApp?',
      a: 'Basta tocar no botão "Falar com um atendente". Você será direcionado para o aplicativo do WhatsApp com a mensagem inicial pronta, bastando enviar para iniciar a conversa.',
    },
    {
      q: 'Qual é o horário e tempo de resposta?',
      a: 'Nossa equipe atende de segunda a sábado em horário comercial. As mensagens são respondidas em ordem de recebimento com tempo médio de resposta rápido.',
    },
    {
      q: 'Posso acessar pelo computador?',
      a: 'Sim! Ao clicar pelo computador, o link abrirá automaticamente o WhatsApp Web ou o aplicativo desktop.',
    },
    {
      q: 'Quem é a empresa responsável?',
      a: 'Atendimento ao cliente operado sob o CNPJ 54.914.613/0001-63.',
    },
  ];

  return (
    <div onClick={routeWhatsApp} onAuxClick={routeWhatsApp} className={`bio-page-wrapper ${isContact ? 'theme-medi-page' : 'theme-prevent-page central-home'}`}>
      {routingNotice && <div className="routing-notice" role="status">{routingNotice}</div>}
      {!phone && <div className="routing-notice" role="status">Nenhum atendente disponível no momento. Tente novamente mais tarde.</div>}
      {/* Background ambient lighting */}
      <div className="bio-glow-1" aria-hidden="true" />
      <div className="bio-glow-2" aria-hidden="true" />

      <div className="bio-container">

        {!isContact && (
          <>
            <header className="central-attendant-card">
              <div className="central-attendant-avatar-wrap">
                <div className="central-attendant-avatar-ring">
                  <img
                    src={attendantPhoto}
                    alt="Atendente"
                    className="central-attendant-img"
                    width={72}
                    height={72}
                    referrerPolicy="no-referrer"
                  />
                  <span className="central-attendant-pulse-ring" />
                  <span className="central-attendant-online-dot" />
                </div>
              </div>

              <div className="central-attendant-info">
                <div className="central-attendant-badge-wrap">
                  <span className="central-attendant-badge">
                    <CheckCircle2 size={13} aria-hidden="true" /> Atendente Online
                  </span>
                </div>
                <h1>Central de Atendimento ao Cliente</h1>
              </div>

              {/* Dynamic Attendant Speech Message */}
              <div className="central-speech-bubble" role="region" aria-label="Mensagem da Atendente">
                <div className="central-speech-pointer" aria-hidden="true" />
                {messageStep === 0 ? (
                  <div className="central-speech-typing">
                    <span className="bio-typing-indicator" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                      <span className="bio-dot" />
                      <span className="bio-dot" />
                      <span className="bio-dot" />
                    </span>
                    <span className="central-typing-text">Atendente digitando...</span>
                  </div>
                ) : (
                  <div className="central-speech-content fade-in">
                    <p className="central-speech-greeting">
                      {getGreeting()} 👋
                    </p>
                    <p className="central-speech-text">
                      Seja bem-vindo(a) ao nosso canal de atendimento. Para direcionar você ao atendimento correto, escolha uma das opções abaixo. Nossa equipe irá entender sua solicitação e direcionar você para o atendimento adequado no WhatsApp.
                    </p>
                    <div className="central-speech-meta">
                      <span className="central-speech-time">Agora</span>
                      <CheckCheck size={14} className="central-speech-ticks" aria-hidden="true" />
                    </div>
                  </div>
                )}
              </div>
            </header>

            <nav className="central-options" aria-label="Opções de atendimento">
              {[
                {
                  title: 'Agendamos',
                  description: 'Faça um agendamento com a nossa central de atendimento.',
                  badge: 'PRINCIPAL',
                  Icon: CalendarDays,
                  message: 'Olá! Gostaria de fazer um agendamento com a central de atendimento.'
                },
                {
                  title: 'Consultas',
                  description: 'Consulte horários e especialidades disponíveis.',
                  badge: '',
                  Icon: Stethoscope,
                  message: 'Olá! Gostaria de consultar horários e especialidades médicas.'
                },
                {
                  title: 'Exames',
                  description: 'Orientações, preparo e agendamento de exames.',
                  badge: '',
                  Icon: ClipboardCheck,
                  message: 'Olá! Gostaria de orientações e agendamento de exames.'
                },
                {
                  title: 'Atendimento pelo WhatsApp',
                  description: 'Fale com um de nossos atendentes pelo WhatsApp.',
                  badge: '',
                  Icon: Phone,
                  message: 'Olá! Gostaria de falar com um de nossos atendentes pelo WhatsApp.'
                },
                {
                  title: 'Tirar Dúvidas',
                  description: 'Esclarecimentos sobre prazos e funcionamento.',
                  badge: '',
                  Icon: HelpCircle,
                  message: 'Olá! Tenho algumas dúvidas e gostaria de ser atendido.'
                },
              ].map(({ title, description, badge, Icon, message }, index) => (
                <a
                  key={title}
                  className={`central-option ${index === 0 ? 'central-option-primary' : ''}`}
                  href={buildWhatsAppUrl(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="central-option-icon">
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <span className="central-option-content">
                    <span className="central-option-title">
                      {title}
                      {badge && <small>{badge}</small>}
                    </span>
                    <span className="central-option-description">{description}</span>
                  </span>
                  <ChevronRight size={20} className="central-option-arrow" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </>
        )}

        {isContact && <>
        {/* Attendant Header */}
        <header className="bio-attendant-card">
          <div className="bio-attendant-avatar-col">
            <div className="bio-attendant-avatar-ring">
              <img
                src={attendantPhoto}
                alt="Atendente"
                className="bio-attendant-img"
                width={70}
                height={70}
                referrerPolicy="no-referrer"
              />
              <span className="bio-attendant-pulse-ring" />
              <span className="bio-attendant-online-dot" />
            </div>
          </div>

          <div className="bio-attendant-info-col">
            <div className="bio-attendant-name-row">
              <h2>Atendente</h2>
              <span className="bio-attendant-badge">
                <CheckCircle2 className="w-3 h-3 text-[#25d366]" />
                Online
              </span>
            </div>
            <p className="bio-attendant-role">Central de Atendimento ao Cliente</p>
            <div className="bio-attendant-status-live">
              <span className="bio-live-dot" />
              <span>Pronta para responder via WhatsApp</span>
            </div>
          </div>
        </header>

        {/* Interactive Chat Conversation Section */}
        <section className="bio-chat-section" aria-label="Conversa com a Atendente">
          {/* Chat Bubble 1 */}
          {messageStep >= 1 ? (
            <div className="bio-bubble-wrapper fade-in-up">
              <div className="bio-bubble">
                <p className="bio-bubble-greeting">
                  {getGreeting()} Seja bem-vindo(a) ao canal de atendimento. 👋
                </p>
                <p className="bio-bubble-question">
                  Precisa de ajuda ou deseja tratar de algum assunto?
                </p>
                <div className="bio-bubble-meta">
                  <span className="bio-bubble-time">Agora</span>
                  <CheckCheck className="w-3.5 h-3.5 bio-check-icon" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bio-typing-indicator">
              <span className="bio-dot" />
              <span className="bio-dot" />
              <span className="bio-dot" />
              <span className="bio-typing-text">Atendente digitando...</span>
            </div>
          )}

          {/* Typing Indicator 2 */}
          {messageStep === 2 && (
            <div className="bio-typing-indicator fade-in">
              <span className="bio-dot" />
              <span className="bio-dot" />
              <span className="bio-dot" />
              <span className="bio-typing-text">Atendente digitando...</span>
            </div>
          )}

          {/* Chat Bubble 2 */}
          {messageStep >= 3 && (
            <div className="bio-bubble-wrapper fade-in-up">
              <div className="bio-bubble">
                <p className="bio-bubble-text">
                  Clique no botão abaixo para falar com um de nossos atendentes. Nossa equipe irá entender sua solicitação e direcionar você para o atendimento adequado.
                </p>
                <div className="bio-bubble-meta">
                  <span className="bio-bubble-time">Agora</span>
                  <CheckCheck className="w-3.5 h-3.5 bio-check-icon" />
                </div>
              </div>
            </div>
          )}

          {/* Clean, Beautiful WhatsApp Action Button */}
          {messageStep >= 3 && (
            <div className="bio-cta-container fade-in-up">
              <a
                href={buildWhatsAppUrl('Olá! Gostaria de falar com um atendente.')}
                target="_blank"
                rel="noopener noreferrer"
                className="bio-chat-action-btn"
              >
                <WhatsAppIcon className="w-5 h-5 bio-btn-icon" />
                <span>Falar com um atendente</span>
              </a>

              <span className="bio-chat-action-caption">
                Canal direto de atendimento via WhatsApp
              </span>
            </div>
          )}
        </section>

        </>}

        {/* Quick FAQ Dropdown */}
        <section className="bio-faq-card">
          <h2 className="bio-faq-title">
            <HelpCircle className="w-4 h-4 bio-faq-icon" />
            Dúvidas frequentes
          </h2>

          <div className="bio-faq-list">
            {faqs.filter((_, index) => isContact || index !== 2).map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className={`bio-faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="bio-faq-question"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 bio-faq-chevron ${isOpen ? 'rotate' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="bio-faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {!isContact && <a className="central-bottom-cta" href={buildWhatsAppUrl('Olá! Gostaria de ser atendido pela central de atendimento.')} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="central-whatsapp-icon" /> Abrir atendimento no WhatsApp</a>}

        {/* Institutional Section */}
        <footer className="bio-footer">
          <div className="bio-company-box">
            <div className="bio-company-header">
              <Building2 className="w-4 h-4 bio-company-icon" />
              <strong>Canal de Atendimento ao Cliente</strong>
            </div>
            <p className="bio-company-text">
              CNPJ: 54.914.613/0001-63
              <br />
              Rua Daniel Cerri, 1047 - Slj 1 - Jardim Paraná - São Paulo - SP - CEP: 02876-170
            </p>
            <div className="bio-company-hours">
              <Clock className="w-3.5 h-3.5 bio-company-clock" />
              <span>Horário Comercial: Segunda a Sexta das 08h às 18h | Sábado das 08h às 13h</span>
            </div>
          </div>

          <div className="bio-footer-links">
            <button
              type="button"
              className="bio-privacy-trigger"
              onClick={() => openModal('policy')}
            >
              Política de Atendimento
            </button>
            <span className="bio-dot-sep">•</span>
            <button
              type="button"
              className="bio-privacy-trigger"
              onClick={() => openModal('howItWorks')}
            >
              Como Funciona
            </button>
            <span className="bio-dot-sep">•</span>
            <button
              type="button"
              className="bio-privacy-trigger"
              onClick={() => openModal('terms')}
            >
              Termos de Uso
            </button>
            <span className="bio-dot-sep">•</span>
            <button
              type="button"
              className="bio-privacy-trigger"
              onClick={() => openModal('privacy')}
            >
              Política de Privacidade
            </button>
            <span className="bio-dot-sep">•</span>
            <a
              href={buildWhatsAppUrl('Olá! Gostaria de falar com o atendimento.')}
              target="_blank"
              rel="noopener noreferrer"
              className="bio-whatsapp-text-link"
            >
              {contactLabel}
            </a>
          </div>

          <p className="bio-copyright">
            © {new Date().getFullYear()} Central de Atendimento. Todos os direitos reservados.
          </p>
        </footer>
      </div>

      {/* Policies & Informational Modal Dialog for Google Ads Compliance */}
      <dialog
        id="info-modal"
        ref={modalDialogRef}
        aria-labelledby="modal-title"
        onClick={handleBackdropClick}
        className="bio-dialog"
      >
        <div className="bio-dialog-content">
          <div className="bio-dialog-header">
            <h2 id="modal-title">
              {activeModal === 'policy' && 'Política de Atendimento ao Cliente'}
              {activeModal === 'howItWorks' && 'Como Funciona o Atendimento'}
              {activeModal === 'terms' && 'Termos de Uso & Condições'}
              {activeModal === 'privacy' && 'Política de Privacidade & Dados'}
            </h2>
            <button
              className="bio-dialog-close"
              onClick={closeModal}
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bio-dialog-body">
            {activeModal === 'policy' && (
              <>
                <p className="bio-dialog-updated">Conformidade e Transparência • Atualizado em outubro de 2026.</p>

                <h3>Horário Oficial de Atendimento Comercial</h3>
                <p>
                  Nossa central opera nos seguintes horários para suporte humanizado em tempo real:
                  <br />
                  • <strong>Segunda a Sexta-feira:</strong> das 08h00 às 18h00 (horário de Brasília).
                  <br />
                  • <strong>Sábados:</strong> das 08h00 às 13h00.
                  <br />
                  • <strong>Domingos e Feriados:</strong> Mensagens enviadas fora do horário de atendimento são registradas em nosso sistema e respondidas na primeira hora útil do dia seguinte, em ordem cronológica de chegada.
                </p>

                <h3>Tempo Médio de Resposta</h3>
                <p>
                  Durante o horário comercial, o tempo médio de resposta no WhatsApp é de poucos minutos. Nossa equipe realiza a triagem inicial e encaminha você diretamente para o setor responsável pelo seu agendamento, consulta ou exame.
                </p>

                <h3>Gratuidade do Canal</h3>
                <p>
                  O acesso a esta página, o encaminhamento e o esclarecimento de dúvidas via WhatsApp são serviços inteiramente gratuitos para o cliente. Não cobramos taxas adicionais de atendimento.
                </p>

                <h3>Conformidade com Políticas do Google Ads e CDC</h3>
                <p>
                  Esta página atua como canal oficial de recepção e atendimento ao cliente da empresa identificada pelo CNPJ 54.914.613/0001-63, cumprindo integralmente as exigências de clareza, transparência comercial, ausência de alegações enganosas e proteção aos direitos do consumidor (Lei 8.078/1990).
                </p>

                <h3>Aviso Importante sobre Urgência Médica</h3>
                <p>
                  Este canal destina-se a triagem, informações, consultas e agendamentos eletivos. Em situações de emergência ou urgência médica imediata, procure o pronto-socorro mais próximo ou contate os serviços públicos de emergência (SAMU 192 ou Bombeiros 193).
                </p>
              </>
            )}

            {activeModal === 'howItWorks' && (
              <>
                <p className="bio-dialog-updated">Guia de Atendimento do Usuário.</p>

                <h3>1. Escolha o serviço desejado</h3>
                <p>
                  Selecione uma das opções disponíveis na página inicial: <strong>Agendamento</strong>, <strong>Consultas</strong>, <strong>Exames</strong>, <strong>Atendimento pelo WhatsApp</strong> ou <strong>Tirar Dúvidas</strong>. Cada botão já possui uma mensagem inicial configurada para agilizar sua conversa.
                </p>

                <h3>2. Abertura segura no WhatsApp</h3>
                <p>
                  Ao tocar no botão, seu aplicativo oficial do WhatsApp (no celular) ou o WhatsApp Web (no computador) será aberto com conexão direta a um de nossos atendentes ativos.
                </p>

                <h3>3. Triagem e direcionamento humanizado</h3>
                <p>
                  O atendente entenderá sua necessidade (verificação de horários, locais de atendimento, preparo de exames ou esclarecimento de procedimentos) e dará continuidade ao seu pedido com agilidade e cordialidade.
                </p>

                <h3>4. Segurança e sigilo</h3>
                <p>
                  Nenhum pagamento, senha de cartão ou dado sensível é solicitado nesta página. Suas conversas no WhatsApp contam com criptografia de ponta a ponta.
                </p>
              </>
            )}

            {activeModal === 'terms' && (
              <>
                <p className="bio-dialog-updated">Termos de Uso do Serviço.</p>

                <h3>Identificação do Prestador</h3>
                <p>
                  Canal de Atendimento ao Cliente, operado sob o CNPJ 54.914.613/0001-63, localizado na Rua Daniel Cerri, 1047, Slj 1, Jardim Paraná, São Paulo - SP, CEP 02876-170.
                </p>

                <h3>Condições de Acesso</h3>
                <p>
                  O uso deste canal é voluntário e gratuito. O usuário concorda em utilizar as opções de contato de forma lícita, fornecendo dados verídicos quando solicitados pelos atendentes para a devida localização de seus registros ou marcação de consultas.
                </p>

                <h3>Disponibilidade Técnica</h3>
                <p>
                  Empregamos esforços razoáveis para manter a página disponível ininterruptamente, dependendo, contudo, da estabilidade dos serviços de telecomunicações e da plataforma de terceiros (WhatsApp).
                </p>
              </>
            )}

            {activeModal === 'privacy' && (
              <>
                <p className="bio-dialog-updated">Atualizada conforme a LGPD (Lei nº 13.709/2018).</p>

                <h3>Responsável e contato</h3>
                <p>
                  CNPJ 54.914.613/0001-63, Rua Daniel Cerri, 1047, Slj 1, Jardim Paraná, São Paulo - SP, CEP 02876-170.
                  Para questões sobre privacidade e dados, entre em contato pelo canal de WhatsApp disponível nesta página.
                </p>

                <h3>Uso deste site</h3>
                <p>
                  Esta página apresenta canais diretos de contato e atendimento ao cliente. Não possui formulário invasivo, cadastro obrigatório ou ferramenta de pagamento. Este site utiliza o Google Tag Manager para medições estatísticas anônimas de desempenho.
                </p>

                <h3>Contato pelo WhatsApp</h3>
                <p>
                  Ao clicar em qualquer botão de atendimento, você acessa uma plataforma externa protegida por criptografia de ponta a ponta. As informações que você optar por enviar na conversa serão utilizadas exclusivamente para compreender e atender sua solicitação.
                </p>

                <h3>Direitos do Titular</h3>
                <p>
                  Você pode solicitar informações sobre o tratamento de seus dados e exercer seus direitos legais (acesso, correção, eliminação) através do nosso canal oficial de atendimento.
                </p>
              </>
            )}
          </div>

          <div className="bio-dialog-footer">
            <button type="button" className="bio-dialog-ok-btn" onClick={closeModal}>
              Entendi e concordo
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
