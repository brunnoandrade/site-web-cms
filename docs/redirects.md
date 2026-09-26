# Redirects

Regras em [CLAUDE.md](../CLAUDE.md), seção "Redirects e rastreio". Este guia explica como funcionam e como usar.

## Como funcionam

- **Onde ficam:** no admin, grupo **SEO > Redirects**, separados por propriedade. Só os papéis `admin` e `seo` editam.
- **Quem responde:** o proxy do site ([apps/web/src/proxy.ts](../apps/web/src/proxy.ts)), antes de qualquer página, com 301 (ou 302, se marcado).
- **Query string:** a do visitante é sempre preservada (`utm_*`, `gclid`, `fbclid`…). Se o destino já tiver um parâmetro com o mesmo nome, vale o do destino.
- **URLs sem barra final:** `/antiga` e `/antiga/` são a mesma origem, e o redirect acontece num salto só.
- **Quando passam a valer:** ao salvar um redirect, o CMS avisa o site e a mudança vale na hora. Se o CMS cair, o site continua usando a última lista que conhece.

## Regras validadas ao salvar

| Regra | Exemplo recusado |
|---|---|
| Origem única por propriedade (normalizada: sem query, com barra final, acentos decodificados) | `/cartao` quando já existe `/cartao/` |
| Sem loop | `/a/ → /a/` |
| Sem cadeia pelo destino | `/a/ → /b/` quando já existe `/b/ → /c/` |
| Sem cadeia pela origem | `/b/ → /c/` quando já existe `/a/ → /b/` |
| Um redirect ativo não pode esconder um conteúdo publicado | origem `/contato/` com a página `/contato/` publicada |

URLs completas para os próprios domínios da propriedade (`https://www.digio.com.br/x/`) são tratadas como internas. As demais são externas e ficam fora da checagem de cadeia.

## Redirects automáticos

Quando uma página ou um post **publicado** muda de endereço (slug), o CMS:

1. cria o redirect `endereço antigo → documento` (campo "Criado por": Automático);
2. reaponta para o documento os redirects que iam para o endereço antigo, para não formar cadeia;
3. remove redirects cuja origem é o endereço novo, porque esconderiam o documento.

Mudanças em rascunho não criam redirect: só a publicação cria. O redirect automático é criado mesmo quando quem publica não tem permissão de editar redirects.

## Importação em massa (CSV)

```bash
pnpm --filter cms redirects:import <arquivo.csv> tenant=digio [wave=1] [dry-run]
```

Formato (vírgula ou ponto e vírgula, UTF-8; exemplo em [exemplos/redirects.csv](exemplos/redirects.csv)):

| Coluna | Obrigatória | Valores |
|---|---|---|
| `from` / `origem` | sim | caminho ou URL completa |
| `to` / `destino` | sim | caminho ou URL (pode ser externa) |
| `type` / `tipo` | não | `301` (padrão) ou `302` |
| `wave` / `onda` | não | `1` a `4` |
| `active` / `ativo` | não | `sim`/`não`, `true`/`false` (padrão: sim) |
| `tenant` / `propriedade` | não | slug da propriedade (ou `tenant=` no comando) |

- **Tudo ou nada:** todas as linhas são validadas antes de gravar, contra os redirects existentes e contra as outras linhas do arquivo. Se alguma tiver erro, nada é gravado, e o relatório mostra o número de cada linha com problema.
- **`dry-run`:** só valida, sem gravar nada.
- **Pode rodar de novo:** origens que já existem são atualizadas, sem duplicar ("Criado por": Importação CSV).

## Ativar uma onda da virada

Cada redirect pode ter uma **onda** (1 a 4, ver [virada.md](virada.md)) e o campo **Ativo**. Para preparar uma onda:

1. Importe os redirects dela com `ativo=não` (ou `wave=N` e a coluna `ativo`).
2. No dia da virada, em SEO > Redirects, filtre por "Onda da virada", selecione todos e use a edição em lote para marcar **Ativo**.
3. Rode o `validate-urls` (abaixo) contra o ambiente.

## Validar URLs em qualquer ambiente

```bash
pnpm validate-urls <lista.csv> base=https://hml.exemplo.com.br [paralelo=8] [saida=relatorio.csv]
```

- **Regra:** cada URL precisa responder **200**, ou **301** para um destino que responde **200**, num único salto e preservando a query string.
- **Cadeia:** redirect em cadeia, 302 e perda de query string contam como falha.
- **Parâmetro de teste:** o script acrescenta `utm_source=validacao-urls` a cada URL, para conferir se a query sobrevive ao redirect.
- **URLs de produção:** URLs completas são reapontadas para o `base`, então a mesma lista (exemplo em [exemplos/urls-antigas.csv](exemplos/urls-antigas.csv)) serve para HML e PRD.
- **Resultado:** o script sai com código 1 se houver falha, e pode barrar a virada de uma onda.

## Limitações conhecidas

- **Origem com query string:** a query da origem é ignorada, então URLs antigas como `/?p=123` não podem ser origem.
- **Cache entre réplicas:** a lista fica em memória em cada instância do site. Com várias réplicas, uma réplica que não recebeu o aviso do CMS atualiza a lista em até 60s. Ver o gap "cache compartilhado" em [gaps-soad.md](gaps-soad.md).
- **Cache da CDN:** a CDN pode guardar um 301 conforme o cache configurado nela. Desfazer um redirect já em cache depende de invalidar a CDN (gap "invalidação da CDN").
