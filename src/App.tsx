import { useEffect, useRef } from 'react';

export default function App() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openPrivacy = () => {
    dialogRef.current?.showModal();
  };

  const closePrivacy = () => {
    dialogRef.current?.close();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      const r = dialogRef.current.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      ) {
        dialogRef.current.close();
      }
    }
  };

  useEffect(() => {
    const yearEl = document.querySelector('#year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear().toString();
    }
  }, []);

  const whatsappUrl =
    'https://wa.me/5511965589793?text=Ol%C3%A1%20Gostaria%20de%20ser%20atendido%21';

  return (
    <>
      <header>
        <div className="container header">
          <a className="brand" href="#inicio" aria-label="PREVENT-MEDI, início">
            <img src="/assets/logo.png" alt="" width={56} height={56} />
            <span>
              PREVENT<span className="green">-MEDI</span>
              <small>ATENDIMENTO AO CLIENTE</small>
            </span>
          </a>
          <nav aria-label="Navegação principal">
            <a href="#atendimento">Atendimento</a>
            <a href="#sobre">Sobre nós</a>
            <a href="#duvidas">Dúvidas</a>
          </nav>
          <a
            className="button compact whatsapp"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Falar no WhatsApp <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">
                <i></i> PESSOAS CONECTADAS A PESSOAS
              </span>
              <h1>
                Uma boa conversa
                <br />
                faz toda a <em>diferença.</em>
              </h1>
              <p>
                Atendimento ao cliente com atenção ao que você precisa. Tire
                dúvidas, solicite informações e converse com a PREVENT-MEDI em um
                canal direto pelo WhatsApp.
              </p>
              <a
                className="button whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Quero ser atendido <span aria-hidden="true">↗</span>
              </a>
              <span className="micro">Você será direcionado ao WhatsApp.</span>
              <div className="hero-notes">
                <span>✓ Contato direto</span>
                <span>✓ Atendimento ao cliente</span>
                <span>✓ Pelo celular ou computador</span>
              </div>
            </div>
            <div className="hero-visual">
              <img
                className="main-photo"
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&amp;fit=crop&amp;w=1100&amp;q=85"
                width={900}
                height={1000}
                alt="Profissionais conversando em um ambiente de trabalho moderno — imagem ilustrativa"
                fetchPriority="high"
              />
              <div className="photo-label">CONEXÃO QUE APROXIMA</div>
              <div className="conversation">
                <span className="bubble-icon" aria-hidden="true">
                  ☏
                </span>
                <div>
                  <strong>Vamos conversar?</strong>
                  <span>Sua próxima conversa começa aqui.</span>
                </div>
                <span className="dot" aria-hidden="true"></span>
              </div>
              <span className="image-caption">Imagem ilustrativa</span>
            </div>
          </div>
        </section>

        <div className="principles">
          <div className="container">
            <span>ATENÇÃO EM CADA CONVERSA</span>
            <strong>Clareza nas informações</strong>
            <strong>Respeito ao cliente</strong>
            <strong>Contato descomplicado</strong>
          </div>
        </div>

        <section className="section" id="atendimento">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow blue">COMO PODEMOS AJUDAR</span>
                <h2>
                  O atendimento começa
                  <br />
                  com você.
                </h2>
              </div>
              <p>
                Escolha o que precisa e conte sua solicitação. Nossa central
                recebe seu contato pelo WhatsApp para entender o assunto e
                orientar o atendimento.
              </p>
            </div>
            <div className="cards">
              <article className="card">
                <span className="card-icon" aria-hidden="true">
                  ✳
                </span>
                <span className="number">01</span>
                <h3>Dúvidas e informações</h3>
                <p>
                  Quer entender melhor nossos canais de atendimento? Converse
                  com a central e apresente suas dúvidas antes de seguir com sua
                  solicitação.
                </p>
                <a
                  className="text-link whatsapp"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tirar uma dúvida <span aria-hidden="true">↗</span>
                </a>
              </article>
              <article className="card featured">
                <span className="card-icon" aria-hidden="true">
                  ☏
                </span>
                <span className="number">02</span>
                <h3>Atendimento ao cliente</h3>
                <p>
                  Fale sobre o motivo do seu contato. A conversa permite
                  compreender sua necessidade e informar as possibilidades de
                  atendimento.
                </p>
                <a
                  className="text-link whatsapp"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com o atendimento <span aria-hidden="true">↗</span>
                </a>
              </article>
              <article className="card">
                <span className="card-icon" aria-hidden="true">
                  ↗
                </span>
                <span className="number">03</span>
                <h3>Solicitações e orientação</h3>
                <p>
                  Encaminhe seu pedido com uma breve descrição. A central poderá
                  orientar os próximos passos conforme o assunto apresentado.
                </p>
                <a
                  className="text-link whatsapp"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar uma solicitação <span aria-hidden="true">↗</span>
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className="section about" id="sobre">
          <div className="container about-grid">
            <div className="about-visual">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&amp;fit=crop&amp;w=1000&amp;q=80"
                width={900}
                height={750}
                alt="Pessoas colaborando em um escritório — imagem ilustrativa"
                loading="lazy"
              />
              <div className="about-stamp">
                Por trás de cada contato,
                <br />
                <strong>uma pessoa.</strong>
              </div>
              <span className="image-caption">Imagem ilustrativa</span>
            </div>
            <div>
              <span className="eyebrow blue">CONHEÇA A PREVENT-MEDI</span>
              <h2>
                Mais proximidade.
                <br />
                Mais clareza no atendimento.
              </h2>
              <p>
                A PREVENT-MEDI é a marca apresentada neste site para os serviços
                de call center e atendimento ao cliente da{' '}
                <strong>AG CALL CENTER SERVICOS DE TELEMARKETING LTDA</strong>,
                inscrita no CNPJ 17.985.717/0001-32.
              </p>
              <p>
                Nosso canal de contato recebe dúvidas, pedidos de informações e
                solicitações. Ao iniciar a conversa, explique o que você precisa
                para que o atendimento possa compreender seu pedido.
              </p>
              <div className="about-list">
                <span>✓ Informações da empresa acessíveis</span>
                <span>✓ Canal de contato identificado</span>
                <span>✓ Conversa iniciada por você</span>
              </div>
              <a
                className="button dark whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Conversar com a PREVENT-MEDI <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        <section className="section steps">
          <div className="container">
            <span className="eyebrow blue">SIMPLES, DO INÍCIO AO CONTATO</span>
            <h2>A poucos passos de uma conversa.</h2>
            <div className="step-grid">
              <article>
                <span>01</span>
                <h3>Clique em um botão</h3>
                <p>
                  Use qualquer botão de atendimento deste site para abrir nosso
                  número no WhatsApp.
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>Envie sua mensagem</h3>
                <p>
                  A mensagem “Olá Gostaria de ser atendido!” estará pronta.
                  Revise e toque em enviar.
                </p>
              </article>
              <article>
                <span>03</span>
                <h3>Conte o que precisa</h3>
                <p>
                  Descreva sua dúvida ou solicitação. O atendimento acontece na
                  conversa do WhatsApp.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section faq" id="duvidas">
          <div className="container faq-grid">
            <div>
              <span className="eyebrow blue">PERGUNTAS FREQUENTES</span>
              <h2>
                Antes de começar,
                <br />
                tire suas dúvidas.
              </h2>
              <p>Informações para você entrar em contato com mais clareza.</p>
              <a
                className="text-link whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tenho outra dúvida <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div>
              <details open>
                <summary>Como falar com a PREVENT-MEDI?</summary>
                <p>
                  Clique em “Quero ser atendido” ou em outro botão de WhatsApp.
                  Você será direcionado ao número (11) 96558-9793. A mensagem só
                  será enviada quando você confirmar o envio no WhatsApp.
                </p>
              </details>
              <details>
                <summary>Quais assuntos posso encaminhar?</summary>
                <p>
                  Você pode apresentar dúvidas, pedir informações sobre o
                  atendimento e encaminhar solicitações. Explique o motivo do
                  contato para receber orientação sobre os próximos passos e o
                  escopo disponível.
                </p>
              </details>
              <details>
                <summary>Posso acessar pelo computador?</summary>
                <p>
                  Sim. O link abre o WhatsApp e permite continuar pelo aplicativo
                  ou pelo WhatsApp Web, conforme a disponibilidade e a
                  configuração do seu dispositivo.
                </p>
              </details>
              <details>
                <summary>O atendimento é automático ou imediato?</summary>
                <p>
                  Os botões apenas abrem o canal de contato. Este site não
                  confirma disponibilidade em tempo real nem garante resposta
                  imediata. Consulte os horários e a disponibilidade diretamente
                  na conversa.
                </p>
              </details>
              <details>
                <summary>Quem é responsável por este site?</summary>
                <p>
                  A empresa identificada é AG CALL CENTER SERVICOS DE
                  TELEMARKETING LTDA, CNPJ 17.985.717/0001-32. Os dados de
                  contato e endereço estão disponíveis no rodapé.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container final-cta">
            <div>
              <span className="eyebrow">SEU PRÓXIMO PASSO É UMA CONVERSA</span>
              <h2>Como podemos ajudar você hoje?</h2>
              <p>Entre em contato com a PREVENT-MEDI pelo WhatsApp.</p>
            </div>
            <a
              className="button whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Iniciar atendimento <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-grid">
          <div>
            <a className="brand" href="#inicio">
              <img
                src="/assets/logo.png"
                alt="Logo PREVENT-MEDI"
                width={60}
                height={60}
              />
              <span>
                PREVENT-MEDI<small>ATENDIMENTO AO CLIENTE</small>
              </span>
            </a>
            <p>
              Conectando pessoas por meio
              <br />
              de um atendimento mais próximo.
            </p>
          </div>
          <div>
            <h3>Informações da empresa</h3>
            <p>
              AG CALL CENTER SERVICOS DE TELEMARKETING LTDA
              <br />
              CNPJ: 17.985.717/0001-32
            </p>
            <p>
              Rua Conselheiro Brotero, 206, Andar 3<br />
              Barra Funda, São Paulo – SP
              <br />
              CEP 01154-000
            </p>
          </div>
          <div>
            <h3>Fale com a gente</h3>
            <a
              className="footer-contact whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp: (11) 96558-9793 ↗
            </a>
            <p>
              Consulte a disponibilidade de atendimento
              <br />
              diretamente pelo nosso canal.
            </p>
            <button
              className="privacy-link"
              id="open-privacy"
              onClick={openPrivacy}
            >
              Política de privacidade
            </button>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © <span id="year">2026</span> PREVENT-MEDI. Todos os direitos
            reservados.
          </span>
          <span>Call center e atendimento ao cliente.</span>
        </div>
      </footer>

      <a
        className="floating whatsapp"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir atendimento da PREVENT-MEDI no WhatsApp"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path
            d="M16 3a13 13 0 0 0-11 20L3 29l6.2-1.8A13 13 0 1 0 16 3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M11 9c-1 0-2 2-2 3 0 4 6 10 10 10 2 0 4-2 3-3l-3-2-2 2c-2-1-4-3-5-5l2-2-2-3Z"
            fill="currentColor"
          />
        </svg>
      </a>

      <div className="mobile-cta">
        <a
          className="button whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Falar no WhatsApp <span aria-hidden="true">↗</span>
        </a>
      </div>

      <dialog
        id="privacy"
        ref={dialogRef}
        aria-labelledby="privacy-title"
        onClick={handleBackdropClick}
      >
        <button
          className="close"
          id="close-privacy"
          aria-label="Fechar política de privacidade"
          onClick={closePrivacy}
        >
          ×
        </button>
        <h2 id="privacy-title">Política de privacidade</h2>
        <p>Atualizada em 16 de outubro de 2026.</p>
        <h3>Responsável e contato</h3>
        <p>
          AG CALL CENTER SERVICOS DE TELEMARKETING LTDA, CNPJ 17.985.717/0001-32,
          Rua Conselheiro Brotero, 206, Andar 3, Barra Funda, São Paulo – SP, CEP
          01154-000. Para questões sobre privacidade e seus dados, entre em
          contato pelo WhatsApp (11) 96558-9793.
        </p>
        <h3>Uso deste site</h3>
        <p>
          Esta página apresenta os serviços e os dados de contato da
          PREVENT-MEDI. Não possui formulário, cadastro, área de login ou
          ferramenta de pagamento. Esta versão não instala cookies de publicidade
          ou ferramentas de análise.
        </p>
        <h3>Contato pelo WhatsApp</h3>
        <p>
          Ao clicar em um botão de atendimento, você acessa uma plataforma
          externa. O número de telefone, o perfil e as informações que você optar
          por enviar na conversa poderão ser utilizados pela empresa para
          compreender e responder à sua solicitação e dar continuidade ao
          atendimento. Compartilhe apenas os dados necessários, evitando senhas e
          informações sensíveis.
        </p>
        <p>
          O WhatsApp possui suas próprias regras e política de privacidade. A
          mensagem sugerida somente é enviada após sua ação na plataforma.
        </p>
        <h3>Serviços externos e registros técnicos</h3>
        <p>
          As fotografias ilustrativas são carregadas de images.unsplash.com. O
          provedor de hospedagem e os servidores de imagens podem receber dados
          técnicos, como endereço IP, navegador e registros de acesso,
          necessários à entrega dos arquivos. Esta página não solicita sua
          localização precisa.
        </p>
        <h3>Solicitações sobre seus dados</h3>
        <p>
          Use o contato informado para solicitar informações sobre o tratamento de
          seus dados e exercer seus direitos aplicáveis, incluindo acesso,
          correção e exclusão, observadas as obrigações de conservação pertinentes.
          O site não coleta diretamente dados da conversa nem define um prazo
          automático de exclusão de mensagens.
        </p>
      </dialog>
    </>
  );
}
