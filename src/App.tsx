import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Building2,
  ShieldCheck,
  CheckCheck,
  HelpCircle,
  X
} from 'lucide-react';

const WHATSAPP_PHONE = '5511918397149';

function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

// Official WhatsApp Logo
function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/'
  );
  const [messageStep, setMessageStep] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const privacyDialogRef = useRef<HTMLDialogElement>(null);

  const isContact = currentPath.replace(/\/+$/, '') === '/contato';

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

  const openPrivacy = () => {
    privacyDialogRef.current?.showModal();
  };

  const closePrivacy = () => {
    privacyDialogRef.current?.close();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === privacyDialogRef.current) {
      const r = privacyDialogRef.current.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      ) {
        privacyDialogRef.current.close();
      }
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

  // Professional attendant photo
  const attendantPhoto =
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';

  return (
    <div className={`bio-page-wrapper ${isContact ? 'theme-medi-page' : 'theme-prevent-page'}`}>
      {/* Background ambient lighting */}
      <div className="bio-glow-1" aria-hidden="true" />
      <div className="bio-glow-2" aria-hidden="true" />

      <div className="bio-container">
        {/* Virtual Attendant Header */}
        <header className="bio-attendant-card">
          <div className="bio-attendant-avatar-col">
            <div className="bio-attendant-avatar-ring">
              <img
                src={attendantPhoto}
                alt="Atendente Virtual"
                className="bio-attendant-img"
                width={70}
                height={70}
              />
              <span className="bio-attendant-pulse-ring" />
              <span className="bio-attendant-online-dot" />
            </div>
          </div>

          <div className="bio-attendant-info-col">
            <div className="bio-attendant-name-row">
              <h2>Atendente Virtual</h2>
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
        <section className="bio-chat-section" aria-label="Conversa com a Atendente Virtual">
          {/* Chat Bubble 1 */}
          {messageStep >= 1 ? (
            <div className="bio-bubble-wrapper fade-in-up">
              <div className="bio-bubble">
                <p className="bio-bubble-greeting">
                  Olá! Seja bem-vindo(a) ao canal de atendimento. 👋
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

        {/* Quick FAQ Dropdown */}
        <section className="bio-faq-card">
          <h2 className="bio-faq-title">
            <HelpCircle className="w-4 h-4 bio-faq-icon" />
            Dúvidas frequentes
          </h2>

          <div className="bio-faq-list">
            {faqs.map((faq, index) => {
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
              Rua Daniel Cerri, 1047 - Slj 1
              <br />
              Jardim Paraná - São Paulo - SP
              <br />
              CEP: 02876-170
            </p>
          </div>

          <div className="bio-footer-links">
            <button
              type="button"
              className="bio-privacy-trigger"
              onClick={openPrivacy}
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
              WhatsApp: (11) 91839-7149
            </a>
          </div>

          <p className="bio-copyright">
            © {new Date().getFullYear()} Central de Atendimento. Todos os direitos reservados.
          </p>
        </footer>
      </div>

      {/* Privacy Policy Modal Dialog */}
      <dialog
        id="privacy"
        ref={privacyDialogRef}
        aria-labelledby="privacy-title"
        onClick={handleBackdropClick}
        className="bio-dialog"
      >
        <div className="bio-dialog-content">
          <div className="bio-dialog-header">
            <h2 id="privacy-title">Política de Privacidade</h2>
            <button
              className="bio-dialog-close"
              onClick={closePrivacy}
              aria-label="Fechar política de privacidade"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bio-dialog-body">
            <p className="bio-dialog-updated">Atualizada em 19 de outubro de 2026.</p>

            <h3>Responsável e contato</h3>
            <p>
              CNPJ 54.914.613/0001-63, Rua Daniel Cerri, 1047, Slj 1, Jardim Paraná, São Paulo - SP, CEP 02876-170.
              Para questões sobre privacidade e dados, entre em contato pelo WhatsApp (11) 91839-7149.
            </p>

            <h3>Uso deste site</h3>
            <p>
              Esta página apresenta canais diretos de contato e atendimento ao cliente.
              Não possui formulário invasivo, cadastro obrigatório ou ferramenta de pagamento.
              Este site utiliza o Google Tag Manager para gerenciar tags de medição. As informações coletadas dependem das tags configuradas e podem incluir dados de navegação e interações no site.
            </p>

            <h3>Contato pelo WhatsApp</h3>
            <p>
              Ao clicar em qualquer botão de atendimento, você acessa uma plataforma externa.
              O número de telefone, o perfil e as informações que você optar por enviar na conversa
              poderão ser utilizados pela empresa para compreender e responder à sua solicitação e dar
              continuidade ao atendimento. Compartilhe apenas os dados necessários, evitando senhas e informações sensíveis.
            </p>
            <p>
              O WhatsApp possui suas próprias regras e política de privacidade. A mensagem sugerida
              somente é enviada após sua ação na plataforma.
            </p>

            <h3>Serviços externos e registros técnicos</h3>
            <p>
              Os servidores de hospedagem podem receber dados técnicos básicos, como endereço IP,
              navegador e registros de acesso, necessários à entrega segura dos arquivos. Esta página não solicita sua localização precisa.
            </p>

            <h3>Solicitações sobre seus dados</h3>
            <p>
              Use o contato informado para solicitar informações sobre o tratamento de seus dados
              e exercer seus direitos aplicáveis, incluindo acesso, correção e exclusão, observadas as
              obrigações legais pertinentes.
            </p>
          </div>

          <div className="bio-dialog-footer">
            <button type="button" className="bio-dialog-ok-btn" onClick={closePrivacy}>
              Entendi e concordo
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
