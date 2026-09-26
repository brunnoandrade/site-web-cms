# Design system do site

A estrutura visual usa o site do Uber Conta (ubercontabrasil.com.br) como **referência de layout**. Cores, marca e conteúdo são da Digio. Nada do Uber Conta foi criado na plataforma.

## Fundamentos

| Item | Valor | Onde |
|---|---|---|
| Fonte | Montserrat, pesos 400 a 700 | `app/(frontend)/layout.tsx` (`next/font`) |
| Marinho | `navy-900` `#1C2048` (950 `#04091C`, 800 `#212E55`, 700 `#1D2C5C`) | `globals.css`, `@theme` |
| Turquesa (destaque) | `turquoise-400` `#3FECE2`, 300 `#78E9E0` | idem |
| Azul | `brand-blue` `#2E5EF4` | idem |
| Coral | `coral-400` `#FF6776` | idem |
| Lilás (fundos claros) | `lilac-100` `#EAEDFB`, 50 `#F5F6FD` | idem |
| Texto de apoio | `ink-600` `#595959` | idem |
| Títulos | hero `text-display` (64px), seção `text-title` (48px); no celular, 40px e 32px | idem |
| Cantos | cards `rounded-card` (16px), botões em pílula | idem |
| Foco | contorno azul de 2px em `:focus-visible` | idem |

Botões (`components/ui/buttonVariants.ts`): `default` (marinho), `inverse` (branco, para fundos escuros), `accent` (turquesa), `secondary` (lilás), `outline`, `ghost` e `link`.

## Seções

Todo bloco com o campo **Fundo da seção** (`theme`) ocupa a largura toda e escolhe entre: branco, lilás claro, azul-marinho e azul. Componente: `components/Section` (`Section` e `SectionHeading`). Em fundo escuro, os botões e links do bloco trocam sozinhos para as variações claras.

## Blocos

| Bloco | Variações e uso | Referência no Uber Conta |
|---|---|---|
| Hero **Digio (fundo escuro)** | Título grande, texto, até 2 botões, imagem e aviso legal | Hero |
| Cards: **destaque** | Card grande com cor de fundo (marinho, azul, lilás ou branco) e imagem | "Conta, cartão e mais" |
| Cards: **produto** | Card branco com imagem e link "Conhecer →" | Produtos |
| Cards: **ícones** | Card escuro com ícone turquesa e seta; título à esquerda | Grade de soluções |
| Cards: **simples** | Título, texto e imagem opcional | — |
| **Depoimentos** | Carrossel em faixa azul; `**texto**` fica em destaque. Sem rolagem automática (WCAG 2.2.2) | Depoimentos |
| **Lista de posts** | Título e botão "Ir para o blog" à esquerda, 3 posts à direita | Blog |
| **FAQ** | Duas colunas, perguntas em `<details>`, link "Outras dúvidas" | FAQ |
| **Chamada (CTA)** e **Texto** | Com fundo da seção | — |

Ícones disponíveis (lucide): `apps/cms/src/fields/icon.ts` e `apps/web/src/components/Icon`.

O cabeçalho é uma pílula marinho fixa no topo, com botão em destaque ("Abrir conta", configurável). O rodapé tem até 6 colunas de links e o texto legal.

## Exemplo

O `bootstrap:dev` cria a home da Digio com todos esses blocos. Os depoimentos são **ilustrativos**: antes de publicar, trocar por depoimentos reais e autorizados.

O site tem um único tema (claro). Não há seletor claro/escuro/automático: as cores variam só por seção.
