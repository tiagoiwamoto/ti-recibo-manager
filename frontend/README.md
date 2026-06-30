# IwaRecibos Web (Angular)

Frontend migrado para **Angular** com **Bootstrap**.

## Como executar

```bash
npm install
npm run dev
```

O `ng serve` sobe em **HTTPS** (`https://localhost:4200`) usando o mesmo certificado Let's Encrypt do backend (`../backend/certificates/*.pem`) e consome a API em `https://localhost:8443/api/v1` no modo desenvolvimento.

## Autenticação (Authentik)

O acesso é protegido por Authentik (`oidc-client-ts`). Veja [`../AUTH.md`](../AUTH.md) para a configuração da application/provider, certificado compartilhado e variáveis de ambiente.

## Build de produção

```bash
npm run build
```

## Rotas principais

- `/` — Dashboard
- `/clientes` — Clientes
- `/recibos` — Recibos
- `/configuracoes` — Configurações
- `/login` — Login via Authentik

