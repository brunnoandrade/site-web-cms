# Instruções para o GitHub Copilot

Resumo para o Copilot (chat, code review e coding agent). O contexto completo está em [AGENTS.md](../AGENTS.md) e em `docs/`: leia antes de qualquer tarefa.

## Projeto

Site institucional da Digio, multi-tenant (tenant inicial `digio`; também Uber Conta). Escopo F0 + F1, **não transacional**: não criar simuladores, proposta, login de cliente nem chatbot.

## Estrutura (um único app Next.js, código em `src/`)

- Payload CMS 3 (admin em `/admin`, API em `/api`) e site público (App Router) no mesmo app e na mesma porta. Só o Payload acessa o PostgreSQL.
- O site lê o conteúdo pela Local API do Payload (`src/lib/cms.ts`); proxy e live preview também rodam em processo (sem HTTP). O webhook de revalidação é o único HTTP interno (scripts rodam fora do servidor).
- `src/payload-types.ts`: tipos gerados (`npm run generate:types`). Não editar à mão.
- `src/routes`: fonte única das URLs públicas. Não montar URL à mão.
- `scripts/`: validação de URLs, import de redirects em CSV.

## Regras obrigatórias

- TypeScript strict. Código e nomes técnicos em inglês; conteúdo e textos de UI em português. Rótulos do admin com `t(pt, en)` de `src/utilities/labels.ts`.
- Slugs sempre pelo campo `slug()` de `src/fields/slug.ts` (translitera acentos).
- Toda coleção de conteúdo tem o campo `tenant`; slugs e origens de redirect são únicos por tenant.
- `trailingSlash: true`: as URLs terminam com `/`. Manter as URLs atuais (blog em `/blog/[categoria]/[slug]/`, central de ajuda em `/central-de-ajuda/[topico]/[pergunta]/`).
- Redirects: preservar query string (utm_*, gclid, fbclid); proibido redirect em cadeia e origem duplicada; 301 respondido em `src/proxy.ts`.
- O site deve continuar no ar se o Payload cair (SSG/ISR com revalidação por webhook).
- Acessibilidade WCAG 2.2 AA.
- Next.js 16 tem mudanças incompatíveis: consulte `node_modules/next/dist/docs/` e o `AGENTS.md` da raiz antes de usar APIs do Next.
- Antes de configurar plugins do Payload, conferir a documentação oficial do Payload 3.
- Nunca commitar segredos (`.env`, `CREDENCIAIS-LOCAIS.md`).

## Comandos

- `npm run dev` (CMS + site), `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:int`, `npm run format:check`, `npm run validate-urls`.
- Ambiente local: `docker compose` (Postgres e MinIO).

## Convenções

- Commits pequenos, Conventional Commits (`feat(web): ...`, `fix(cms): ...`).
- Mudanças pequenas e focadas; adaptar o que já existe em vez de reescrever. Seguir o estilo do código vizinho.
- Testes: Vitest para regras de redirect, hooks e scripts; Playwright para e2e das rotas principais.
