# Autenticação (Authentik) + HTTPS com certificado Let's Encrypt

Backend e frontend usam **Authentik** (OIDC) para autenticação e **compartilham o mesmo
certificado** gerado pelo Let's Encrypt.

## Visão geral

```
[Browser] --OIDC--> Authentik (auth.kamehouse.com.br)
   |  Bearer JWT
   v
Frontend Angular (HTTPS) --Bearer--> Backend Spring Boot (HTTPS, Resource Server)
                                         valida o JWT no issuer do Authentik
```

- **Frontend**: `oidc-client-ts` faz login/redirect (Authorization Code + PKCE),
  guarda o token e o injeta via `authInterceptor` (`Authorization: Bearer <token>`).
  Rotas protegidas por `authGuard`.
- **Backend**: OAuth2 **Resource Server**. Todo `/api/**` exige um JWT válido emitido
  pelo Authentik. Roles de `groups`/`roles` (claims do token) viram `ROLE_*`.

## Configuração do Authentik

Crie (ou ajuste) no Authentik:

- **Application slug**: `tirecibomanager`
- **Provider** (OAuth2/OIDC, público + PKCE):
  - Client ID: configurado em `environment.ts` no frontend
  - Redirect URIs: `https://recibos.kamehouse.com.br/`, `http://localhost:4200/`
  - Scopes: `openid profile email`
- Issuer resultante: `https://auth.kamehouse.com.br/application/o/tirecibomanager/`

Tudo é configurável por variável de ambiente (ver abaixo).

## Banco de Dados

O backend usa **PostgreSQL** com a base `recibomanager`:

- URL padrão: `jdbc:postgresql://localhost:5432/recibomanager`
- Configurável via variáveis de ambiente `POSTGRES_URI`, `POSTGRES_USERNAME`, `POSTGRES_PASSWORD`

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
# Backend (HTTPS/8443 + Authentik)
cd backend
SPRING_PROFILES_ACTIVE=local SERVER_PORT=8443 \
  SSL_CERT_PATH=$PWD/certificates/fullchain.pem \
  SSL_CERT_KEY_PATH=$PWD/certificates/privkey.pem \
  mvn spring-boot:run

# Frontend (HTTP dev server)
cd frontend
npm install
npm run dev   # http://localhost:4200
```

> Em `localhost` o navegador acusa divergência de CN (o certificado é do domínio
> real), o que é esperado em desenvolvimento.

## Variáveis de ambiente

| Variável | Onde | Default |
| --- | --- | --- |
| `AUTHENTIK_ISSUER_URI` | backend | `https://auth.kamehouse.com.br/application/o/tirecibomanager/` |
| `POSTGRES_URI` | backend | `jdbc:postgresql://localhost:5432/recibomanager` |
| `POSTGRES_USERNAME` | backend | `postgres` |
| `POSTGRES_PASSWORD` | backend | `postgres` |
| `APP_ALLOWED_ORIGIN_PATTERNS` | backend | `http://localhost:*,http://127.0.0.1:*,https://localhost:*,https://recibos.kamehouse.com.br` |
| `SSL_CERT_PATH` / `SSL_CERT_KEY_PATH` | backend (perfil `local`) | `/certificates/fullchain.pem` / `/certificates/privkey.pem` |

No frontend, o bloco `oidc { authority, clientId, redirectUri, ... }` fica em
`src/environments/environment*.ts`.
