import React, { useState, useRef } from 'react';
import {
  MessageSquare,
  Users,
  Layers,
  Headphones,
  HelpCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Clock,
  Building2,
  Phone,
  ShieldCheck,
  X
} from 'lucide-react';

const WHATSAPP_PHONE = '5511965589793';

function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

interface BioLink {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  isFeatured?: boolean;
  icon: React.ReactNode;
  message: string;
  colorTheme?: 'green' | 'blue' | 'featured';
}

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const privacyDialogRef = useRef<HTMLDialogElement>(null);

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

  const bioLinks: BioLink[] = [
    {
      id: 'atendimento',
      title: 'Atendimento ao Cliente',
      subtitle: 'Inicie sua conversa com nosso time de atendimento',
      badge: 'Principal',
      isFeatured: true,
      icon: <MessageSquare className="w-5 h-5 text-white" />,
      message: 'Olá! Gostaria de iniciar meu atendimento com a PREVENT+MEDI.',
      colorTheme: 'featured',
    },
    {
      id: 'equipe',
      title: 'Falar com a Equipe',
      subtitle: 'Conecte-se com nossos consultores especializados',
      badge: 'Disponível',
      icon: <Users className="w-5 h-5 text-[#39891d]" />,
      message: 'Olá! Quero falar diretamente com a equipe da PREVENT+MEDI.',
      colorTheme: 'green',
    },
    {
      id: 'planos',
      title: 'Sobre Planos & Valores',
      subtitle: 'Consulte modalidades, coberturas e novas adesões',
      badge: 'Mais buscado',
      icon: <Layers className="w-5 h-5 text-[#064fbd]" />,
      message: 'Olá! Gostaria de informações detalhadas sobre os planos da PREVENT+MEDI.',
      colorTheme: 'blue',
    },
    {
      id: 'agendamentos',
      title: 'Agendamentos & Orientações',
      subtitle: 'Consulte horários, especialidades e rede de atendimento',
      icon: <CalendarCheck className="w-5 h-5 text-[#39891d]" />,
      message: 'Olá! Gostaria de orientações sobre agendamentos e horários na PREVENT+MEDI.',
      colorTheme: 'green',
    },
    {
      id: 'suporte',
      title: 'Suporte & Solicitações',
      subtitle: 'Acompanhamento de pedidos e auxílio direto',
      icon: <Headphones className="w-5 h-5 text-[#064fbd]" />,
      message: 'Olá! Preciso de suporte ao cliente e orientações sobre uma solicitação na PREVENT+MEDI.',
      colorTheme: 'blue',
    },
    {
      id: 'duvidas',
      title: 'Tirar Dúvidas',
      subtitle: 'Esclarecimentos rápidos sobre o funcionamento',
      icon: <HelpCircle className="w-5 h-5 text-[#39891d]" />,
      message: 'Olá! Tenho algumas dúvidas e gostaria de ser orientado pela PREVENT+MEDI.',
      colorTheme: 'green',
    },
    {
      id: 'ouvidoria',
      title: 'Ouvidoria & SAC',
      subtitle: 'Canal para elogios, sugestões e registros',
      icon: <ShieldCheck className="w-5 h-5 text-[#064fbd]" />,
      message: 'Olá! Gostaria de falar com o canal de Ouvidoria / SAC da PREVENT+MEDI.',
      colorTheme: 'blue',
    },
  ];

  const faqs = [
    {
      q: 'Como funciona o atendimento pelo WhatsApp?',
      a: 'Basta tocar em qualquer um dos botões acima. Você será direcionado para o aplicativo do WhatsApp com uma mensagem inicial já pronta, bastando enviar para iniciar a conversa com a nossa central.',
    },
    {
      q: 'Qual é o horário e tempo de resposta?',
      a: 'Nossa equipe atende de segunda a sábado em horário comercial. As mensagens são respondidas em ordem de recebimento com tempo médio de atendimento inferior a 2 minutos.',
    },
    {
      q: 'Posso acessar pelo computador?',
      a: 'Sim! Ao clicar nos botões através do computador, o link abrirá automaticamente o WhatsApp Web ou o aplicativo desktop.',
    },
    {
      q: 'Quem é a empresa responsável?',
      a: 'A PREVENT+MEDI é inscrita no CNPJ 17.985.717/0001-32.',
    },
  ];

  return (
    <div className="bio-page-wrapper">
      {/* Background ambient lighting */}
      <div className="bio-glow-1" aria-hidden="true" />
      <div className="bio-glow-2" aria-hidden="true" />

      <div className="bio-container">
        {/* Profile Card Header */}
        <header className="bio-profile-header">
          <div className="bio-avatar-wrapper">
            <div className="bio-avatar-ring">
              <img
                src="/assets/logo.png"
                alt="Logo PREVENT+MEDI"
                className="bio-avatar-img"
                width={96}
                height={96}
              />
            </div>
            <div className="bio-status-badge" title="Atendimento Online">
              <span className="bio-status-pulse"></span>
              <span className="bio-status-dot"></span>
            </div>
          </div>

          <div className="bio-brand-title">
            <h1>
              PREVENT<span className="green-accent">+MEDI</span>
            </h1>
            <div className="bio-verified-tag">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#39891d]" />
              <span>Atendimento ao Cliente</span>
            </div>
          </div>

          <p className="bio-bio-text">
            Central de atendimento direto pelo WhatsApp. Escolha uma das opções abaixo para iniciar sua conversa com a PREVENT+MEDI:
          </p>

          {/* Status pill */}
          <div className="bio-status-bar">
            <div className="bio-status-item">
              <Clock className="w-3.5 h-3.5 text-[#25d366]" />
              <span>Resposta Rápida</span>
            </div>
            <span className="bio-status-divider">•</span>
            <div className="bio-status-item">
              <Phone className="w-3.5 h-3.5 text-[#064fbd]" />
              <span>(11) 96558-9793</span>
            </div>
          </div>
        </header>

        {/* Buttons List */}
        <section className="bio-links-section" aria-label="Links de Atendimento no WhatsApp">
          {bioLinks.map((link) => (
            <a
              key={link.id}
              href={buildWhatsAppUrl(link.message)}
              target="_blank"
              rel="noopener noreferrer"
              className={`bio-card-link ${link.isFeatured ? 'is-featured' : ''} theme-${link.colorTheme || 'default'}`}
            >
              <div className="bio-card-icon-box">
                {link.icon}
              </div>

              <div className="bio-card-content">
                <div className="bio-card-header">
                  <span className="bio-card-title">{link.title}</span>
                  {link.badge && (
                    <span className="bio-card-badge">{link.badge}</span>
                  )}
                </div>
                <span className="bio-card-sub">{link.subtitle}</span>
              </div>

              <div className="bio-card-arrow" aria-hidden="true">
                <ChevronRight className="w-5 h-5" />
              </div>
            </a>
          ))}
        </section>

        {/* Quick FAQ Dropdown */}
        <section className="bio-faq-card">
          <h2 className="bio-faq-title">
            <HelpCircle className="w-4 h-4 text-[#064fbd]" />
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
              <Building2 className="w-4 h-4 text-[#064fbd]" />
              <strong>PREVENT+MEDI</strong>
            </div>
            <p className="bio-company-text">
              CNPJ: 17.985.717/0001-32
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
              href={buildWhatsAppUrl('Olá! Gostaria de falar com o atendimento da PREVENT+MEDI.')}
              target="_blank"
              rel="noopener noreferrer"
              className="bio-whatsapp-text-link"
            >
              WhatsApp: (11) 96558-9793
            </a>
          </div>

          <p className="bio-copyright">
            © {new Date().getFullYear()} PREVENT+MEDI. Todos os direitos reservados.
          </p>
        </footer>
      </div>

      {/* Persistent Floating WhatsApp Action Button */}
      <a
        href={buildWhatsAppUrl('Olá! Gostaria de ser atendido pela PREVENT+MEDI!')}
        target="_blank"
        rel="noopener noreferrer"
        className="bio-floating-btn"
        aria-label="Abrir atendimento no WhatsApp"
      >
        <span className="bio-floating-ping" />
        <svg viewBox="0 0 32 32" className="bio-floating-icon" aria-hidden="true">
          <path
            d="M16 3a13 13 0 0 0-11 20L3 29l6.2-1.8A13 13 0 1 0 16 3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path
            d="M11 9c-1 0-2 2-2 3 0 4 6 10 10 10 2 0 4-2 3-3l-3-2-2 2c-2-1-4-3-5-5l2-2-2-3Z"
            fill="currentColor"
          />
        </svg>
      </a>

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
            <p className="bio-dialog-updated">Atualizada em 16 de outubro de 2026.</p>

            <h3>Responsável e contato</h3>
            <p>
              PREVENT+MEDI, CNPJ 17.985.717/0001-32.
              Para questões sobre privacidade e dados, entre em contato pelo WhatsApp (11) 96558-9793.
            </p>

            <h3>Uso deste site</h3>
            <p>
              Esta página apresenta os serviços e canais de contato da PREVENT+MEDI.
              Não possui formulário invasivo, cadastro obrigatório ou ferramenta de pagamento.
              Esta versão não instala cookies de publicidade ou ferramentas de análise indesejadas.
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
