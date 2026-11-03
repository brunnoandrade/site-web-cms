# Site V2 Digio

Site institucional da Digio. Um único app Next.js (App Router) com o código em `src/`: o site público e o CMS (Payload CMS 3) rodam no mesmo processo e na mesma porta (3000).

| Caminho         | O que é                                                     |
| --------------- | ----------------------------------------------------------- |
| `/admin`        | Admin do Payload CMS (login local ou SSO)                   |
| `/api`          | API REST do Payload e endpoints do site (`/api/revalidate`) |
| `/auth/sso`     | Rotas do login SSO (RH-SSO/Keycloak)                        |
| demais caminhos | Site público, resolvido pelo domínio da requisição (tenant) |

Imagem única: [Dockerfile](Dockerfile) (compatível com Podman) e [Jenkinsfile](Jenkinsfile) na raiz.

**Admin por host:** com `ADMIN_HOST` definido (ex.: `admin.digio.com.br`), `/admin` e `/auth/sso` respondem só nesse host e dão 404 nos domínios das propriedades; a raiz do host do admin redireciona para `/admin`. Vazio, vale qualquer domínio (desenvolvimento). A API (`/api`) continua em todos os hosts, porque o site a usa; a restrição dela é da CDN/WAF.

Contexto do projeto: [CLAUDE.md](CLAUDE.md) e [docs/](docs/). Usuários e senhas do ambiente local: [docs/usuarios-locais.md](docs/usuarios-locais.md). Redirects, importação CSV e validação de URLs: [docs/redirects.md](docs/redirects.md). Migração do blog: [docs/migracao-blog.md](docs/migracao-blog.md). Revisão de segurança, correções e pendências: [docs/seguranca.md](docs/seguranca.md). Referência do template original: [README.payload-template.md](README.payload-template.md).

## Como o site e o CMS conversam

```
navegador ──► app Next.js ──► Postgres
    │         ├─ site público  (/...)
    │         └─ CMS Payload   (/admin, /api)
    │              │
    │              └── webhook de revalidação (ao publicar, o app chama /api/revalidate)
    └──────────────────► storage de mídia (MinIO / CDN) ◄── uploads do CMS
```

- **Conteúdo:** o site lê pela Local API do Payload ([src/lib/cms.ts](src/lib/cms.ts)), sem HTTP, e guarda em cache (`unstable_cache`) com tags. O proxy (tenant e redirects) e o relay do live preview também rodam em processo. O único HTTP interno é o webhook de revalidação, usado por seed e migração, que rodam fora do servidor.
- **Publicação:** os hooks do CMS chamam `POST /api/revalidate/` no site, que invalida as páginas e tags afetadas ([src/utilities/revalidateWeb.ts](src/utilities/revalidateWeb.ts)).
- **Mídia:** as imagens saem direto do storage (`MEDIA_PUBLIC_URL`), sem passar pelo CMS.
- **Se o banco ou o CMS cair:** como o site e o CMS são o mesmo processo, a resiliência vem do cache (ISR) e do fallback estático na CDN, não de processos separados.
- **Build:** o build não precisa do banco nem do CMS no ar. As páginas são geradas no primeiro acesso (ISR).
- **Preview:** o admin abre `/next/preview/` no site, que ativa o draft mode. Os rascunhos são lidos com a API key de um usuário de serviço (`CMS_API_KEY`).
- **Live preview:** o admin mostra o site num iframe e, a cada salvamento automático do rascunho, o site refaz a página (`RefreshRouteOnSave`). Só funciona se o iframe entrar em draft mode, e para isso o cookie `__prerender_bypass` precisa chegar ao site. Em desenvolvimento o Next envia esse cookie como `SameSite=Lax`, e o navegador o descarta quando o admin (`localhost:3001`) e o site da propriedade (`uberconta.localhost:3000`) são sites diferentes. Por isso a rota [src/app/(frontend)/next/preview/route.ts](<src/app/(frontend)/next/preview/route.ts>) reenvia o cookie como `SameSite=None; Secure` fora de produção (em produção o Next já faz isso). Se o preview continuar sem atualizar: abra o admin exatamente em `http://localhost:3000` (é a origem que o `serverURL` aceita), use um navegador que aceite cookies de terceiros em `*.localhost` (Safari não aceita `Secure` em http) e confira no console se aparece algum erro. O botão **Reverter para publicado** do admin só zera o formulário e não avisa o iframe; por isso [src/components/LivePreviewRevertSync](src/components/LivePreviewRevertSync/index.tsx), ligado em `pages` e `posts`, dispara o evento de atualização quando as versões não publicadas somem. Ao criar outra coleção com `livePreview`, adicione `admin.components.edit.beforeDocumentControls: ['@/components/LivePreviewRevertSync#LivePreviewRevertSync']` e rode `npm run generate:importmap`.

## Requisitos

- Node.js 22+ (versão fixada em `.nvmrc`: 24; rode `nvm use`). O `engine-strict` faz o `npm install` falhar em Node antigo.
- npm 10+ (vem com o Node)
- Docker (ou Podman) com compose

## Rodando localmente

```bash
cp .env.example .env                    # um só arquivo: compose e app; ajuste PAYLOAD_SECRET e os segredos
docker compose up -d                    # Postgres + MinIO + Keycloak (cria o bucket público de mídia)
npm install
npm run dev                             # site e CMS em :3000 (admin em :3000/admin)

# Em outro terminal, na primeira vez: propriedades, usuários e conteúdo de exemplo
CMS_API_KEY=<mesma chave do .env> \
BOOTSTRAP_ADMIN_EMAIL=voce@digio.com.br BOOTSTRAP_ADMIN_PASSWORD=<senha> \
npm run bootstrap:dev
```

**Imagem de container** (Podman ou Docker): `podman build -t digio-site .` e `podman run --env-file .env -p 3000:3000 digio-site`. Os valores `NEXT_PUBLIC_*` são fixados no build (`--build-arg`).

**Máquina nova, um comando só:** `BOOTSTRAP_ADMIN_EMAIL=voce@digio.com.br BOOTSTRAP_ADMIN_PASSWORD='<senha>' npm run setup:local` ([scripts/setup-local.sh](scripts/setup-local.sh)). Cria o `.env` com segredos gerados (incluindo `CMS_API_KEY`), sobe Postgres, MinIO e Keycloak, instala as dependências e roda o `bootstrap:dev`. Não sobrescreve `.env` existente. Para ter um usuário de cada perfil, com senha fácil, rode depois `npm run users:local` (ver `docs/usuarios-locais.md`). O que **não** vem do git: edições feitas pelo admin, mídia enviada e posts do WordPress (`blog:migrate`); o conteúdo de seed (Digio e Uber Conta, com imagens) é todo versionado.

O `bootstrap:dev` cria:

- a propriedade **Digio**, servida em http://localhost:3000;
- a propriedade **Uber Conta**, servida em http://uberconta.localhost:3000 (`*.localhost` já aponta para a sua máquina, sem mexer no `/etc/hosts`);
- o seu usuário super admin e a conta de serviço do preview (`preview@digio.local`);
- conteúdo de exemplo nas duas propriedades, **diferente em cada uma** (a Uber Conta tem o seed em [src/endpoints/seed/uber-conta.ts](src/endpoints/seed/uber-conta.ts)):
  - **Digio**: demo completo (home, componentes, contato, blog, produtos e taxas, central de ajuda);
  - **Uber Conta**: conteúdo próprio da propriedade, ver `docs/uber-conta.md`.

O `bootstrap:dev` **recria todo o conteúdo** das propriedades, inclusive apagando posts migrados do WordPress. Para ter posts reais depois dele: `npm run blog:migrate tenant=digio limit=20`.

Detalhes que costumam pegar quem roda pela primeira vez:

- **Suba o `npm run dev` antes do `bootstrap:dev`.** No fim, o script pede ao site para limpar o cache (`/api/revalidate/`). Com o site parado, o cache de dados do `next dev` (`.next/cache`) pode continuar servindo o conteúdo antigo. Se isso acontecer, chame o webhook com `REVALIDATE_SECRET`: `curl -X POST http://localhost:3000/api/revalidate/ -H "Authorization: Bearer $REVALIDATE_SECRET" -H 'Content-Type: application/json' -d '{"tags":["cms","tenants"]}'`.
- **Postgres local já instalado na máquina (Homebrew etc.) ocupa a porta 5432.** O app conecta nele em vez do container e o erro é `role "digio" does not exist`. Confira com `lsof -nP -iTCP:5432 -sTCP:LISTEN`; se houver outro dono, troque `POSTGRES_PORT` e a porta do `DATABASE_URL` no `.env` (ex.: 5433) e suba o compose de novo.
- **Use `docker compose up -d` completo** (e não só `postgres minio`): o serviço `minio-init` cria o bucket de mídia. Sem ele o seed falha com `NoSuchBucket`.
- **O primeiro acesso a cada rota no `next dev` compila a página** e pode responder 503 por alguns segundos. Repita a requisição.
- **Renomear a pasta do repositório muda o nome do projeto do compose**, e com ele os volumes (`<pasta>_postgres-data`, `<pasta>_minio-data`). O banco sobe vazio; os dados antigos continuam no volume com o nome anterior. Para voltar a usá-los, defina `COMPOSE_PROJECT_NAME` com o nome antigo, ou rode o `bootstrap:dev` para recriar tudo.

Para só recriar o conteúdo num banco que já tem super admin, rode sem as variáveis `BOOTSTRAP_ADMIN_*`: os usuários ficam como estão.

O design system do site está em `docs/design-system.md`.

Marca da Digio no admin ([src/components/DigioLogo](src/components/DigioLogo/index.tsx), registrada em `admin.components.graphics` e `admin.meta` no `payload.config.ts`):

- **Logo completo** na tela de login (e esqueci a senha), azul-marinho no tema claro e branco no escuro (as cores vêm de classes em `custom.scss`);
- **Ícone** no topo da navegação, onde o logo completo não cabe: o mesmo desenho do favicon (um "d" turquesa sobre quadrado marinho), igual nos dois temas. O `custom.scss` amplia a caixa de 18px que o Payload reserva para o ícone, senão ele fica cortado;
- **Favicon** `public/brand/icon.svg` e título das abas com o sufixo "- Digio". Se mudar o desenho, atualize também o `DigioIcon`.

Os caminhos do SVG são os de `public/brand/logo-digio.svg`; se o logo mudar, atualize os dois.

Links locais:

- Admin: http://localhost:3000/admin. O seletor "Propriedade" no menu filtra o conteúdo.
- Console do MinIO: http://localhost:9201 (usuário e senha em `S3_ACCESS_KEY_ID` e `S3_SECRET_ACCESS_KEY`).

## Multi-tenant (propriedades)

- **Nova propriedade:** em Plataforma > Propriedades, com nome, slug, URL pública e domínios. Não precisa de deploy.
- **Resolução pelo domínio:** o site resolve o domínio da requisição para a propriedade em [src/proxy.ts](src/proxy.ts).
- **Isolamento:** conteúdo, usuários e mídia ficam separados por propriedade. A mídia vai para `tenants/<slug>/` no bucket.
- **Papéis:**
  - `super-admin`: todas as propriedades;
  - `preview`: conta de serviço, só leitura;
  - `admin`, `editor` e `seo`: por propriedade.
- **Testes:** as regras de isolamento e de papéis estão em [tests/int/tenant-isolation.int.spec.ts](tests/int/tenant-isolation.int.spec.ts), que roda com `npm run test:int`.

Se as portas 5432/9200/9201 já estiverem em uso, troque-as no `.env` e ajuste `DATABASE_URL`, `S3_ENDPOINT`, `MEDIA_PUBLIC_URL` e `NEXT_PUBLIC_MEDIA_URL`.

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
| `sso.multi`     | `seo` na Digio e editor na Uber Conta           |
| `sso.semacesso` | sem grupos: login recusado                      |
| `sso.colisao`   | mesmo e-mail de uma conta local: login recusado |

Testes:

- `npm run test:int` e `npm run test:unit`: provisionamento, sessão e tokens, sem precisar do Keycloak;
- `npm run test:sso`: fluxo completo contra o Keycloak, incluindo ataques (callback forjado, `state` adulterado, cookie de outra origem, sessão revogada);
- `npm run test:e2e`: o mesmo no navegador.

## Imagem de container (Docker ou Podman)

Há um único [Dockerfile](Dockerfile) na raiz, com o site e o CMS na mesma imagem. Funciona com Podman: usa a imagem base com nome completo (`docker.io/library/node`), não usa recursos exclusivos do BuildKit e roda com usuário numérico sem privilégios.

```bash
podman build -t digio-site .        # ou: docker build -t digio-site .
podman run --env-file .env -p 3000:3000 digio-site
```

Para rodar em container localmente, junto com Postgres e MinIO:

```bash
docker compose --profile app up -d --build     # ou: podman compose --profile app up -d --build
```

**Banco do container:** a imagem em produção aplica as migrations pendentes ao subir (`prodMigrations`), então ela espera um banco vazio ou criado por migration. Apontada para o banco de desenvolvimento local, que o `npm run dev` montou por _push_ do schema, o Payload faz uma pergunta interativa sobre migrations e o container fica parado sem responder. Para testar a imagem localmente, use um banco novo (`create database digio_imgtest`) ou o `docker compose --profile app` com o banco do compose vazio.

As variáveis `NEXT_PUBLIC_*` e o host de imagens entram no build (`--build-arg`), então cada ambiente (DEV/HML/PRD) gera a sua imagem. Os ambientes, a CDN e a configuração real do CI/CD são do responsável de infra; o [Jenkinsfile](Jenkinsfile) é genérico (registry, credenciais e URLs por ambiente estão marcados com `TODO`).

## Scripts (na raiz)

| Comando                    | O que faz                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`              | site e CMS no mesmo app (porta 3000)                                               |
| `npm run build`            | build de produção (site + CMS)                                                     |
| `npm run lint`             | ESLint                                                                             |
| `npm run format`           | formata com Prettier (`format:check` só confere)                                   |
| `npm run typecheck`        | TypeScript (strict)                                                                |
| `npm run test:unit`        | Vitest, testes unitários (sem banco)                                               |
| `npm run test:int`         | Vitest, integração do CMS (precisa do compose)                                     |
| `npm run generate:types`   | regenera `src/payload-types.ts`                                                    |
| `npm run validate-urls`    | confere URLs antigas em qualquer ambiente ([docs/redirects.md](docs/redirects.md)) |
| `npm run redirects:import` | importa redirects de um CSV ([docs/redirects.md](docs/redirects.md))               |
| `npm run blog:migrate`     | migra o blog do WordPress ([docs/migracao-blog.md](docs/migracao-blog.md))         |

**Banco e migrations:** o schema vem de `src/migrations` (a inicial cria todas as tabelas). Em produção o CMS aplica as pendentes ao subir (`prodMigrations`); em dev o Payload continua sincronizando o schema sozinho (push). Ao mudar coleções ou campos, gere uma nova com `npm run payload migrate:create <nome>` e versione o resultado; para aplicar à mão, `npm run payload migrate`. Com várias réplicas subindo ao mesmo tempo, prefira rodar `migrate` uma vez antes (job de deploy).

**Health check:** `GET /api/health` devolve `200 {"status":"ok"}` se o banco responde e `503` se não (sem dados sensíveis, sem cache).

Outros scripts úteis: `test:e2e` e `generate:importmap`.
