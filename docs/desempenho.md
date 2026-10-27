# Desempenho (PageSpeed / Lighthouse)

Medição feita com o Lighthouse 12 local (mesmo motor do PageSpeed) contra o **build de produção** (`next build` + `node .next/standalone/apps/web/server.js`). Nunca meça com `next dev`: os números não valem. Para medir sem derrubar o dev server, copie `apps/web` para uma pasta temporária (troque o `name` do `package.json`, senão o workspace conflita) e suba na porta 3100 com `uberconta.localhost`.

## Linha de base (mobile, uma execução por página, localhost sem CDN)

| Página | Site atual | Novo, antes das correções | Novo, depois |
|---|---|---|---|
| Home | 25 (LCP 21,8 s, CLS 0,62) | 43 (LCP 15,7 s, CLS 0,62) | 97–98 (LCP 1,7–2,2 s, CLS 0) |
| Post do blog | 52 | 73 (LCP 6,7 s) | 98 (LCP 2,2 s) |
| Cartão | 78 | 95 | 98 |

Desktop da home: 76 (CLS 0,78) antes, 100 depois. O site atual tem TBT acima de 500 ms em todas as páginas, o novo fica em 30–60 ms.

## Regras que saíram disso

- **`not-found.tsx` não pode usar `headers()`, `cookies()` nem `fetch` sem cache.** O Next 16 renderiza o 404 junto com cada página gerada por ISR, e essas chamadas derrubam a página com 500 (`Page changed from static to dynamic at runtime`). O tenant do 404 vem de `lib/currentTenant.ts`, que o layout de `[tenant]` preenche (cache por requisição).
- **Página que lê `searchParams` precisa de `export const dynamic = 'force-dynamic'`** (blog, busca e categorias da central de ajuda, busca). Os dados continuam cacheados pelas tags do `lib/cms.ts`.
- **Imagens de CMS passam pelo otimizador do Next**: `Picture` usa `getImageProps` (WebP em vários tamanhos, qualidade 75, `next.config.ts` → `images.qualities: [75, 100]`). SVG, GIF e imagem sem largura/altura no registro saem como enviados. A imagem da primeira tela usa `priority` (eager + `fetchPriority="high"`).
- **Hero com vídeo precisa de poster** (campos `poster` e `posterMobile` do hero `fullscreen`): o primeiro quadro do vídeo, exportado como imagem. Ele pinta na hora (é o LCP) e a proporção dele reserva o espaço do vídeo (CLS 0). O vídeo só define o `src` depois da hidratação e o registro de mídia de vídeo não tem largura/altura, então sem poster o hero repete o LCP de 15 s e o CLS de 0,6 do site atual. Tem que ser o primeiro quadro de verdade, senão pisca.
- `<source>` do `Picture` leva `width` e `height` da variante mobile; sem isso o navegador reserva a proporção da imagem de desktop e a página salta.

## Pendências

- Mídia: o seed usa vídeos de 1,8 MB (hero e soluções); em produção, comprimir e usar `faststart`.
- Ainda falham em todas as páginas: cache longo dos assets (CDN), JS não usado, CSS bloqueante e contraste em alguns trechos.
- GTM/GA ainda não existem no código: ao entrar, carregar depois da interação ou do consentimento, para não repetir o TBT do site atual.
- Colocar Lighthouse CI com limites (LCP < 2,5 s, CLS < 0,1, TBT < 200 ms).
