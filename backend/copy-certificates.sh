#!/bin/bash
set -euo pipefail

# Copia o certificado Let's Encrypt mais recente para backend/certificates.
# Esse mesmo par fullchain/privkey e usado pelo backend (HTTPS) e pelo
# frontend (ng serve --ssl), garantindo um unico certificado compartilhado.
#
# Uso:
#   CERT_SOURCE_DIR=/etc/letsencrypt/live/<dominio> ./copy-certificates.sh
# ou
#   ./copy-certificates.sh /etc/letsencrypt/live/<dominio>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_DEST_DIR="${CERT_DEST_DIR:-$SCRIPT_DIR/certificates}"
CERT_SOURCE_DIR="${1:-${CERT_SOURCE_DIR:-/etc/letsencrypt/live/recibos.kamehouse.com.br}}"

echo "Copiando certificados de $CERT_SOURCE_DIR para $CERT_DEST_DIR"

mkdir -p "$CERT_DEST_DIR"
cd "$CERT_SOURCE_DIR"

latest_fullchain=$(ls -t fullchain*.pem 2>/dev/null | head -1 || true)
latest_privkey=$(ls -t privkey*.pem 2>/dev/null | head -1 || true)

if [ -z "$latest_fullchain" ] || [ -z "$latest_privkey" ]; then
    echo "ERRO: nao foi possivel encontrar fullchain*.pem / privkey*.pem em $CERT_SOURCE_DIR"
    exit 1
fi

echo "fullchain: $latest_fullchain"
echo "privkey:   $latest_privkey"

cp "$latest_fullchain" "$CERT_DEST_DIR/fullchain.pem"
cp "$latest_privkey" "$CERT_DEST_DIR/privkey.pem"

echo "Certificados copiados com sucesso!"
ls -la "$CERT_DEST_DIR"
