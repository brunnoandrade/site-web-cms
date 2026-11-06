# SEO

Como o site monta títulos, descrições, dados estruturados e mapas do site, e como conferir contra o site que está sendo substituído. Vale para todas as propriedades; os números abaixo são do Uber Conta, que foi a primeira a ser conferida URL por URL.

## O que cada página envia

| Item | Origem |
|---|---|
| `<title>` | `meta.title` do documento + sufixo da propriedade (`seoTitleSuffix` no tenant; vazio: ` \| <nome>`). Uber Conta: ` • Uber Conta` |
| `og:title`, `twitter:title` | `meta.title` **sem** sufixo |
| `description`, `og:description`, `twitter:description` | `meta.description` |
| `keywords` | `meta.keywords` (campo "Palavras-chave" da aba SEO de páginas e posts) |
| `robots` | `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`; `noindex, follow` na busca |
| `canonical`, `og:url` | URL pública da propriedade + caminho, pela política de URL (`pathsOf(tenant)`) |
| `og:image`, `twitter:image` | `meta.image` do documento, senão `seoDefaultImage` do tenant, senão `/website-template-OG.webp` |
| `og:type` | `website`; `article` nos posts |
| `theme-color` | `#000000` no Uber Conta |

Tudo é montado por `buildMetadata` (`src/utilities/seo.ts`); páginas e posts passam por `generateMeta`. O Next só põe o `<title>` e as meta tags dentro do `<head>` para robôs conhecidos; `htmlLimitedBots: /.*/` no `next.config.ts` faz isso para qualquer cliente, como o site atual (SSR do Nuxt).

Central de Ajuda do Uber Conta: a pergunta usa a pergunta como título e os 160 primeiros caracteres da resposta como descrição; a categoria usa `Central de Ajuda: <categoria>` e a descrição da categoria; o índice e o blog usam a página `central-de-ajuda` e a página `blog` do CMS.

## Dados estruturados (JSON-LD)

`src/lib/jsonld.ts` e `components/JsonLd`.

| Onde | Tipos |
|---|---|
| Todas as páginas | `Organization`, `WebSite` (com `SearchAction` no Uber Conta), `SoftwareApplication` (Uber Conta) |
| Páginas do CMS | `WebPage`; `FAQPage` quando há bloco de perguntas frequentes |
| Posts | `BreadcrumbList`, `WebPage`, `BlogPosting` |
| Índice do blog | `BreadcrumbList`, `CollectionPage`, `Blog` |
| Central de ajuda | índice: `BreadcrumbList`, `WebPage`; categoria: `BreadcrumbList`, `WebPage` com `ItemList`; pergunta: `BreadcrumbList`, `QAPage` |

## Mapas do site e robots

- `/sitemap.xml`: índice que aponta para `/pages-sitemap.xml` e `/posts-sitemap.xml`.
- `/robots.txt`: libera tudo menos `/next/` e `/api/`, e aponta para `/sitemap.xml`.
- O Uber Conta lista cada categoria da Central de Ajuda (`?slug=`) no mapa; o site atual lista só `/central-de-ajuda/categorias`.

## llms.txt

`/llms.txt` é o guia para assistentes de IA (resumo da empresa e links por seção). Fica no campo "llms.txt" do tenant, em Markdown, e `{{siteUrl}}` vira o endereço da propriedade, então o mesmo texto serve em qualquer ambiente. Campo vazio: `/llms.txt` responde 404. O texto do Uber Conta é o do site atual (`scripts/uber-pages/data-seo/llms.txt`), com um ajuste: o link do Blog aponta para `/blog` do site, não para o Medium.

## O que a propriedade controla

No admin, em Tenants (abas Geral, Aparência, URLs, SEO, Indexação e ícones, Rastreio e Empresa e redes): sufixo do título, imagem padrão de compartilhamento, `llms.txt`. O aplicativo (nome e links das lojas) dos dados estruturados e o logo da organização ficam no código, em `src/lib/jsonld.ts` (`apps`). Perguntas e categorias da Central de Ajuda têm título e descrição de SEO opcionais (vazio: título da pergunta e início da resposta; título e descrição da categoria).

## Dados do site atual (Uber Conta)

`npm run uber:seo` aplica ao CMS os títulos, descrições e palavras-chave capturados do site atual (`scripts/uber-pages/data-seo/seo.json`), o sufixo do título, a imagem de compartilhamento (`share.png`) e o `llms.txt` da propriedade. É seguro rodar de novo. O `bootstrap:dev` já o chama ao fim (depois do conteúdo).

## Conferir contra o site atual

```
python3 scripts/seo-audit.py --out docs/seo-audit-uber-conta.md
```

Lê as URLs da tabela de `docs/checklist-uber-conta.md`, compara `<head>` e tipos de JSON-LD de cada uma com o site de referência (`--ref`) e o ambiente testado (`--target`), e sai com código 1 se houver diferença. Diferenças aceitas de propósito ficam em `KNOWN` no script e aparecem no relatório com o motivo.

Diferenças aceitas hoje:
- `canonical` das categorias da Central: o site atual aponta todas para `/central-de-ajuda/categorias`, o que junta as páginas no Google; aqui cada categoria é o próprio canonical.
- `/central-de-ajuda/categorias` sem `?slug=` redireciona para `/central-de-ajuda`.
- Na busca, o site atual mantém o sufixo no `og:title` e não envia `twitter:title`.

## Rastreio, consentimento e dados da empresa

Em Propriedades, aba **Rastreio**: ID do GTM (`GTM-…`), ID do GA4 (`G-…`, só vale sem GTM, para não contar em dobro), banner de consentimento e link da política de privacidade. O componente `src/components/Tracking` carrega o script ocioso, fora do preview.

- **Banner ligado:** Consent Mode v2 começa tudo `denied` e vira `granted` só se o visitante aceitar. A escolha fica no `localStorage` (`consent:<propriedade>`).
- **Banner desligado:** o rastreio carrega direto (`granted`). Use assim quando o GTM já traz a ferramenta de consentimento do site atual (ver `docs/virada.md`), para não ter dois avisos.
- Textos do banner ficam no componente (`texts`).

Aba **Empresa e redes**: razão social, CNPJ, endereço, SAC e redes sociais. Entram no `Organization` do JSON-LD (`legalName`, `taxID`, `address`, `contactPoint`, `sameAs`). Campos vazios não saem. Salvar Propriedades derruba o cache do site (hook `revalidateSite`).

## Indexação e ícones

Aba **Indexação e ícones** de Propriedades:

- **Bloquear indexação:** `robots.txt` vira `Disallow: /` e todas as páginas saem com `noindex, nofollow` (`robotsOf` em `src/utilities/seo.ts`). Para DEV e HML. Em produção, desligado.
- **Regras extras do robots.txt:** só `Allow:`/`Disallow:` (e comentários `#`), validadas no admin para o editor não conseguir mexer em `User-agent` ou `Sitemap`. Entram depois de `/next/` e `/api/`. Ignoradas quando a indexação está bloqueada.
- **Descrição padrão:** vale quando a página não tem descrição (`seoDescription`), em `description`, `og:` e `twitter:`.
- **Favicon** e **ícone do app:** PNG (a mídia não aceita SVG nem ICO). O ícone do app é o `apple-touch-icon` e o logo do `Organization` no JSON-LD. Vazios: os arquivos da plataforma em `public/` (`/favicon.ico`, `/favicon.svg`, `/icons/apple-touch-icon.png`).
