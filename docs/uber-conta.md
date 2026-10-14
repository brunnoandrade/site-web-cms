# Propriedade Uber Conta (ubercontabrasil.com.br)

Segundo tenant de produção da plataforma, depois do `digio`. O site atual (Nuxt + Strapi) é recriado com os blocos da plataforma, sem código próprio por site.

## Como subir localmente

`npm run -w cms bootstrap:dev` cria o tenant `uber-conta` (domínio `uberconta.localhost`, tema `uber-conta`) com a home, FAQs, cabeçalho e rodapé de exemplo (`apps/cms/src/endpoints/seed/uber-conta.ts`). Acesse `http://uberconta.localhost:3000`. Os textos são os do site atual; as imagens são provisórias. O cabeçalho usa logo branca e o rodapé (claro) usa logo preta, ambas em `seed/uber-conta-assets/`. Para trocar uma imagem sem rodar o seed: admin → Layout → Cabeçalho/Rodapé → campo de imagem.

## Tema por propriedade

Campo **Tema visual** (`themePreset`) no tenant. Cada preset sobrescreve os tokens de cor de `globals.css` em `apps/web/src/lib/themes.ts`, aplicado no `[tenant]/layout.tsx`. Os blocos não mudam: só a paleta. Novo tema = novo preset no código e na lista do campo (exige deploy; não é livre para o editor de propósito).

Os nomes dos tokens são herdados da Digio: `navy` é a cor de seção escura (preto no Uber Conta), `turquoise` o destaque sobre fundo escuro, `lilac` a seção clara (cinza `#E8E8E8`). Fonte: o Uber Conta usa UberMove (proprietária, não incluída); o site usa Montserrat até haver licença.

## Design system do Uber Conta (extraído do HTML do site atual)

O tema `uber-conta` (`apps/web/src/lib/themes.ts`) reaproveita os componentes da plataforma e só troca tokens. O que vem do site atual:

| Item | Valor no site atual | Na plataforma |
|---|---|---|
| Cores | preto `#000`, azul `#276ef1` (depoimentos), azul dos atalhos `#2466df`, cinza claro `#e8e8e8` / `#f3f3f3`, texto de apoio `#4b4b4b`, aviso legal `#bababa` | tokens de cor do tema (`navy`, `brand-blue`, `lilac`, `ink`) |
| Botão grande | padding `1rem 1.7rem`, cantos `.6rem`, peso 400, 16px; claro: fundo branco, hover `#ebebeb`, ativo `#d6d6d6`; ícone de seta 15px à direita | `--button-radius`, `--button-weight`, `--button-px-lg` (a Digio segue em pílula) |
| Botão do menu | pílula (`rounded-pill`), fundo `#ffffff3d` | classes do próprio cabeçalho |
| Botão âncora (`#secao`) | seta virada para baixo | automático quando o link começa com `#` (hero) |
| Títulos | display-3 64px, display-4 48px, display-6 32px, display-7 24px, peso 600; no celular 1.35rem e 1rem | `text-display`, `text-title` |
| Cantos | cards `1rem`, imagem larga `2rem` (celular `1rem`), menu `2rem` | `rounded-card` e classes do bloco |
| Seção | padding vertical 6rem (celular 2.5rem), container 1140px | `Section` |
| Fonte | Uber Move / Uber Move Text (proprietária, sem licença) | Montserrat até haver licença |

Comportamento por largura (medido no CSS do site atual; conferir com capturas em 390px e 1440px):

| Parte | Desktop | Mobile |
|---|---|---|
| Troca do menu | a partir de 992px: barra de 60px, menu centralizado, mega menu no hover (mouse) ou clique/teclado | abaixo de 992px: barra de 65px com logo, "Abrir conta" e hambúrguer; menu em gaveta pela esquerda (até 400px, fundo desfocado, fecha com Esc, fundo ou X) |
| Hero | a partir de 768px: mínimo 100vh, coluna de 570px centralizada na vertical, título fluido (64px a partir de 1200px), vídeo cobre o hero todo (mín. 900px de altura) | coluna de uma tela, 15vh de respiro no topo, botão colado embaixo (largura total, seta para baixo), aviso legal centralizado; vídeo com proporção original, 100px acima da borda inferior |
| Rodapé | a partir de 992px: logo e cartão em 1/4, três colunas por linha, links de 16px | tudo empilhado, duas colunas por linha, links de 14px sem espaço extra, barra inferior centralizada |
| Container | 540/720/960/1140/1320px, margem de 12px (só no tema Uber Conta) | idem |

Limites conhecidos: a gaveta mobile foi montada sem ver o conteúdo original (o HTML guardado vem vazio); o título do hero quebra em 4 linhas no desktop porque o Montserrat é mais largo que a Uber Move.

Pendentes de alinhar ao original, seção por seção: tipografia fina (tamanhos e pesos dos títulos), animações de hover (zoom nas imagens, botão que sobe nos atalhos) e espaçamentos.

## Seção do site atual → bloco

| Seção | Bloco | Situação |
|---|---|---|
| Hero | hero `fullscreen` ("Tela cheia com vídeo") | OK: tela cheia preta, vídeo de fundo opcional (MP4/WebM), sem botão de pausa (como no site atual) e sem autoplay com `prefers-reduced-motion` (mostra o primeiro quadro). O vídeo não usa `poster`: uma imagem diferente do vídeo piscava no carregamento e na troca desktop/celular; a imagem do hero só vale quando não há vídeo. Dois vídeos: um para computador e outro para celular (abaixo de 768px, normalmente vertical); cada tela baixa só o seu. Link "Saber mais." no aviso legal e botão com seta para baixo rolam até a seção por **âncora** (campo "Âncora" em todo bloco; ids do original: atalhos, emprestimo, depoimentos, solucoes, blog, ajuda) |
| "Tudo que você precisa" (3 atalhos) | `cards` · **Atalhos** (`shortcut`) | OK: texto no topo, imagem de fundo (topo no desktop, embaixo no celular), seta que sobe no hover (a partir de 992px) e sempre visível abaixo, zoom da imagem, altura 350/450/540/635px. Campos: título e texto com quebra de linha, imagem desktop e imagem celular, cor do card. Imagens: as 3 do desktop são as enviadas pela Digio (`seed/uber-conta-assets/shortcut-N.png`); as de celular são recortes provisórios delas (`shortcut-N-mobile.png`, 1080×700), até haver as originais |
| Empréstimos | `cards` · produto | OK |
| Depoimentos | `testimonials` | OK (confirmar autorização dos textos) |
| Soluções (6 itens, vídeo de fundo) | `cards` · ícone | Parcial: sem vídeo de fundo; ícones são da lista fixa, não SVG próprio |
| Blog | `archive` | OK. No site atual o blog é externo (Medium); aqui seria interno (decisão pendente) |
| Faixa de imagem | `mediaBlock` | Parcial: sem imagem separada para mobile |
| FAQ (+ JSON-LD `FAQPage`) | `faq` | Bloco OK; confirmar que emite o JSON-LD |
| Cabeçalho com menu "Pra você" em colunas | `header` + layout `uber-conta` | OK: barra translúcida, mega menu (hover no mouse, clique/teclado nos demais), CTA e logo editáveis. Diferença: no celular o menu abre como painel, não como offcanvas lateral |
| Rodapé (6 colunas, logos das lojas) | `footer` + layout `uber-conta` | OK: fundo claro como o original, logo, imagem de destaque, colunas e selos das lojas (imagem) editáveis. |
| Central de ajuda (`/central-de-ajuda`, com busca em `/central-de-ajuda/busca`) | `help-topics`/`faqs` | A confirmar: não vi as páginas internas; a plataforma não tem busca própria |

## Próximas etapas (propostas, uma por revisão)

1. ~~**Cabeçalho com submenu** e logo por tenant~~ (feito; ver tabela).
2. **Vídeo no hero e nas soluções**: hero feito (ver tabela); falta o vídeo de fundo no bloco de soluções.
3. **Imagem desktop + mobile** (`<picture>`) em atalhos e faixa de imagem; cor de fundo livre nos cards de destaque.
4. **Páginas internas** (conta digital, pix, cartão, crédito pessoal etc.): preciso do HTML de cada uma para mapear em blocos.
5. **Migração do conteúdo**: o Strapi atual tem API; mesmo modelo do script do WordPress. Posts hoje no Medium.
6. Redirects e `validate-urls` com as URLs atuais; GTM/GA4 do site atual.

## Atenção

- Os assets (imagens, vídeos, logos) e os depoimentos são do site em produção: usar os arquivos originais fornecidos pela Digio, não baixar do site.
- `tenant.siteUrl` e o domínio de produção só entram na virada (ver `docs/virada.md`).
