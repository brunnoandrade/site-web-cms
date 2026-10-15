# Instruções para o GitHub Copilot

Resumo para o Copilot (chat, code review e coding agent). O contexto completo está em [AGENTS.md](../AGENTS.md) e em `docs/`: leia antes de qualquer tarefa.

## Projeto
Site institucional da Digio, multi-tenant (tenant inicial `digio`; também Uber Conta). Escopo F0 + F1, **não transacional**: não criar simuladores, proposta, login de cliente nem chatbot.

## Estrutura (monorepo npm workspaces)
- `apps/cms`: Payload CMS 3 em Next.js. Único que acessa o PostgreSQL.
- `apps/web`: site público em Next.js (App Router). Lê conteúdo só pela API REST do CMS (`apps/web/src/lib/cms.ts`), nunca pela Local API.
- `packages/payload-types`: tipos gerados (`npm run generate:types`). Não editar à mão.
- `packages/routes`: fonte única das URLs públicas. Não montar URL à mão.
- `scripts/`: validação de URLs, import de redirects em CSV.

## Regras obrigatórias
- TypeScript strict. Código e nomes técnicos em inglês; conteúdo e textos de UI em português. Rótulos do admin com `t(pt, en)` de `apps/cms/src/utilities/labels.ts`.
- Slugs sempre pelo campo `slug()` de `apps/cms/src/fields/slug.ts` (translitera acentos).
- Toda coleção de conteúdo tem o campo `tenant`; slugs e origens de redirect são únicos por tenant.
- `trailingSlash: true`: as URLs terminam com `/`. Manter as URLs atuais (blog em `/blog/[categoria]/[slug]/`, central de ajuda em `/central-de-ajuda/[topico]/[pergunta]/`).
- Redirects: preservar query string (utm_*, gclid, fbclid); proibido redirect em cadeia e origem duplicada; 301 respondido em `apps/web/src/proxy.ts`.
- O site deve continuar no ar se o Payload cair (SSG/ISR com revalidação por webhook).
- Acessibilidade WCAG 2.2 AA.
- Next.js 16 tem mudanças incompatíveis: consulte `node_modules/next/dist/docs/` e `apps/*/AGENTS.md` antes de usar APIs do Next.
- Antes de configurar plugins do Payload, conferir a documentação oficial do Payload 3.
- Nunca commitar segredos (`.env`, `CREDENCIAIS-LOCAIS.md`).

## Comandos
- `npm run dev` (CMS + site), `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:int`, `npm run format:check`, `npm run validate-urls`.
- Ambiente local: `docker compose` (Postgres e MinIO).

## Convenções
- Commits pequenos, Conventional Commits (`feat(web): ...`, `fix(cms): ...`).
- Mudanças pequenas e focadas; adaptar o que já existe em vez de reescrever. Seguir o estilo do código vizinho.
- Testes: Vitest para regras de redirect, hooks e scripts; Playwright para e2e das rotas principais.
