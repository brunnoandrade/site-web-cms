# Segurança: pentest e correções

Revisão estática (white-box) feita em 2026-10-05/06. Os itens marcados como **pendente** dependem de teste ao vivo ou de decisão de infra.

## Corrigido

| Achado | Correção |
| --- | --- |
| Next 16.3.3 na faixa vulnerável a RCE em `next/og` (`ImageResponse`); `undici`, `sharp`, `dompurify`, `source-map-js` vulneráveis | Next 16.3.8 e `overrides` no `package.json` raiz. Restam `braces` (sem correção, dependência de build do `next-sitemap`) e `esbuild` (dev) |
| `PREVIEW_SECRET` aparecia no URL de preview, visível a qualquer editor: um editor do tenant A abria rascunhos do tenant B | O URL leva `previewToken`, HMAC de 30 min preso a host + path (`packages/routes/src/previewToken.ts`). O segredo nunca sai do servidor |
| Open redirect no preview (`/\evil.com`) | `isSafeRelativePath` rejeita barra invertida e caracteres de controle |
| Login local ligado quando `AUTH_LOCAL_ENABLED` está vazio | Em produção, vazio = desligado |
| Upload de mídia sem restrição (SVG/HTML no bucket público) | Allowlist de MIME em `Media.ts` (sem SVG) e limite de 50 MB |
| Sem headers de segurança | `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS; admin com `frame-ancestors 'none'`; site só embutível pelo CMS (live preview) |
| Segredos comparados com `!==` | `timingSafeEqual` em `/api/revalidate/` e `CRON_SECRET` |
| `decodeURIComponent` sem proteção em `readCookie` | Cookie malformado é tratado como ausente |
| Acesso SSO só era recalculado no login: com o usuário desabilitado e sem grupo no Keycloak, a sessão do CMS seguia ativa (confirmado ao vivo) | A cada `SSO_REVALIDATE_SECONDS` (padrão 300) o CMS troca o refresh token (guardado criptografado no usuário) por novas claims: papéis/propriedades são ressincronizados e uma recusa do IdP encerra a sessão. Se o IdP estiver fora, mantém a sessão por até 1 h (`auth/revalidate.ts`) |
| GraphQL aberto: introspecção ligada e 200 aliases aceitos numa única query (confirmado ao vivo); o site só usa REST | `graphQL: { disable: true }` em `payload.config.ts` (`/api/graphql` responde 404) |
| Links digitados por editores (campo `link`, links do rich text, destino de redirect) aceitavam qualquer esquema (`javascript:`, `data:`, `//host`). O React 19 bloqueia `javascript:`, mas `data:` passava | Allowlist em `packages/routes/src/safeHref.ts`: caminho do site, http(s), mailto e tel (redirect: só caminho e http(s)). Validada no CMS e também no site (`CMSLink`, redirect do formulário), o que cobre dados já salvos |
| **Formulário público quebrado**: todo envio anônimo dava 400 (`tenant` inválido), porque o hook `enforceTenantMembership` do plugin multi-tenant recusava o tenant atribuído pelo nosso hook | Campo `tenant` próprio em `form-submissions` e atribuição em `beforeChange` (depois do hook do plugin, que continua barrando tenant enviado pelo cliente) |
| Envio de formulário sem limite de tamanho | Máx. 50 campos de 10 mil caracteres por envio |
| `/search/?q=%00` dava 500 (NUL no Postgres) | `q` só aceita string, sem caracteres de controle, até 100 caracteres |
| Histórico de versões dava **500** para qualquer não super-admin (`readVersions` filtrava `tenant` em vez de `version.tenant`) | `tenantRolesForVersions` em `access/roles.ts`; teste de regressão em `tenant-isolation.int.spec.ts` |
| SSRF na migração do WordPress: `<img src>` e `og:image` do conteúdo eram baixados de qualquer URL, seguindo redirects | `wordpress/safeFetch.ts`: só http(s), bloqueia loopback, redes privadas, link-local e metadata (inclusive via DNS e redirects), tamanho máximo de 50 MB |
| Segredos `change-me` aceitos em ambiente publicado | O CMS não sobe com `https://` + `NODE_ENV=production` e segredo curto/placeholder (`assertSecrets.ts`) |

## Pendente / decisões

- **DNS rebinding na migração**: o `safeFetch` valida o DNS antes de baixar, mas a conexão resolve de novo. Aceitável para uma ferramenta de operador; rodar a migração em rede sem acesso a serviços internos.
- **SVG nas mídias**: a allowlist recusa SVG. Se o blog do WordPress ou os editores precisarem, sanitizar no upload em vez de liberar.
- **Rate limit e anti-spam**: `form-submissions` aceita `create` anônimo e não há limite no login. Tratar no CDN/WAF (responsável de infra) e avaliar honeypot/captcha nos formulários.
- **CSP completa**: não foi aplicada (GTM, GA4 e o admin do Payload exigem nonces). Fazer junto com o banner de consentimento.
- **`X-Forwarded-Host`**: o proxy do site confia nele. O CDN/ingress precisa sobrescrevê-lo, e o app não deve ficar exposto direto.
- **`tenants` com leitura pública**: lista todos os domínios, inclusive de campanhas não publicadas. Necessário para o site resolver o host; avaliar um endpoint que devolva só o tenant do host consultado.
- **Dependências sem correção**: `npm audit --omit=dev` ainda lista `braces` (sem versão corrigida, vem do `next-sitemap`, só em build) e `esbuild` (dev, via `drizzle-kit`). Reavaliar a cada atualização do Payload e do `next-sitemap`; rodar `pnpm audit` no CI.
- **CSRF "same-site"**: o cookie SSO é aceito quando `Sec-Fetch-Site` é `same-site`. Se o CMS e os sites ficarem em subdomínios do mesmo domínio, um subdomínio comprometido ou com conteúdo de terceiros atingiria o admin sem `Origin`. Manter o CMS em um domínio próprio, fora dos domínios dos sites.
- **Revalidação do SSO em várias instâncias**: ver a ressalva sobre rotação de refresh token na seção de teste ao vivo. Se o RH-SSO de PRD rotacionar refresh tokens, mover o controle para o banco (lock por usuário).
- **Ambiente local**: Postgres, MinIO e Keycloak escutam em `0.0.0.0` com credenciais padrão. Não reutilizar esses arquivos em DEV/HML/PRD.

## Teste ao vivo (2026-10-06)

Stack local (Postgres, MinIO, Keycloak, CMS e site). Testes de integração: 94/94, mais `media-upload.int.spec.ts`.

- Anônimo: `/api/*/versions`, `users`, `form-submissions`, `payload-preferences` respondem 403; `?draft=true` só devolve `published`; `emails` dos formulários vêm vazios.
- `/api/revalidate/` sem token ou com token errado: 401. Preview com segredo antigo, token inválido, `//evil.com` ou `/\evil.com`: 403/400.
- Upload: PNG aceito; SVG com script e HTML recusados.
- Headers de segurança presentes no CMS e no site.
- SSO ponta a ponta (`apps/cms/scripts/sso-smoke.py`): login, logout, recusas e CSRF passam. Revogação: antes da correção, grupo removido e usuário desabilitado no Keycloak não encerravam a sessão; depois, ambos encerram (rodar o smoke com `SSO_REVALIDATE_SECONDS=3` no CMS).
- Preview, caminho feliz: link gerado pelo CMS abre o site com 307 e cookie de draft; o mesmo token em outro path ou no host de outro tenant dá 403.

## Segunda rodada (2026-10-06)

Escopo: links e redirects, formulários, rotas do site, scripts de migração e papéis por tenant **via REST** (usuários temporários, já removidos).

- Papéis por REST (editor, seo, admin de A e de B, super-admin): leitura, escrita, movimentação e criação entre tenants são negadas; rascunhos e versões ficam isolados por tenant; ninguém escala papel, adiciona a si mesmo a outro tenant, cria API key, troca o slug do tenant ou cria super-admin. Atenção: o Payload responde **200** e descarta o campo sem permissão, então verifique o estado salvo, não o status.
- Rotas do site: `/<slug-do-tenant>/` direto no host de outro tenant dá 404; `robots.txt` usa o host da requisição; `X-Forwarded-Host` desconhecido dá 404.
- `apps/cms/scripts/public-api-smoke.py` repete as sondas anônimas contra qualquer ambiente (`CMS=… WEB=…`).
- Não coberto: `import-redirects` (CSV, só admin/seo, passa pelos mesmos hooks), fuzzing do admin e teste de carga.

- Ressalva da revalidação: se o Keycloak ativar rotação de refresh token com reuso proibido, requisições paralelas em várias instâncias do CMS podem se atropelar (há controle só dentro do processo).
