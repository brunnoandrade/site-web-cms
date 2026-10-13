# Propriedade Uber Conta (ubercontabrasil.com.br)

Segundo tenant de produção da plataforma, depois do `digio`. O site atual (Nuxt + Strapi, feito pela Orbital) é recriado com os blocos da plataforma, sem código próprio por site.

## Como subir localmente

`npm run -w cms bootstrap:dev` cria o tenant `uber-conta` (domínio `uberconta.localhost`, tema `uber-conta`) com a home, FAQs, cabeçalho e rodapé de exemplo (`apps/cms/src/endpoints/seed/uber-conta.ts`). Acesse `http://uberconta.localhost:3000`. Os textos são os do site atual; as imagens são provisórias.

## Tema por propriedade

Campo **Tema visual** (`themePreset`) no tenant. Cada preset sobrescreve os tokens de cor de `globals.css` em `apps/web/src/lib/themes.ts`, aplicado no `[tenant]/layout.tsx`. Os blocos não mudam: só a paleta. Novo tema = novo preset no código e na lista do campo (exige deploy; não é livre para o editor de propósito).

Os nomes dos tokens são herdados da Digio: `navy` é a cor de seção escura (preto no Uber Conta), `turquoise` o destaque sobre fundo escuro, `lilac` a seção clara (cinza `#E8E8E8`). Fonte: o Uber Conta usa UberMove (proprietária, não incluída); o site usa Montserrat até haver licença.

## Seção do site atual → bloco

| Seção | Bloco | Situação |
|---|---|---|
| Hero | hero `brand` | Parcial: o original tem **vídeo** de fundo (desktop e mobile) |
| "Tudo que você precisa" (3 atalhos) | `cards` · destaque | Parcial: cor de fundo livre e imagem diferente no mobile |
| Empréstimos | `cards` · produto | OK |
| Depoimentos | `testimonials` | OK (confirmar autorização dos textos) |
| Soluções (6 itens, vídeo de fundo) | `cards` · ícone | Parcial: sem vídeo de fundo; ícones são da lista fixa, não SVG próprio |
| Blog | `archive` | OK. No site atual o blog é externo (Medium); aqui seria interno (decisão pendente) |
| Faixa de imagem | `mediaBlock` | Parcial: sem imagem separada para mobile |
| FAQ (+ JSON-LD `FAQPage`) | `faq` | Bloco OK; confirmar que emite o JSON-LD |
| Cabeçalho com menu "Pra você" em colunas | `header` | **Falta**: só links planos (máx. 6), sem submenu |
| Rodapé (6 colunas, logos das lojas) | `footer` | Parcial: colunas OK; sem logo e sem selos de loja como imagem |
| Central de ajuda (`/central-de-ajuda`, com busca em `/central-de-ajuda/busca`) | `help-topics`/`faqs` | A confirmar: não vi as páginas internas; a plataforma não tem busca própria |

## Próximas etapas (propostas, uma por revisão)

1. **Cabeçalho com submenu** (grupos de links em colunas) e logo por tenant (cabeçalho e rodapé).
2. **Vídeo no hero e nas soluções** (a mídia já aceita mp4; falta o campo nos blocos, poster e pausa/`prefers-reduced-motion`, WCAG 2.2.2).
3. **Imagem desktop + mobile** (`<picture>`) em atalhos e faixa de imagem; cor de fundo livre nos cards de destaque.
4. **Páginas internas** (conta digital, pix, cartão, crédito pessoal etc.): preciso do HTML de cada uma para mapear em blocos.
5. **Migração do conteúdo**: o Strapi atual tem API; mesmo modelo do script do WordPress. Posts hoje no Medium.
6. Redirects e `validate-urls` com as URLs atuais; GTM/GA4 do site atual.

## Atenção

- Os assets (imagens, vídeos, logos) e os depoimentos são do site em produção: usar os arquivos originais fornecidos pela Digio/Orbital, não baixar do site.
- `tenant.siteUrl` e o domínio de produção só entram na virada (ver `docs/virada.md`).
