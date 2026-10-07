# Usuários do ambiente local

Contas que existem só no desenvolvimento local (`docker compose` + `npm run dev`). Nenhuma delas vale para DEV, HML ou PRD.

Admin: http://localhost:3001/admin

## Login local (e-mail e senha)

| Conta | Papel | Como é criada |
|---|---|---|
| a que você informar no bootstrap | super admin (todas as propriedades) | `npm run -w cms bootstrap:dev`, com `BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD` |
| `demo-author@example.com` | editor, autor dos posts de exemplo | seed; a senha é aleatória, então não é usada para login |

Cada pessoa do time cria a própria conta local no bootstrap. **Senhas reais não entram no repositório.** Se quiser anotar a sua, use o arquivo `CREDENCIAIS-LOCAIS.md` na raiz, que está no `.gitignore`.

Para trocar a senha: Admin > Usuários > sua conta > "Mudar senha".

## Login SSO (Keycloak local)

Botão **"Entrar com SSO corporativo"** na tela de login. Todos os usuários têm a senha `Senha-123` (fixture de teste, definida em [docker/keycloak/digio-realm.json](../docker/keycloak/digio-realm.json)).

| Usuário | Resultado esperado |
|---|---|
| `sso.admin` | entra como super admin (papel `cms-super-admin`) |
| `sso.editor` | entra como editor da Digio |
| `sso.multi` | entra como `seo` na Digio e editor na Campanha Exemplo |
| `sso.semacesso` | recusado: não tem grupos |
| `sso.colisao` | recusado: o e-mail pertence a uma conta local |

O logout do SSO também encerra a sessão no Keycloak, então o próximo login pede usuário e senha de novo.

**Erro "Este e-mail já está vinculado a outra identidade do SSO"** (`subject_mismatch`): o usuário SSO guarda o ID (`sub`) que o Keycloak lhe deu, e o CMS recusa que o mesmo e-mail passe a outro ID. Se o volume do Keycloak for recriado e o do Postgres não (ou o contrário), o Keycloak gera IDs novos e todos os logins SSO passam a falhar. Em desenvolvimento, apague os usuários SSO antigos; eles são recriados no próximo login, com os papéis vindos do Keycloak:

```bash
docker compose exec postgres psql -U digio -d digio -c "delete from users where auth_provider='sso'"
```

Zerar só a coluna `sso_subject` não resolve: o CMS acha o usuário pelo e-mail e recusa do mesmo jeito. Em HML e PRD isso é proposital; a troca de identidade deve ser tratada por um administrador.

Console de administração do Keycloak: http://localhost:8080/admin (`admin` / `admin`, ou os valores de `KEYCLOAK_ADMIN_USER` e `KEYCLOAK_ADMIN_PASSWORD` no `.env` da raiz).

## Contas de serviço

| Conta | Para que serve |
|---|---|
| `preview@digio.local` | usada pelo site para ler rascunhos no preview, pela API key (`CMS_API_KEY` em `apps/web/.env`). Papel `preview`: só leitura, sem acesso ao admin |

## Outros acessos locais

| Serviço | Endereço | Credenciais |
|---|---|---|
| Site Digio | http://localhost:3000 | – |
| Site Campanha Exemplo | http://campanha.localhost:3000 (`/regulamento/`, `/contato/`) | – |
| Console do MinIO | http://localhost:9001 | `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` do `.env` da raiz (padrão `minioadmin` / `minioadmin`) |
| Postgres | `localhost:5432` | `POSTGRES_USER` / `POSTGRES_PASSWORD` do `.env` da raiz (padrão `digio` / `digio`) |

As portas podem ser diferentes na sua máquina: veja o `.env` da raiz.

## Conteúdo de exemplo por propriedade

O `bootstrap:dev` cria conteúdo diferente em cada propriedade:

| Propriedade | Conteúdo |
|---|---|
| Digio (`digio`) | demo completo: home, componentes, contato, 3 posts, produtos, taxas, FAQs e central de ajuda |
| Campanha Exemplo (`campanha-exemplo`) | micro-site "Indique e ganhe": home, regulamento, contato (em português), 3 FAQs, header e footer. Sem blog e sem central de ajuda. Os textos são fictícios e não trazem valores nem datas |

O contato da propriedade Digio ainda vem em inglês (formulário do template do Payload).
