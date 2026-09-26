Leia o CLAUDE.md e a pasta docs/ inteira antes de começar.

Vamos criar o projeto do Site V2 da Digio em etapas. Nesta primeira sessão, faça só a Etapa 1 e pare para eu revisar.

Etapa 1 · Scaffold
1. Crie o projeto com o template oficial `website` do create-payload-app, usando PostgreSQL e pnpm, na pasta atual. Antes, confira na documentação oficial do Payload 3 os comandos e as versões atuais.
2. Adicione `docker-compose.yml` com Postgres e MinIO, e `.env.example` com as variáveis necessárias.
3. Configure `@payloadcms/storage-s3` apontando para o MinIO local.
4. Configure `trailingSlash: true` no Next.
5. Ative TypeScript strict, ESLint, Prettier e Vitest.
6. Suba o projeto localmente e confirme que o admin abre e que uma página de exemplo renderiza.
7. Me mostre um resumo do que foi criado, os comandos para rodar e o que ficou pendente.

Próximas etapas (não faça agora):
- Etapa 2: multi-tenant (tenant digio), papéis de usuário e modelo de conteúdo completo.
- Etapa 3: redirects (hook de slug, validações, middleware preservando query string, import CSV, validate-urls).
- Etapa 4: estrutura do blog e script de migração do WordPress.
