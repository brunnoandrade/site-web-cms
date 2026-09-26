# Aderência ao SoAD e decisões

Comparação entre o SoAD "Plataforma Web Digio (Payload CMS Multi-tenant)" e este repositório, com as decisões tomadas em 24/09/2026.

## Decisões

| # | Tema | Decisão | Impacto no SoAD |
|---|---|---|---|
| D1 | Arquitetura | **Dois projetos separados**: `apps/cms` (Payload: admin e API) e `apps/web` (site público). O site lê o conteúdo pela API REST do CMS, não pela Local API. | Atualizar a seção "Sistemas", o diagrama C2 e o ADR 002 (hoje dizem "mesmo deploy, Local API sem hop HTTP"). |
| D2 | Banco | **PostgreSQL** (RDS PostgreSQL). O Payload 3 não tem adaptador MySQL. | Corrigir o ADR 005, a lista de tecnologias, o ambiente de desenvolvimento e a estimativa de custo (hoje dizem MySQL). |
| D3 | Multi-tenant | Deixar a plataforma **pronta para todos os cenários** já nesta entrega: N tenants, domínio próprio por tenant, conteúdo, usuários e mídia isolados, criação de tenant por configuração, sem deploy. O tenant inicial é `digio`. | Alinhado com o SoAD. Amplia o `escopo.md` (F0 + F1 previa um só site). |
| D4 | Autenticação do admin | **Dois autenticadores lado a lado**: login local (e-mail e senha) e SSO corporativo (RH-SSO/Keycloak, OIDC), com botão "Entrar com SSO" na tela de login. Cada um valida as próprias credenciais e tem o próprio logout. | O SoAD pede "sem usuário local em produção": o login local tem que poder ser desligado por ambiente (ver regras abaixo). |

### Regras de autenticação (D4)

- Cada usuário tem um **provedor de origem** (`local` ou `sso`) e só entra pelo seu provedor:
  - usuário SSO não entra com senha;
  - usuário local não entra pelo SSO.
- **Login local:** e-mail e senha do Payload, com bloqueio após tentativas erradas.
- **Login SSO:** fluxo OIDC Authorization Code com PKCE, `state` e `nonce`. O token é validado (assinatura, `iss`, `aud`, `exp`) antes de criar a sessão.
- **Logout separado:**
  - local: encerra só a sessão do Payload;
  - SSO: encerra a sessão do Payload e também a do RH-SSO (logout iniciado pelo sistema, com `id_token_hint`).
- **Papéis e tenants vindos do SSO:** os `roles` e grupos do token do RH-SSO definem papel e tenants do usuário. O mapeamento é configurável.
- **Chave por ambiente:** uma variável liga ou desliga o login local em cada ambiente (em PRD, o padrão é desligado, conforme o SoAD). O SSO também pode ser desligado, por exemplo no desenvolvimento sem Keycloak.
- **Ambiente local:** um Keycloak no `docker compose` para testar o fluxo SSO de ponta a ponta.

## Gaps: requisitos do SoAD que ainda não estão no projeto

| Requisito | Situação | Tarefa |
|---|---|---|
| SSO OIDC (RH-SSO) no admin | **Feito (2b)**, testado de ponta a ponta com Keycloak | Autenticação dupla (D4). Com `openid-client`, não NextAuth: o NextAuth manteria uma segunda sessão paralela à do Payload |
| Permissões por tenant | **Feito (2a)**, com testes de integração | Plugin multi-tenant e papéis `admin`, `editor`, `seo` por tenant |
| Resolver domínio → tenant → página | **Feito (2a)** | Domínios no tenant; `proxy.ts` do `apps/web` resolve o host, com cache em memória que segura se o CMS cair |
| Mídia isolada por tenant | **Feito (2a)** | Prefixo `tenants/<slug>/` no S3 |
| Publicação atualiza o cache da borda (CloudFront e Akamai) | O webhook atualiza só o cache do Next | Invalidação na CDN, junto com infra |
| Escala horizontal (app sem estado) | O cache do Next fica no disco de cada réplica, e o webhook só chega a uma | Cache compartilhado entre réplicas (Redis ou S3). Em dev, respostas antigas do cache de dados reapareceram após reiniciar o `next dev`; o cache compartilhado resolve os dois casos. |
| P95 < 1s servido do cache da CDN | **Resolvido (2a)**: páginas, posts e listas são ISR com `s-maxage`; só a busca é dinâmica | Validar com a CDN |
| Logs estruturados, métricas e tracing | Não existe | Observabilidade (OpenTelemetry) |
| Health check para o EKS | Não existe | Rotas de liveness e readiness nos dois apps |
| LGPD: formulários com consentimento | O form-builder não tem campo de consentimento | M.14 |
| Catálogo de blocos como pacote npm | Blocos dentro do `apps/web` | M.7/M.8: `packages/blocks` |
| Ambiente local com Podman | O compose funciona com Docker; Podman não foi testado | Testar com Podman |

## Pontos de atenção da arquitetura com dois projetos

1. **Formulários públicos:** hoje o navegador do visitante envia direto para o CMS. Com o CMS só na VPN, isso quebra. O envio tem que passar pelo `apps/web`, com um proxy no servidor.
2. **Usuário de serviço do preview** (`CMS_API_KEY`): é uma conta local. Precisa ser aceito pela SI como conta de serviço, sem login interativo, ou ser substituído.
   - Já aplicado: só contas de serviço (papel `preview`, só leitura) podem ter chave de API, e só o super admin gera ou troca a chave. A opção não aparece para os outros usuários, e tirar o papel `preview` revoga a chave. Regra em `apps/cms/src/collections/Users/hooks/apiKey.ts`, testes em `tests/int/api-key.int.spec.ts`.
3. **Barra de admin no site:** depende da sessão do CMS no navegador. Com SSO e domínios diferentes, precisa ser revista ou removida.
4. **Admin só pela VPN:** com dois projetos, o CMS inteiro fica fora da internet pública. O `apps/web` acessa a API do CMS pela rede interna.
