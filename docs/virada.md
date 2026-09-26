# Virada em ondas

Uma CDN controlada pela Digio fica na frente do site atual (Orbital) e do site novo. Cada onda move um grupo de caminhos de URL para o site novo. Voltar atrás é reverter a regra na CDN.

| Onda | Caminhos | Semana |
|---|---|---|
| 1 | `/blog/*` | S9 |
| 2 | institucional e central de ajuda | S10 |
| 3 | páginas de produto | S11 |
| 4 | home e restante (100%) | S12 (fim de M3) |

## Em cada onda
1. Congelar o conteúdo daquela seção na Orbital (1–2 dias antes).
2. Ativar os redirects da seção no CMS.
3. Trocar a regra de caminho na CDN.
4. Rodar `scripts/validate-urls.ts` e acompanhar o GA4 em tempo real.
5. Critério de volta: erro 5xx, 404 em URL com tráfego ou queda de sessões. Nesse caso, reverter a regra na CDN.

## Implicações para o código
- Header, footer e menu têm que ficar coerentes com o site da Orbital enquanto os dois convivem.
- O mesmo GTM e a mesma ferramenta de consentimento nos dois sites.
- Os redirects precisam poder ser ativados por seção. Sugestão: campo `wave` (1–4) e `active` na coleção `redirects`.

## Pedidos à Orbital (semana 1)
Lista de redirects atuais, inventário de URLs e sitemap, quem controla domínio/DNS/CDN/certificado, integrações chamadas pelo site, export de conteúdo e mídia, e dados do contrato.
