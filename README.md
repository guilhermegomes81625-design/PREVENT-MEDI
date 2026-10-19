# PREVENT-MEDI

Site em https://prevent-medi.com e painel administrativo em `/painel`.

## Atendentes

O painel usa a API `/api/*` e o banco D1 `prevent-medi-atendentes`, vinculado como `PANEL_DB` em `wrangler.jsonc`. Nome, telefone e status são salvos no banco; não é necessário novo deploy para alterar atendentes. A senha é validada no servidor e sua representação com salt fica somente no banco. Sessões usam cookies HttpOnly, Secure e SameSite=Strict. Não colocar senhas no código ou em variáveis `VITE_*`.

Adicionar, editar, pausar, continuar e excluir só entram em vigor após **Salvar alterações**. Uma versão de edição evita sobrescrever mudanças de outra sessão. Quando não existem números ativos, a API não retorna um destino de WhatsApp.

Cada clique consulta o banco sem cache. Um contador atômico distribui os atendimentos em rodízio entre os ativos. O link original permanece `https://wa.me/...` durante o evento de clique para manter o acionador do GTM-PK8Z3R7T. Não adicionar um segundo disparo manual de conversão.

## Publicação

Commits na branch `main` disparam o projeto Cloudflare Pages `prevent-medi-auto`. O Worker em `public/_worker.js` atende somente `/api/*`; o restante continua sendo servido como arquivos estáticos. `public/_routes.json` limita a execução da API. O GTM não é carregado na tela administrativa.

O banco remoto já foi inicializado. `schema.sql` documenta as tabelas, mas não contém a senha nem deve substituir os registros existentes. Não recriar ou reinicializar o banco em novos deploys. As alterações do painel persistem entre publicações.

## Desenvolvimento e teste

```sh
npm ci
npm run build
npm run lint
npx wrangler pages dev dist --port 4185
```

O banco local é separado e precisa ser inicializado para testes. O painel e o rodízio dependem do Worker; o preview simples do Vite/AI Studio não executa o backend Cloudflare. Validar essas funções em `wrangler pages dev` ou no domínio publicado.

O teste de API pode ser executado com `PANEL_TEST_PASSWORD` e `PANEL_TEST_URL` apontando para o ambiente local. Ele altera e restaura a lista de atendentes; não executar contra produção durante atendimento.
