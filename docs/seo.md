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

Tudo é montado por `buildMetadata` (`apps/web/src/utilities/seo.ts`); páginas e posts passam por `generateMeta`. O Next só põe o `<title>` e as meta tags dentro do `<head>` para robôs conhecidos; `htmlLimitedBots: /.*/` no `next.config.ts` faz isso para qualquer cliente, como o site atual (SSR do Nuxt).

Central de Ajuda do Uber Conta: a pergunta usa a pergunta como título e os 160 primeiros caracteres da resposta como descrição; a categoria usa `Central de Ajuda: <categoria>` e a descrição da categoria; o índice e o blog usam a página `central-de-ajuda` e a página `blog` do CMS.

## Dados estruturados (JSON-LD)

`apps/web/src/lib/jsonld.ts` e `components/JsonLd`.

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

`/llms.txt` é o guia para assistentes de IA (resumo da empresa e links por seção). Fica no campo "llms.txt" do tenant, em Markdown, e `{{siteUrl}}` vira o endereço da propriedade, então o mesmo texto serve em qualquer ambiente. Campo vazio: `/llms.txt` responde 404. O texto do Uber Conta é o do site atual (`apps/cms/scripts/uber-pages/data-seo/llms.txt`), com um ajuste: o link do Blog aponta para `/blog` do site, não para o Medium.

## Dados do site atual (Uber Conta)

`npm run -w cms uber:seo` aplica ao CMS os títulos, descrições e palavras-chave capturados do site atual (`apps/cms/scripts/uber-pages/data-seo/seo.json`), o sufixo do título, a imagem de compartilhamento (`share.png`) e o `llms.txt` da propriedade. É seguro rodar de novo. O `bootstrap:dev` já o chama ao fim (depois do conteúdo).

## Conferir contra o site atual

```
python3 scripts/seo-audit.py --out docs/seo-audit-uber-conta.md
```

Lê as URLs da tabela de `docs/checklist-uber-conta.md`, compara `<head>` e tipos de JSON-LD de cada uma com o site de referência (`--ref`) e o ambiente testado (`--target`), e sai com código 1 se houver diferença. Diferenças aceitas de propósito ficam em `KNOWN` no script e aparecem no relatório com o motivo.

Diferenças aceitas hoje:
- `canonical` das categorias da Central: o site atual aponta todas para `/central-de-ajuda/categorias`, o que junta as páginas no Google; aqui cada categoria é o próprio canonical.
- `/central-de-ajuda/categorias` sem `?slug=` redireciona para `/central-de-ajuda`.
- Na busca, o site atual mantém o sufixo no `og:title` e não envia `twitter:title`.
