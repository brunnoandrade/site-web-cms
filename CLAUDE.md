# Site V2 Digio · Plataforma Web (Payload CMS + Next.js)

Contexto para o Claude Code. Leia este arquivo e a pasta `docs/` antes de qualquer tarefa.

## O que é
Novo site institucional da Digio (substitui o site atual hospedado pela Orbital).
Escopo desta entrega: **F0 (fundação) + F1 (evolução do site)**, não transacional.
Detalhes em `docs/escopo.md`; virada em ondas em `docs/virada.md`; decisões e aderência ao SoAD em `docs/gaps-soad.md`; revisão de segurança, correções e pendências em `docs/seguranca.md`.

## Stack
- **Monorepo npm (workspaces) com dois projetos separados**, cada um com seu Dockerfile:
  - `apps/cms`: **Payload CMS 3** (admin e API REST), em Next.js. Único que acessa o Postgres.
  - `apps/web`: site público em **Next.js (App Router)**. Lê o conteúdo só pela API REST do CMS (`apps/web/src/lib/cms.ts`), nunca pela Local API.
  - `packages/payload-types`: tipos gerados pelo Payload, usados pelos dois (`npm run generate:types`).
  - `packages/routes`: URLs públicas (página, post) e normalização de caminhos. Fonte única para o CMS (redirects automáticos, preview, SEO) e o site (links); não montar URL à mão.
- Integração entre os dois: revalidação por webhook (`POST /api/revalidate/` no site, chamado pelos hooks do CMS), preview por draft mode + API key de usuário de serviço, e mídia servida direto do storage (`MEDIA_PUBLIC_URL`), sem passar pelo CMS.
- **PostgreSQL** via `@payloadcms/db-postgres` (Payload não suporta MySQL; o SoAD deve ser corrigido para RDS PostgreSQL).
- **TypeScript** em modo strict; **npm**.
- Editor de texto rico: `@payloadcms/richtext-lexical`.
- Mídia em storage S3-compatível: `@payloadcms/storage-s3` (MinIO no ambiente local).
- Plugins: `@payloadcms/plugin-multi-tenant`, `@payloadcms/plugin-redirects`, `@payloadcms/plugin-seo`.
- **Multi-tenant pronto para N propriedades**: cada tenant com domínios próprios; conteúdo, usuários e mídia (prefixo no S3) isolados; o site resolve domínio → tenant → página; novo tenant por configuração, sem deploy. Tenant inicial: `digio`.
- **Autenticação do admin com dois autenticadores**: login local (e-mail/senha) e SSO RH-SSO/Keycloak (OIDC Authorization Code + PKCE), com botão "Entrar com SSO" na tela de login. Cada usuário só entra pelo seu provedor, cada provedor tem o próprio logout (o do SSO também encerra a sessão no RH-SSO) e cada um pode ser ligado/desligado por ambiente (login local desligado em PRD). Regras completas em `docs/gaps-soad.md`.
- Ambiente local: `docker compose` (ou Podman) com Postgres e MinIO; o perfil `app` sobe também os containers do CMS e do site. Ambientes DEV/HML/PRD, CI/CD e CDN são do responsável de infra (a partir de M2); não criar isso aqui.
- Sempre instalar as versões estáveis mais recentes e conferir a documentação oficial do Payload 3 antes de configurar plugins.

## Ponto de partida
Usar o template oficial `website` do `create-payload-app` com Postgres. Ele já traz Pages com blocos, Posts, Categories, live preview, rascunhos, publicação agendada, SEO e redirects. Adaptar em vez de reescrever.

## Modelo de conteúdo
Coleções:
- `pages`: blocos, slug, SEO, rascunho/versões
- `posts`, `categories`, `authors` (blog; `authors` são perfis públicos, separados dos usuários do admin)
- `media`
- `products`: dados de produto usados nas páginas
- `rates`: taxas e CET, com validação de negócio ao publicar (regras R1–R8 em `apps/cms/src/collections/Rates/validateRates.ts`, a confirmar com PO/jurídico); rascunho pode ficar incompleto
- `faqs`, `help-categories`, `help-topics` (central de ajuda, ~29 tópicos, navegação por categoria, sem busca própria)
- `banners`
- `redirects` (plugin)
- `tenants` (propriedades: nome, slug, URL pública, domínios) e `users`
  - papéis globais: `super-admin` (todas as propriedades) e `preview` (conta de serviço, só leitura);
  - papéis por propriedade: `admin`, `editor` e `seo`.
- `header` e `footer`: um documento por propriedade (coleções com `isGlobal` do plugin multi-tenant, porque globals do Payload não têm tenant).

Toda coleção de conteúdo tem o campo `tenant`; slugs e origens de redirect são únicos por tenant. No site, as rotas ficam em `app/(frontend)/[tenant]/...` e o `proxy.ts` reescreve o domínio da requisição para o tenant.

Blocos (~10): hero (campo da página), `cards`, `ratesTable`, `faq`, `cta`, `content` (texto rico), `mediaBlock`, `productHighlight`, `archive` (lista de posts), `bannerSection`, além de `formBlock`. Rótulos do admin em português (padrão) e inglês: `t(pt, en)` de `apps/cms/src/utilities/labels.ts`.

## Rotas (manter URLs atuais)
- Páginas: `/[...slug]/`
- Blog: `/blog/`, `/blog/[categoria]/` e `/blog/[categoria]/[slug]/`. É a **mesma estrutura do WordPress atual**; posts que mantêm slug e categoria não precisam de redirect.
- Categorias atuais do blog: emprestimos, games, meu-digio, noticias, salvando-grana, seguranca.
- Central de ajuda: `/central-de-ajuda/`, `/central-de-ajuda/[topico]/` e `/central-de-ajuda/[topico]/[pergunta]/`, a **mesma estrutura do site atual** (29 tópicos e cerca de 418 perguntas, cada pergunta com página própria). Um tópico (`help-topics`) lista suas perguntas (`faqs`) em ordem; o slug da pergunta é único dentro do tópico.
- Slugs: sempre pelo campo `slug()` de `apps/cms/src/fields/slug.ts`, que translitera acentos (`cartão` → `cartao`); o padrão do Payload os descarta.
- `trailingSlash: true` no Next, porque as URLs atuais terminam com `/`.

## Redirects e rastreio (regras obrigatórias)
- Os redirects ficam na coleção `redirects` do plugin, agrupada em "SEO" no admin. Só `admin` e `seo` podem editar.
- Os 301 são respondidos no proxy do Next (`apps/web/src/proxy.ts`, o antigo middleware), com cache da lista de redirects. Guia completo: `docs/redirects.md`.
- **Preservar a query string** (utm_*, gclid, fbclid) em todo redirect.
- Proibido redirect em cadeia (A → B → C) e origem duplicada: validar isso no hook da coleção.
- Hook em `pages` e `posts`: quando o slug ou a categoria mudar, criar automaticamente o redirect da URL antiga para a nova.
- Importação em massa de redirects via CSV (script em `scripts/`).
- Script `scripts/validate-urls.ts`: lê um CSV de URLs antigas e confere se cada uma responde 301 com destino 200, ou 200 direto. Tem que rodar contra qualquer ambiente.
- Analytics: mesmo container GTM e mesma propriedade GA4 do site atual; nomes de eventos iguais aos atuais; banner de consentimento (LGPD).

## Migração do blog
`apps/cms/scripts/migrate-wordpress.ts` (`npm run -w cms blog:migrate tenant=digio [dry-run]`): puxa posts, categorias, autores e imagens pela API REST do WordPress (`/blog/wp-json/wp/v2/...`) e grava pela Local API do Payload. Preserva slug, categoria, datas e SEO, e reescreve links internos. É idempotente (IDs do WordPress, URL das imagens, data de modificação). A API de categorias exige login e o SEO não está na API: categorias vêm embutidas nos posts e o SEO vem do `<head>` de cada página publicada. Cada post é verificado contra perda de conteúdo na conversão. Guia e decisões pendentes: `docs/migracao-blog.md`.

## Resiliência
O site precisa continuar no ar se o Payload cair. Páginas geradas estaticamente (SSG/ISR) com revalidação por webhook do CMS, e uma versão estática de fallback servida pela CDN.

## Qualidade
- ESLint + Prettier.
- Vitest para regras de redirect, hooks e scripts.
- Playwright para e2e das rotas principais.
- Lighthouse CI com os limiares de Core Web Vitals.
- Acessibilidade WCAG 2.2 AA; integração com Octagora (Libras).

## Convenções
- Código e nomes técnicos em inglês; conteúdo e textos de UI em português.
- Commits pequenos, no padrão Conventional Commits.
- Não criar nada transacional (simuladores, proposta, login de cliente, chatbot): isso é F2 em diante.
- Trabalhar em etapas pequenas e parar para revisão ao fim de cada uma.

Regras do Next.js 16 para agentes: `apps/cms/AGENTS.md` e `apps/web/AGENTS.md` (gerados pelo `next dev` de cada app).
