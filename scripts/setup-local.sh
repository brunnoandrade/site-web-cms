#!/usr/bin/env bash
# Prepara uma máquina nova do zero: .env com segredos gerados, Postgres + MinIO + Keycloak,
# dependências e conteúdo inicial (propriedades, usuário super admin e conteúdo de exemplo).
#
#   BOOTSTRAP_ADMIN_EMAIL=voce@digio.com.br BOOTSTRAP_ADMIN_PASSWORD='<senha>' npm run setup:local
#
# Seguro de repetir: não sobrescreve .env existente. ATENÇÃO: o bootstrap recria todo o conteúdo
# das propriedades (apaga posts migrados do WordPress); com banco já em uso, use SKIP_BOOTSTRAP=1.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${SKIP_BOOTSTRAP:-}" && ( -z "${BOOTSTRAP_ADMIN_EMAIL:-}" || -z "${BOOTSTRAP_ADMIN_PASSWORD:-}" ) ]]; then
  echo "Defina BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD (primeiro super admin)." >&2
  exit 1
fi
command -v docker >/dev/null || { echo "Docker não encontrado." >&2; exit 1; }

# 1. Arquivo .env (compose e app leem o mesmo). Os segredos são gerados uma vez.
if [[ ! -f .env ]]; then
  cp .env.example .env
  setvar() { # chave valor
    sed -i.bak "s|^$1=.*|$1=$2|" .env && rm -f .env.bak
  }
  setvar PAYLOAD_SECRET "$(openssl rand -hex 32)"
  setvar PREVIEW_SECRET "$(openssl rand -hex 24)"
  setvar REVALIDATE_SECRET "$(openssl rand -hex 24)"
  setvar CRON_SECRET "$(openssl rand -hex 24)"
  setvar CMS_API_KEY "$(openssl rand -hex 24)"
  echo ".env criado com segredos novos."
fi
CMS_API_KEY=$(grep '^CMS_API_KEY=' .env | cut -d= -f2-)
export CMS_API_KEY

# 2. Serviços locais. Tem que ser o compose completo: o minio-init cria o bucket de mídia.
docker compose up -d --wait postgres minio keycloak
docker compose up minio-init

# 3. Dependências e conteúdo inicial.
npm install
if [[ -z "${SKIP_BOOTSTRAP:-}" ]]; then
  npm run bootstrap:dev
fi

cat <<'EOF'

Pronto. Próximos passos:
  npm run dev                       # site em http://localhost:3000 e CMS em http://localhost:3000/admin
  # depois de subir, limpe o cache do site (use o REVALIDATE_SECRET do .env):
  curl -X POST http://localhost:3000/api/revalidate/ -H "Authorization: Bearer $REVALIDATE_SECRET" \
       -H 'Content-Type: application/json' -d '{"tags":["cms","tenants"]}'
Opcional:
  npm run users:local                             # um usuário por perfil (senha digio123), só local
  npm run blog:migrate tenant=digio limit=20      # posts reais do WordPress (precisa de rede)
  npm run redirects:import docs/exemplos/redirects.csv tenant=digio
EOF
