# Site V2 Digio

Site institucional da Digio. Monorepo pnpm com dois projetos separados:

| Projeto                                           | O que é                                                    | Porta local |
| ------------------------------------------------- | ---------------------------------------------------------- | ----------- |
| [apps/cms](apps/cms/)                             | Payload CMS 3 (admin e API REST). Único que acessa o banco | 3001        |
| [apps/web](apps/web/)                             | Site público em Next.js. Lê o conteúdo pela API do CMS     | 3000        |
| [packages/payload-types](packages/payload-types/) | Tipos gerados pelo Payload, usados pelos dois              | –           |

Contexto do projeto: [CLAUDE.md](CLAUDE.md) e [docs/](docs/). Usuários e senhas do ambiente local: [docs/usuarios-locais.md](docs/usuarios-locais.md). Redirects, importação CSV e validação de URLs: [docs/redirects.md](docs/redirects.md). Migração do blog: [docs/migracao-blog.md](docs/migracao-blog.md). Revisão de segurança, correções e pendências: [docs/seguranca.md](docs/seguranca.md). Referência do template original: [README.payload-template.md](README.payload-template.md).

## Como os dois conversam

```
navegador ──► web (Next.js) ──REST──► cms (Payload) ──► Postgres
    │              ▲                       │
    │              └── webhook de revalidação (ao publicar)
    └──────────────────► storage de mídia (MinIO / CDN) ◄── uploads do cms
```

- **Conteúdo:** o site busca pela API REST do CMS ([apps/web/src/lib/cms.ts](apps/web/src/lib/cms.ts)) e guarda em cache com tags.
- **Publicação:** os hooks do CMS chamam `POST /api/revalidate/` no site, que invalida as páginas e tags afetadas ([apps/cms/src/utilities/revalidateWeb.ts](apps/cms/src/utilities/revalidateWeb.ts)).
- **Mídia:** as imagens saem direto do storage (`MEDIA_PUBLIC_URL`), sem passar pelo CMS.
- **Se o CMS cair:** o site continua servindo as páginas e os dados em cache.
- **Build:** o site não precisa do CMS para gerar o build. As páginas são geradas no primeiro acesso (ISR).
- **Preview:** o admin abre `/next/preview/` no site, que ativa o draft mode. Os rascunhos são lidos com a API key de um usuário de serviço (`CMS_API_KEY`).
- **Live preview:** o admin mostra o site num iframe e, a cada salvamento automático do rascunho, o site refaz a página (`RefreshRouteOnSave`). Só funciona se o iframe entrar em draft mode, e para isso o cookie `__prerender_bypass` precisa chegar ao site. Em desenvolvimento o Next envia esse cookie como `SameSite=Lax`, e o navegador o descarta quando o admin (`localhost:3001`) e o site da propriedade (`campanha.localhost:3000`) são sites diferentes. Por isso a rota [apps/web/src/app/(frontend)/next/preview/route.ts](<apps/web/src/app/(frontend)/next/preview/route.ts>) reenvia o cookie como `SameSite=None; Secure` fora de produção (em produção o Next já faz isso). Se o preview continuar sem atualizar: abra o admin exatamente em `http://localhost:3001` (é a origem que o `serverURL` aceita), use um navegador que aceite cookies de terceiros em `*.localhost` (Safari não aceita `Secure` em http) e confira no console se aparece algum erro. O botão **Reverter para publicado** do admin só zera o formulário e não avisa o iframe; por isso [apps/cms/src/components/LivePreviewRevertSync](apps/cms/src/components/LivePreviewRevertSync/index.tsx), ligado em `pages` e `posts`, dispara o evento de atualização quando as versões não publicadas somem. Ao criar outra coleção com `livePreview`, adicione `admin.components.edit.beforeDocumentControls: ['@/components/LivePreviewRevertSync#LivePreviewRevertSync']` e rode `pnpm --filter cms generate:importmap`.

## Requisitos

- Node.js 20.9+ (testado com 24)
- pnpm (`corepack enable pnpm`)
- Docker (ou Podman) com compose

## Rodando localmente

```bash
cp .env.example .env                    # portas e credenciais do docker compose
cp apps/cms/.env.example apps/cms/.env  # ajuste PAYLOAD_SECRET e os segredos
cp apps/web/.env.example apps/web/.env  # PREVIEW_SECRET e REVALIDATE_SECRET iguais aos do CMS
docker compose up -d                    # Postgres + MinIO (cria o bucket público de mídia)
pnpm install
pnpm dev                                # CMS em :3001 e site em :3000

# Em outro terminal, na primeira vez: propriedades, usuários e conteúdo de exemplo
CMS_API_KEY=<mesma chave de apps/web/.env> \
BOOTSTRAP_ADMIN_EMAIL=voce@digio.com.br BOOTSTRAP_ADMIN_PASSWORD=<senha> \
pnpm --filter cms bootstrap:dev
```

O `bootstrap:dev` cria:

- a propriedade **Digio**, servida em http://localhost:3000;
- a propriedade **Campanha Exemplo**, servida em http://campanha.localhost:3000 (`*.localhost` já aponta para a sua máquina, sem mexer no `/etc/hosts`);
- o seu usuário super admin e a conta de serviço do preview (`preview@digio.local`);
- conteúdo de exemplo nas duas propriedades, **diferente em cada uma**:
  - **Digio**: demo completo (home, componentes, contato, blog, produtos e taxas, central de ajuda);
  - **Campanha Exemplo**: micro-site "Indique e ganhe" (home, regulamento, contato em português, FAQs, header e footer), sem blog nem central de ajuda. Código em [apps/cms/src/endpoints/seed/campaign.ts](apps/cms/src/endpoints/seed/campaign.ts); qualquer propriedade diferente de `digio` recebe esse conteúdo.

O `bootstrap:dev` **recria todo o conteúdo** das propriedades, inclusive apagando posts migrados do WordPress. Para ter posts reais depois dele: `pnpm --filter cms blog:migrate tenant=digio limit=20`.

Detalhes que costumam pegar quem roda pela primeira vez:

- **Suba o `pnpm dev` antes do `bootstrap:dev`.** No fim, o script pede ao site para limpar o cache (`/api/revalidate/`). Com o site parado, o cache de dados do `next dev` (`apps/web/.next/cache`) pode continuar servindo o conteúdo antigo. Se isso acontecer, chame o webhook com `REVALIDATE_SECRET`: `curl -X POST http://localhost:3000/api/revalidate/ -H "Authorization: Bearer $REVALIDATE_SECRET" -H 'Content-Type: application/json' -d '{"tags":["cms","tenants"]}'`.
- **Use `docker compose up -d` completo** (e não só `postgres minio`): o serviço `minio-init` cria o bucket de mídia. Sem ele o seed falha com `NoSuchBucket`.
- **O primeiro acesso a cada rota no `next dev` compila a página** e pode responder 503 por alguns segundos. Repita a requisição.
- **Renomear a pasta do repositório muda o nome do projeto do compose**, e com ele os volumes (`<pasta>_postgres-data`, `<pasta>_minio-data`). O banco sobe vazio; os dados antigos continuam no volume com o nome anterior. Para voltar a usá-los, defina `COMPOSE_PROJECT_NAME` com o nome antigo, ou rode o `bootstrap:dev` para recriar tudo.

Para só recriar o conteúdo num banco que já tem super admin, rode sem as variáveis `BOOTSTRAP_ADMIN_*`: os usuários ficam como estão.

O design system do site está em `docs/design-system.md`.

Marca da Digio no admin ([apps/cms/src/components/DigioLogo](apps/cms/src/components/DigioLogo/index.tsx), registrada em `admin.components.graphics` e `admin.meta` no `payload.config.ts`):

- **Logo completo** na tela de login (e esqueci a senha), azul-marinho no tema claro e branco no escuro (as cores vêm de classes em `custom.scss`);
- **Ícone** no topo da navegação, onde o logo completo não cabe: o mesmo desenho do favicon (um "d" turquesa sobre quadrado marinho), igual nos dois temas. O `custom.scss` amplia a caixa de 18px que o Payload reserva para o ícone, senão ele fica cortado;
- **Favicon** `apps/cms/public/brand/icon.svg` e título das abas com o sufixo "- Digio". Se mudar o desenho, atualize também o `DigioIcon`.

Os caminhos do SVG são os de `apps/web/public/brand/logo-digio.svg`; se o logo mudar, atualize os dois.

Links locais:

- Admin: http://localhost:3001/admin. O seletor "Propriedade" no menu filtra o conteúdo.
- Console do MinIO: http://localhost:9001 (usuário e senha em `S3_ACCESS_KEY_ID` e `S3_SECRET_ACCESS_KEY`).

## Multi-tenant (propriedades)

- **Nova propriedade:** em Plataforma > Propriedades, com nome, slug, URL pública e domínios. Não precisa de deploy.
- **Resolução pelo domínio:** o site resolve o domínio da requisição para a propriedade em [apps/web/src/proxy.ts](apps/web/src/proxy.ts).
- **Isolamento:** conteúdo, usuários e mídia ficam separados por propriedade. A mídia vai para `tenants/<slug>/` no bucket.
- **Papéis:**
  - `super-admin`: todas as propriedades;
  - `preview`: conta de serviço, só leitura;
  - `admin`, `editor` e `seo`: por propriedade.
- **Testes:** as regras de isolamento e de papéis estão em [apps/cms/tests/int/tenant-isolation.int.spec.ts](apps/cms/tests/int/tenant-isolation.int.spec.ts), que roda com `pnpm test:int`.

Se as portas 5432/9000/9001 já estiverem em uso, troque-as no `.env` da raiz e ajuste `DATABASE_URL`, `S3_ENDPOINT`, `MEDIA_PUBLIC_URL` (CMS) e `NEXT_PUBLIC_MEDIA_URL` (site).

## Autenticação do admin (login local + SSO)

O admin tem dois autenticadores independentes, cada um com a sua sessão e o seu logout:

|              | Login local                                               | SSO corporativo (RH-SSO/Keycloak)                                                                        |
| ------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Como entra   | e-mail e senha                                            | botão "Entrar com SSO corporativo" (OIDC Authorization Code + PKCE)                                      |
| Sessão       | cookie `payload-token` do Payload                         | cookie `digio-sso-session`, assinado e revogável                                                         |
| Logout       | encerra só a sessão do CMS                                | encerra a sessão do CMS e a do RH-SSO                                                                    |
| Papéis       | definidos no admin                                        | vêm do SSO a cada login (grupos `/tenants/<propriedade>/<admin\|editor\|seo>` e papel `cms-super-admin`) |
| Liga/desliga | `AUTH_LOCAL_ENABLED` (em produção, sem valor = desligado) | `AUTH_SSO_ENABLED`                                                                                       |

Regras:

- **Um provedor por conta:** conta SSO não entra com senha, e um e-mail de conta local nunca é vinculado ao SSO. O provedor não pode ser trocado pelo admin.
- **Cookie SSO:** vale a mesma proteção CSRF do cookie local do Payload.
- **Logout pelo Payload** (por exemplo, por inatividade) também revoga as sessões SSO do usuário.

No desenvolvimento, o `docker compose up -d` sobe um Keycloak em http://localhost:8080 (console: `admin`/`admin`), com o realm de [docker/keycloak/digio-realm.json](docker/keycloak/digio-realm.json). Usuários de teste, todos com a senha `Senha-123`:

| Usuário         | Cenário                                         |
| --------------- | ----------------------------------------------- |
| `sso.admin`     | super admin (papel `cms-super-admin`)           |
| `sso.editor`    | editor da Digio                                 |
| `sso.multi`     | `seo` na Digio e editor na Campanha Exemplo     |
| `sso.semacesso` | sem grupos: login recusado                      |
| `sso.colisao`   | mesmo e-mail de uma conta local: login recusado |

Testes:

- `pnpm test:int` e `pnpm test:unit`: provisionamento, sessão e tokens, sem precisar do Keycloak;
- `pnpm --filter cms test:sso`: fluxo completo contra o Keycloak, incluindo ataques (callback forjado, `state` adulterado, cookie de outra origem, sessão revogada);
- `pnpm --filter cms test:e2e`: o mesmo no navegador.

## Docker (um container por projeto)

Cada app tem seu Dockerfile ([apps/cms/Dockerfile](apps/cms/Dockerfile), [apps/web/Dockerfile](apps/web/Dockerfile)). O build é sempre a partir da raiz:

```bash
docker build -f apps/cms/Dockerfile -t digio-cms .
docker build -f apps/web/Dockerfile -t digio-web .
```

Para rodar os dois em containers localmente, junto com Postgres e MinIO:

```bash
docker compose --profile app up -d --build
```

As variáveis `NEXT_PUBLIC_*` e o host de imagens do site entram no build (`--build-arg`), então cada ambiente (DEV/HML/PRD) gera a sua imagem. Os ambientes, o CI/CD e a CDN são do responsável de infra.

## Scripts (na raiz)

| Comando                              | O que faz                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `pnpm dev`                           | CMS e site juntos (`dev:cms` e `dev:web` separados)                                |
| `pnpm build`                         | build de produção dos dois                                                         |
| `pnpm lint`                          | ESLint nos dois                                                                    |
| `pnpm format`                        | formata com Prettier (`format:check` só confere)                                   |
| `pnpm typecheck`                     | TypeScript (strict) nos dois                                                       |
| `pnpm test:unit`                     | Vitest, testes unitários (sem banco)                                               |
| `pnpm test:int`                      | Vitest, integração do CMS (precisa do compose)                                     |
| `pnpm generate:types`                | regenera `packages/payload-types`                                                  |
| `pnpm validate-urls`                 | confere URLs antigas em qualquer ambiente ([docs/redirects.md](docs/redirects.md)) |
| `pnpm --filter cms redirects:import` | importa redirects de um CSV ([docs/redirects.md](docs/redirects.md))               |
| `pnpm --filter cms blog:migrate`     | migra o blog do WordPress ([docs/migracao-blog.md](docs/migracao-blog.md))         |

Dentro de cada app: `pnpm --filter cms <script>` ou `pnpm --filter web <script>` (por exemplo, `test:e2e` e `generate:importmap`).
