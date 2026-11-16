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
| `og:image`, `twitter:image` | `meta.image` do documento, senão `seoDefaultImage` do tenant, senão o ícone do app (`appIcon`), senão `/website-template-OG.webp` (imagem genérica da plataforma) |
| `og:type` | `website`; `article` nos posts |
| `theme-color` | `#000000` no Uber Conta |

**Aba SEO vazia não deixa a página sem nada** (`documentSeo` em `src/utilities/seo.ts`): título = título do documento; descrição = início do texto do post (160 caracteres, corte em palavra) ou a padrão da propriedade; imagem = `meta.image`, senão a imagem de destaque do post (`heroImage`) ou a do hero da página, senão as da propriedade. Vídeos nunca viram imagem de compartilhamento. `og:image` sai com largura, altura (tamanho `og` de 1200px) e `alt` (o da mídia, senão o título); o `BlogPosting` usa a mesma imagem e descrição. No admin (`src/fields/seo.ts`), os botões "Gerar" do plugin preenchem título (sem sufixo: o site o acrescenta), descrição (início do texto) e imagem (destaque ou hero). A aba também traz a **pré-visualização de compartilhamento** (`src/components/admin/SharePreview`): cartão com imagem, host, título e descrição como WhatsApp, LinkedIn e Facebook mostram, já com os fallbacks acima (o preview do plugin só mostra o resultado do Google, sem imagem). O `seoPlugin` 3.90 só atende os endpoints "gerar" (URL, título, descrição, imagem) das coleções listadas em `collections`; sem isso o preview do Google fica em `https://...` e os botões respondem 403. Por isso `src/plugins/index.ts` lista `pages` e `posts` e descarta o grupo `meta` que o plugin acrescenta (a aba já existe). Cuidado: `overrides` dos campos do plugin substituem o `admin` inteiro, inclusive o botão "Gerar"; ver `metaImage` em `src/fields/seo.ts`.

Tudo é montado por `buildMetadata` (`src/utilities/seo.ts`); páginas e posts passam por `generateMeta`. O Next só põe o `<title>` e as meta tags dentro do `<head>` para robôs conhecidos; `htmlLimitedBots: /.*/` no `next.config.ts` faz isso para qualquer cliente, como o site atual (SSR do Nuxt).

Central de Ajuda do Uber Conta: a pergunta usa a pergunta como título e os 160 primeiros caracteres da resposta como descrição; a categoria usa `Central de Ajuda: <categoria>` e a descrição da categoria; o índice e o blog usam a página `central-de-ajuda` e a página `blog` do CMS.

## Dados estruturados (JSON-LD)

`src/lib/jsonld.ts` e `components/JsonLd`.

| Onde | Tipos |
|---|---|
| Todas as páginas | `Organization`, `WebSite` (com `SearchAction` no Uber Conta), `SoftwareApplication` (Uber Conta) |
| Páginas do CMS | `WebPage`; `FAQPage` quando há bloco de perguntas frequentes |
| Posts (todas as propriedades) | `BreadcrumbList`, `WebPage`, `BlogPosting` com `author` (`Person` por autor; sem autores, a `Organization`) e `articleSection` (categoria) |
| Índice do blog | `BreadcrumbList`, `CollectionPage`, `Blog` |
| Central de ajuda | índice: `BreadcrumbList`, `WebPage`; categoria: `BreadcrumbList`, `WebPage` com `ItemList`; pergunta: `BreadcrumbList`, `QAPage` |

## Mapas do site e robots

- `/sitemap.xml`: índice que aponta para `/pages-sitemap.xml` e `/posts-sitemap.xml`. O `lastmod` de cada um é a data da última alteração do conteúdo (`src/lib/lastModified.ts`), nunca "agora": um `lastmod` que muda a cada requisição faz o Google ignorá-lo. Sem conteúdo, vale a data do tenant.
- `/posts-sitemap.xml` traz a imagem de cada post (`image:image`: imagem de destaque, senão a de compartilhamento).
- `/manifest.webmanifest`: nome, cores e ícone do app da propriedade (`src/lib/manifest.ts`). A cor do tema vem de `themeColorOf` (`src/lib/themes.ts`).
- `/robots.txt`: libera tudo menos `/next/` e `/api/`, e aponta para `/sitemap.xml`. A aba Indexação e ícones de Propriedades traz uma pré-visualização somente leitura do arquivo final (`src/components/admin/RobotsPreview`), montada com a mesma função `robotsTxt`. Com "Bloquear robôs de treinamento de IA" (`blockAiCrawlers`, aba Indexação e ícones), cada robô de `AI_CRAWLERS` (`src/lib/robots.ts`) ganha o próprio grupo `Disallow: /`. O Google Search e os assistentes que buscam a página a pedido do usuário não entram na lista.
- O Uber Conta lista cada categoria da Central de Ajuda (`?slug=`) no mapa; o site atual lista só `/central-de-ajuda/categorias`.

## llms.txt

`/llms.txt` é o guia para assistentes de IA (resumo da empresa e links por seção). Fica no campo "llms.txt" do tenant, em Markdown, e `{{siteUrl}}` vira o endereço da propriedade, então o mesmo texto serve em qualquer ambiente. Campo vazio: `/llms.txt` responde 404. O texto do Uber Conta é o do site atual (`scripts/uber-pages/data-seo/llms.txt`), com um ajuste: o link do Blog aponta para `/blog` do site, não para o Medium.

## O que a propriedade controla

No admin, em Tenants (abas Geral, Aparência, URLs, SEO, Indexação e ícones, Rastreio e Empresa e redes): sufixo do título, imagem padrão de compartilhamento, `llms.txt`. Também por propriedade: idioma do conteúdo (`locale`, padrão `pt-BR`; o `lang` do `<html>` ainda é `pt-BR` fixo, porque fica no layout raiz, acima do tenant), cor do navegador (`themeColor`, também no manifest), estrutura da central de ajuda (`helpStyle`: `topics` ou `flat`; a plana tem a busca em `/central-de-ajuda/busca`, que vira o `SearchAction`) e o aplicativo (aba Empresa e redes: nome e links das lojas, no `SoftwareApplication`). Nenhuma regra de SEO depende do nome do tenant. O logo da organização é o ícone do app. Perguntas e categorias da Central de Ajuda têm título e descrição de SEO opcionais (vazio: título da pergunta e início da resposta; título e descrição da categoria).

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
- `robots.txt`: o do site atual (Nuxt) só diz `User-agent: *` / `Disallow:` (libera tudo) e o `Sitemap`. O do CMS acrescenta `Disallow: /next/` e `/api/`, caminhos internos da plataforma que não existem no site atual; nenhuma regra extra é necessária para o Uber Conta (conferido em 2026-11-16).
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
- **Ícone do manifest:** PNG 512×512, declarado como ícone de 192 e 512 px em `/manifest.webmanifest`, o que os navegadores exigem para oferecer a instalação do site como app. Vazio: só o ícone do app (180×180).
- **Favicon** e **ícone do app:** PNG (a mídia não aceita SVG nem ICO). O ícone do app é o `apple-touch-icon` e o logo do `Organization` no JSON-LD. Vazios: os arquivos da plataforma em `public/` (`/favicon.ico`, `/favicon.svg`, `/icons/apple-touch-icon.png`).

## Dados públicos das propriedades

`src/endpoints/seed/tenant-profiles.ts` (aplicado pelo `bootstrap:dev` e por `npm run tenants:profile`) preenche em Propriedades o que vem dos sites atuais: GTM, empresa (razão social, CNPJ, endereço, SAC), redes sociais, descrição padrão e ícones. Fontes: rodapé, `<head>` e scripts de digio.com.br e ubercontabrasil.com.br.

- **GTM:** Digio `GTM-536PM49`; Uber Conta `GTM-PFPD9ZJ`. Não disparam em localhost (`NEXT_PUBLIC_TRACKING_ON_LOCALHOST=true` liga para testar).
- **Banner de consentimento:** desligado nas duas (a ferramenta de consentimento do site atual vem pelo GTM; ver `docs/virada.md`).
- **Sem valor, por não existir no site atual:** Uber Conta sem redes sociais (só Medium, que o CMS não oferece) e sem ícone do app; Digio sem imagem de compartilhamento padrão, `llms.txt` e link de privacidade. O sufixo do título da Digio fica no padrão (" | Digio").
- O favicon da Digio no site atual é 16×16 (abaixo dos 48×48 recomendados).

## Contrato entre propriedades

`src/lib/tenantContract.test.ts` roda `robots.txt`, índice do sitemap, metadata, JSON-LD, manifest e dados de post com duas propriedades fictícias de escolhas opostas (barra final e URL por categoria x sem barra, posts planos e indexação bloqueada). Garante que nada sai com dados de outra propriedade nem depende do nome do tenant. Ao criar uma regra nova de SEO, ponha a lógica em função pura em `src/lib` e cubra-a ali.

## Backlog de SEO (genérico, vale para qualquer propriedade)

- Já feito: canonical próprio nas páginas de paginação do blog (`/blog/page/N`, `?page=N`).
- `?utm_*` e outros parâmetros de rastreio: confirmar que o canonical aponta para a URL limpa em toda rota que lê `searchParams`.
- `BreadcrumbList` (JSON-LD e visível) nas páginas do CMS, não só no blog e na ajuda.
- `hreflang` e `lang` do `<html>` por propriedade (hoje `pt-BR` fixo no layout raiz), se houver mais de um idioma.
- Qualidade no admin: um único `h1` por página, `alt` obrigatório na coleção `media`, contador de título (50–60) e descrição (120–160), aviso de título ou descrição duplicados na mesma propriedade.
- Script de rastreio de links internos quebrados e cadeias de redirect, em complemento a `scripts/validate-urls.ts` (não há coleção de redirects: slug alterado vira 404).
- IndexNow (Bing, Yandex) no webhook de revalidação, ao publicar ou alterar uma página.
- Dados estruturados extras: `dateModified` e `image` em `BlogPosting`, `VideoObject`, `ContactPoint` na `Organization`.
- Campos no tenant para os tokens de verificação do Google Search Console e do Bing Webmaster.
- Sitemap: dividir em arquivos de até 50 mil URLs quando o blog crescer; `changefreq` e `priority` são ignorados pelo Google.
