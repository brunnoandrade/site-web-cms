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

# 1. Arquivos .env. Os segredos compartilhados entre CMS e site são gerados uma vez e gravados nos dois.
[[ -f .env ]] || cp .env.example .env
if [[ ! -f apps/cms/.env ]]; then
  cp apps/cms/.env.example apps/cms/.env
  cp apps/web/.env.example apps/web/.env
  payload_secret=$(openssl rand -hex 32)
  preview_secret=$(openssl rand -hex 24)
  revalidate_secret=$(openssl rand -hex 24)
  cron_secret=$(openssl rand -hex 24)
  api_key=$(openssl rand -hex 24)
  setvar() { # arquivo chave valor
    sed -i.bak "s|^$2=.*|$2=$3|" "$1" && rm -f "$1.bak"
  }
  setvar apps/cms/.env PAYLOAD_SECRET "$payload_secret"
  setvar apps/cms/.env PREVIEW_SECRET "$preview_secret"
  setvar apps/cms/.env REVALIDATE_SECRET "$revalidate_secret"
  setvar apps/cms/.env CRON_SECRET "$cron_secret"
  setvar apps/web/.env PREVIEW_SECRET "$preview_secret"
  setvar apps/web/.env REVALIDATE_SECRET "$revalidate_secret"
  setvar apps/web/.env CMS_API_KEY "$api_key"
  echo "apps/cms/.env e apps/web/.env criados com segredos novos."
fi
CMS_API_KEY=$(grep '^CMS_API_KEY=' apps/web/.env | cut -d= -f2-)
export CMS_API_KEY

# 2. Serviços locais. Tem que ser o compose completo: o minio-init cria o bucket de mídia.
docker compose up -d --wait postgres minio keycloak
docker compose up minio-init

# 3. Dependências e conteúdo inicial.
npm install
if [[ -z "${SKIP_BOOTSTRAP:-}" ]]; then
  npm run -w cms bootstrap:dev
fi

cat <<'EOF'

Pronto. Próximos passos:
  npm run dev                       # CMS em http://localhost:3001/admin e site em http://localhost:3000
  # depois de subir, limpe o cache do site (use o REVALIDATE_SECRET de apps/web/.env):
  curl -X POST http://localhost:3000/api/revalidate/ -H "Authorization: Bearer $REVALIDATE_SECRET" \
       -H 'Content-Type: application/json' -d '{"tags":["cms","tenants"]}'
Opcional:
  npm run -w cms blog:migrate tenant=digio limit=20      # posts reais do WordPress (precisa de rede)
  npm run -w cms redirects:import docs/exemplos/redirects.csv tenant=digio
EOF
