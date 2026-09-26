# Escopo F0 + F1 (orçamento de 1.000 h)

Squad: 2 devs sêniores (M1–M3) + 1 responsável de infra (M2–M4).
Escopo: 945 h. Reserva: 55 h. Go-live em 4 ondas até o fim de M3.

| ID | Entregável | Resp. | Horas |
|---|---|---|---|
| M.1 | Setup do projeto (Next + Payload + Postgres, padrões, lint, testes) | Dev 1 | 35 |
| M.2 | Ambientes DEV/HML/PRD e CI/CD | Infra | 45 |
| M.3 | Infra e borda (containers, storage, CDN + WAF, DNS, monitoramento) | Infra | 50 |
| M.4 | Fallback estático | Infra | 30 |
| M.5 | Modelagem do CMS | Dev 1 | 55 |
| M.6 | Preview, versões e permissões | Dev 1 | 25 |
| M.7 | Design system em código | Dev 2 | 90 |
| M.8 | Blocos reutilizáveis (~10) | Dev 2 | 60 |
| M.9 | UI das páginas (Stitch) | Dev 2 | 30 |
| M.10 | Páginas prioritárias (~12) | Dev 2 | 80 |
| M.11 | Carga de conteúdo | Dev 2 | 25 |
| M.12 | Levantamento e mapeamento de URLs | Dev 1 | 20 |
| M.12b | Redirects 301 no CMS (plugin, CSV, middleware, validação) | Dev 1 | 35 |
| M.13 | SEO técnico | Dev 1 | 30 |
| M.14 | Analytics, rastreio e consentimento | Dev 1 | 40 |
| M.15 | Acessibilidade (Libras + WCAG) | Dev 2 | 25 |
| M.16 | Central de ajuda v1 | Dev 1 | 30 |
| M.17 | Estrutura do blog no CMS | Dev 2 | 30 |
| M.18 | Migração dos posts (WordPress → Payload) | Dev 1 | 35 |
| M.19 | Validação de URLs e SEO do blog | Dev 1 | 15 |
| M.20 | Testes e performance | Devs | 60 |
| M.21 | Go-live e hypercare | Devs | 40 |
| M.23 | Virada por partes (4 ondas) | Devs | 20 |
| M.23b | Roteamento na CDN por onda | Infra | 10 |
| M.22 | Documentação e handover | Devs | 30 |

## Tarefas adicionadas após a comparação com o SoAD (horas a estimar)
Detalhes e decisões em `docs/gaps-soad.md`.

| ID | Entregável | Resp. | Horas |
|---|---|---|---|
| A.1 | Multi-tenant completo: domínio → tenant, isolamento de conteúdo, usuários e mídia, tenant por configuração | Dev 1 | a estimar |
| A.2 | Autenticação dupla no admin: login local + SSO RH-SSO (OIDC), logouts separados, Keycloak local | Dev 1 | a estimar |
| A.3 | Invalidação do cache da CDN (CloudFront/Akamai) ao publicar | Dev 1 + Infra | a estimar |
| A.4 | Cache do Next compartilhado entre réplicas (Redis ou S3) | Dev 1 + Infra | a estimar |
| A.5 | Observabilidade: logs estruturados, métricas e tracing (OpenTelemetry) | Dev 1 + Infra | a estimar |
| A.6 | Health checks (liveness/readiness) nos dois apps | Dev 1 | a estimar |
| A.7 | Envio de formulários pelo site (proxy), sem expor o CMS | Dev 1 | a estimar |

## Fora deste escopo (F2 a F4)
Simuladores e WhatsApp com contexto, proposta web, autenticação/BFF, chatbot, Meu Digio Web, páginas secundárias, busca na ajuda, A/B, portal RH, Uber Conta.

## Ordem sugerida de trabalho
1. Semanas 1–4 (local): M.1, M.5, M.6, M.7 e o início de M.8. Scaffold, modelo de conteúdo e design system.
2. Semanas 5–9: páginas, blog (estrutura + migração), redirects, SEO, analytics, ajuda.
3. Semanas 9–12: qualidade, validação de URLs e virada em 4 ondas.
