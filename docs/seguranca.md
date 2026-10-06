# Segurança: pentest e correções

Revisão estática (white-box) feita em 2026-10-05/06. Os itens marcados como **pendente** dependem de teste ao vivo ou de decisão de infra.

## Corrigido

| Achado | Correção |
| --- | --- |
| Next 16.3.3 na faixa vulnerável a RCE em `next/og` (`ImageResponse`); `undici`, `sharp`, `dompurify`, `source-map-js` vulneráveis | Next 16.3.8 e `overrides` em `pnpm-workspace.yaml`. Restam `braces` (sem correção, dependência de build do `next-sitemap`) e `esbuild` (dev) |
| `PREVIEW_SECRET` aparecia no URL de preview, visível a qualquer editor: um editor do tenant A abria rascunhos do tenant B | O URL leva `previewToken`, HMAC de 30 min preso a host + path (`packages/routes/src/previewToken.ts`). O segredo nunca sai do servidor |
| Open redirect no preview (`/\evil.com`) | `isSafeRelativePath` rejeita barra invertida e caracteres de controle |
| Login local ligado quando `AUTH_LOCAL_ENABLED` está vazio | Em produção, vazio = desligado |
| Upload de mídia sem restrição (SVG/HTML no bucket público) | Allowlist de MIME em `Media.ts` (sem SVG) e limite de 50 MB |
| Sem headers de segurança | `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS; admin com `frame-ancestors 'none'`; site só embutível pelo CMS (live preview) |
| Segredos comparados com `!==` | `timingSafeEqual` em `/api/revalidate/` e `CRON_SECRET` |
| `decodeURIComponent` sem proteção em `readCookie` | Cookie malformado é tratado como ausente |
| Segredos `change-me` aceitos em ambiente publicado | O CMS não sobe com `https://` + `NODE_ENV=production` e segredo curto/placeholder (`assertSecrets.ts`) |

## Pendente / decisões

- **SVG nas mídias**: a allowlist recusa SVG. Se o blog do WordPress ou os editores precisarem, sanitizar no upload em vez de liberar.
- **Acesso SSO só é recalculado no login**: quem sai do grupo no RH-SSO mantém acesso até a sessão expirar (`SSO_SESSION_HOURS`, padrão 8). Reduzir o valor em PRD ou revalidar contra o IdP (refresh token).
- **Rate limit e anti-spam**: `form-submissions` aceita `create` anônimo e não há limite no login. Tratar no CDN/WAF (responsável de infra) e avaliar honeypot/captcha nos formulários.
- **CSP completa**: não foi aplicada (GTM, GA4 e o admin do Payload exigem nonces). Fazer junto com o banner de consentimento.
- **`X-Forwarded-Host`**: o proxy do site confia nele. O CDN/ingress precisa sobrescrevê-lo, e o app não deve ficar exposto direto.
- **`tenants` com leitura pública**: lista todos os domínios, inclusive de campanhas não publicadas. Necessário para o site resolver o host; avaliar um endpoint que devolva só o tenant do host consultado.
- **Ambiente local**: Postgres, MinIO e Keycloak escutam em `0.0.0.0` com credenciais padrão. Não reutilizar esses arquivos em DEV/HML/PRD.
- **Teste ao vivo** (cross-tenant draft, upload de SVG, sessão SSO após remoção do grupo, GraphQL e `/versions` anônimos): ver a seção seguinte quando executado.
