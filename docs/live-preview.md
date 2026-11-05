# Live preview (páginas e posts)

Abre no admin pelo botão do olho (barra do documento). O iframe carrega o site do tenant em modo rascunho e **cada edição do formulário aparece na hora, sem recarregar**.

## Como funciona

1. `generatePreviewPath` monta `<siteUrl do tenant>/next/preview/?path=…&previewToken=…`; a rota liga o draft mode (cookie `SameSite=None; Secure`, também em dev) e redireciona para a página.
2. Em draft mode, `pages` renderizam `LivePreviewPage` e `posts` renderizam `LivePreviewPost` (client components com `useLivePreview` do Payload). O HTML inicial vem do servidor; depois o admin envia os dados do formulário por `postMessage` e o componente re-renderiza no lugar. **Sem `router.refresh`**, sem loading.
3. Os relacionamentos (mídia, categoria, autores, links internos) são populados por `POST /next/live-preview/` (`app/(frontend)/next/live-preview/route.ts`), mesma origem do site do tenant. Aceita só `pages` e `posts`, só em draft mode, só leitura.
4. A parte visual de cada tela não pode importar nada de servidor, porque roda também no navegador: `UberPost/View.tsx` (Uber Conta), `PostPage/DefaultPostView.tsx` (Digio) e os blocos. Dados de servidor (ex.: "Últimas postagens") entram por props.

## Pontos que quebram o preview

- **CSP `frame-ancestors`**: o site do tenant (`uberconta.localhost`, `www.uberconta.com.br`) fica em outra origem que o admin, então `'self'` bloqueava o iframe (tela em branco, sem aba funcionando). `next.config.ts` agora permite `'self'` + origem de `NEXT_PUBLIC_CMS_URL`/`SERVER_URL` + `https://$ADMIN_HOST`. São lidas **no build**: ao mudar `ADMIN_HOST` em um ambiente, refaça o build.
- `NEXT_PUBLIC_CMS_URL` precisa ser exatamente a origem do admin: o `postMessage` só é aceito dessa origem.
- Cookie de draft em Safari/HTTP: em dev usa `Secure` em `*.localhost`; Safari pode recusar. Teste com Chrome.
- Admin: o botão do olho é o Live Preview; o ícone ao lado ("abrir em nova aba") é o preview comum.
- `AdminBar` dentro do iframe de outro tenant tenta chamar `/api/users/me` entre origens e loga erro de CORS no console. É inofensivo.
