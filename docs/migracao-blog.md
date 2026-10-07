# Migração do blog (WordPress → Payload)

Script: [apps/cms/scripts/migrate-wordpress.ts](../apps/cms/scripts/migrate-wordpress.ts). A lógica fica em [apps/cms/src/wordpress/](../apps/cms/src/wordpress/).

## Como rodar

```bash
# Simulação: lê e converte tudo, não grava nada (recomendado antes de cada execução)
npm run -w cms blog:migrate tenant=digio dry-run

# Teste com os N posts mais antigos
npm run -w cms blog:migrate tenant=digio limit=20

# Migração completa
npm run -w cms blog:migrate tenant=digio

# Reprocessar mesmo o que não mudou no WordPress (por exemplo, depois de melhorar o conversor)
npm run -w cms blog:migrate tenant=digio force
```

Opções: `source=<url do blog>` (padrão `https://www.digio.com.br/blog`, ou a variável `WP_BLOG_URL`), `limit=N`, `dry-run` e `force`.

- **Pode rodar quantas vezes quiser.** Categorias, autores e posts são reconhecidos pelo ID do WordPress, e imagens pela URL de origem. Um post que não mudou no WordPress desde a última execução é pulado: nada é baixado de novo e nenhuma versão nova é criada.
- **Cache do site:** ao terminar, o script avisa o site para atualizar o cache.

## O que é migrado

| Dado | De onde vem | Observação |
|---|---|---|
| Posts publicados | `/wp-json/wp/v2/posts` (público) | título, slug, conteúdo, data de publicação |
| Categoria | categoria embutida no post (`_embed`) | a API de categorias exige login no WordPress (plugin DRA); a categoria do post define a URL `/blog/<categoria>/<slug>/` |
| Autor | autor embutido no post | ver "Autores" abaixo |
| SEO: título, descrição e imagem | `<head>` da página publicada de cada post | a API não traz os dados de SEO (não há campos do Yoast) |
| Imagem de destaque | `og:image` da página | usada como imagem do topo e imagem de SEO |
| Imagens do conteúdo | `<img>` do conteúdo | enviadas para o storage, na pasta da propriedade |

## Conversão do conteúdo

- **Formatação do Word:** o HTML colado do Word (`<span class="TextRun">`…) é limpo.
- **Links internos:** links para o próprio site viram caminhos relativos (`/blog/noticias/x/`). Como as URLs são as mesmas, continuam funcionando.
- **Imagens:** saem de dentro de parágrafos e de links para o próprio arquivo, porque o editor trata imagem como bloco.
- **Tabelas:** são mantidas. O recurso de tabela do editor ainda é marcado como experimental pelo Payload.
- **Vídeos do YouTube:** viram um link para o vídeo, porque ainda não há bloco de vídeo.
- **Verificação de perda:** para cada post, o script compara itens de lista, imagens, tabelas, títulos e links antes e depois da conversão. Qualquer perda aparece no relatório, e o comando termina com erro.

## URLs

A URL nova é comparada com a URL do post no WordPress. Se forem diferentes, o script cria o redirect 301 automaticamente. Nos 518 posts atuais, as URLs são todas iguais.

Se um post trocar de slug ou de categoria no WordPress entre duas execuções, o redirect da URL antiga também é criado automaticamente.

## Resultado da simulação completa (25/09/2026)

518 posts, 0 erros, 0 perdas de conteúdo, 0 URLs diferentes, 650 imagens, 41 vídeos convertidos em link. Tempo: cerca de 1min30 sem baixar imagens.

## Decisões

1. **Autores (decidido em 25/09/2026):** os posts assinados por "Usuário de serviço ADM via cofre" (conta de sistema) são migrados como **"Digio"** (`DEFAULT_AUTHOR_OVERRIDES` em [migrate.ts](../apps/cms/src/wordpress/migrate.ts)).
2. **Vídeos (decidido em 25/09/2026):** os 41 vídeos do YouTube ficam como link. Um bloco de vídeo pode ser criado depois, se necessário.
3. **Migração completa:** por enquanto o ambiente é só local, com 20 posts migrados para teste. A migração dos 518 é feita quando houver um ambiente real (a simulação completa já passou sem erros).
4. **Arquivos do WordPress:** links para `wp-content` (PDFs etc.) que sobrarem no conteúdo aparecem no relatório. Eles precisam ser importados ou substituídos antes de desligar o WordPress.
