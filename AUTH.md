# Autenticação (Keycloak) + HTTPS com certificado Let's Encrypt

Backend e frontend usam Keycloak para autenticação e **compartilham o mesmo
certificado** gerado pelo Let's Encrypt.

## Visão geral

```
[Browser] --OIDC--> Keycloak (keycloak.kamehouse.com.br)
   |  Bearer JWT
   v
Frontend Angular (HTTPS) --Bearer--> Backend Spring Boot (HTTPS, Resource Server)
                                         valida o JWT no issuer do Keycloak
```

- **Frontend**: `keycloak-js` faz login/redirect, guarda o token e o injeta via
  `authInterceptor` (`Authorization: Bearer <token>`). Rotas protegidas por `authGuard`.
- **Backend**: OAuth2 **Resource Server**. Todo `/api/**` exige um JWT válido emitido
  pelo realm do Keycloak. Roles de `realm_access`/`resource_access` viram `ROLE_*`.

## Configuração do Keycloak

Crie (ou ajuste) no Keycloak:

- **Realm**: `tirecibomanager`
- **Client** (frontend, público + PKCE): `tirecibomanager-frontend`
  - Valid redirect URIs: `https://recibos.kamehouse.com.br/*`, `https://localhost:4200/*`
  - Web origins: `+`
- Issuer resultante: `https://keycloak.kamehouse.com.br/realms/tirecibomanager`

Tudo é configurável por variável de ambiente (ver abaixo).

## Certificado compartilhado (Let's Encrypt)

Os arquivos PEM ficam em `backend/certificates/` e **não são versionados**:

```bash
# copia o fullchain/privkey mais recentes do Let's Encrypt
cd backend
CERT_SOURCE_DIR=/etc/letsencrypt/live/recibos.kamehouse.com.br ./copy-certificates.sh
# gera backend/certificates/fullchain.pem e backend/certificates/privkey.pem
```

- **Backend** (perfil `local`): HTTPS na porta `8443` lendo
  `/certificates/fullchain.pem` e `/certificates/privkey.pem`
  (configurável por `SSL_CERT_PATH` / `SSL_CERT_KEY_PATH`).
- **Frontend** (`ng serve`): `angular.json` aponta `sslCert`/`sslKey` para os
  **mesmos** `../backend/certificates/*.pem`.

## Como executar (dev)

```bash
# Backend (HTTPS/8443 + Keycloak)
cd backend
SPRING_PROFILES_ACTIVE=local SERVER_PORT=8443 \
  SSL_CERT_PATH=$PWD/certificates/fullchain.pem \
  SSL_CERT_KEY_PATH=$PWD/certificates/privkey.pem \
  mvn spring-boot:run

# Frontend (HTTPS)
cd frontend
npm install
npm run dev   # https://localhost:4200
```

> Em `localhost` o navegador acusa divergência de CN (o certificado é do domínio
> real), o que é esperado em desenvolvimento.

## Variáveis de ambiente

| Variável | Onde | Default |
| --- | --- | --- |
| `KEYCLOAK_ISSUER_URI` | backend | `https://keycloak.kamehouse.com.br/realms/tirecibomanager` |
| `KEYCLOAK_RESOURCE_ID` | backend | `tirecibomanager-frontend` |
| `APP_ALLOWED_ORIGIN_PATTERNS` | backend | `http://localhost:*,http://127.0.0.1:*,https://localhost:*,https://recibos.kamehouse.com.br` |
| `SSL_CERT_PATH` / `SSL_CERT_KEY_PATH` | backend (perfil `local`) | `/certificates/fullchain.pem` / `/certificates/privkey.pem` |

No frontend, o bloco `keycloak { url, realm, clientId }` fica em
`src/environments/environment*.ts`.
