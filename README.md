# IwaRecibos 2.0 — Recibo Manager

> Aplicação web para emissão e gestão de recibos, clientes e configurações do emitente.
> Versão web/API que migra o antigo **IwaRecibos** (desktop Java Swing) para uma arquitetura **Angular + Spring Boot**.

Este documento é um **relatório técnico** do projeto: tecnologias, arquitetura, fluxo de uso, modelo de dados e instruções de execução, gerado a partir da análise do código-fonte.

---

## 1. Visão geral

O **IwaRecibos 2.0** é um *backoffice* web composto por dois módulos independentes em um monorepo:

| Módulo | Pasta | Stack | Responsabilidade |
| --- | --- | --- | --- |
| **Backend / API** | [`backend/`](backend) | Java 25 + Spring Boot 4 | API REST, persistência, regras de negócio e geração do HTML do recibo |
| **Frontend / Web** | [`frontend/`](frontend) | Angular 18 + Bootstrap 5 | Interface SPA para clientes, recibos, dashboard e configurações |

O propósito do sistema é permitir que um emitente cadastre **clientes**, gere **recibos** (de crédito ou débito) com **valor por extenso** e **data por extenso** automáticos, visualize um **dashboard** com totais e gere a **pré-visualização imprimível** de cada recibo.

---

## 2. Tecnologias identificadas

### Backend (`backend/`)
- **Java 25**
- **Spring Boot 4.0.6** (`spring-boot-starter-parent`)
  - `spring-boot-starter-webmvc` — API REST (Spring MVC)
  - `spring-boot-starter-data-jpa` — persistência via JPA/Hibernate
  - `spring-boot-starter-jdbc`
  - `spring-boot-starter-validation` — validação de payloads (Jakarta Validation)
  - `spring-boot-starter-actuator` — endpoints de saúde (`health`, `info`)
- **H2 Database** (modo arquivo `jdbc:h2:file:./iwarecibos-web`) — banco de desenvolvimento
- **Lombok 1.18.46** — redução de boilerplate (`@RequiredArgsConstructor`, `@Slf4j`)
- **Maven** — build (`spring-boot-maven-plugin`)
- Identificação Maven: `br.com.iwarecibos:iwarecibos-api:2.0.0-SNAPSHOT`

### Frontend (`frontend/`)
- **Angular 18.2** (standalone components, sem NgModules)
- **Angular Router** — roteamento client-side
- **Angular Forms** (`FormsModule`) — formulários template-driven
- **Bootstrap 5.3** — design system / estilos
- **RxJS 7.8** — programação reativa (`HttpClient`, `firstValueFrom`)
- **TypeScript 5.5**
- **Angular CLI** (`@angular-devkit/build-angular:application`)
- Locale fixo em **`pt-BR`**

---

## 3. Estrutura do repositório

```
ti-recibo-manager/
├── backend/                         # API Spring Boot
│   ├── pom.xml
│   └── src/main/
│       ├── java/br/com/iwarecibos/api/
│       │   ├── App.java                     # entrypoint @SpringBootApplication
│       │   ├── config/WebConfig.java        # CORS para o front (4200/5173)
│       │   ├── entrypoint/                   # controllers REST (camada web)
│       │   │   ├── ClientRest.java
│       │   │   ├── ReceiptRest.java
│       │   │   ├── DashboardRest.java
│       │   │   ├── AppConfigRest.java
│       │   │   └── dto/                      # ClientRequest, ReceiptRequest, AppConfigRequest
│       │   └── core/
│       │       ├── domain/                   # modelos de domínio + enums (ReceiptType, DocumentType)
│       │       ├── entity/                   # entidades JPA (*JpaEntity)
│       │       ├── repository/               # Spring Data repositories
│       │       └── usecase/                  # serviços / regras de negócio
│       └── resources/
│           ├── application.properties        # config H2, JPA, porta 8080
│           ├── schema.sql                     # DDL (clients, receipts, app_config)
│           ├── data.sql                       # seed da config padrão
│           └── template-recibo.html           # template de recibo
└── frontend/                        # SPA Angular
    └── src/app/
        ├── app.routes.ts            # rotas: /, /clientes, /recibos, /configuracoes
        ├── app.config.ts            # providers (HttpClient, Router, LOCALE_ID pt-BR)
        ├── core/
        │   ├── api.service.ts       # cliente HTTP da API
        │   ├── models.ts            # interfaces/tipos espelhando o backend
        │   ├── document-mask.ts     # máscaras de CPF/CNPJ
        │   └── receipt-utils.ts     # valor/data por extenso no front
        ├── pages/                   # dashboard, clients, receipts, settings
        └── shared/                  # navbar, stat-card
```

> Arquitetura do backend inspirada em *Clean Architecture* simplificada: camada `entrypoint` (web) → `core/usecase` (regras) → `core/repository` (dados), com `domain` (modelos) e `entity` (persistência) separados.

---

## 4. Modelo de dados

Três tabelas (definidas em [`backend/src/main/resources/schema.sql`](backend/src/main/resources/schema.sql)):

### `clients`
Cadastro de clientes: `id`, `name`, `document` (único), `document_type` (CPF/CNPJ), `rg`, `birth_date`, `driver_license`, `address`, `city`, `state`, `postal_code`, `country`, `notes`.

### `receipts`
Recibos emitidos: `id` (sequencial numérico), `receipt_type` (CREDITOR/DEBTOR), `amount`, dados do **pagador** (`payer_*`), dados do **recebedor** (`receiver_*`), `amount_in_words` (valor por extenso), `reference`, `notes`, `issue_date`, `issue_date_text` (data por extenso), `place`.

### `app_config`
Configuração única do emitente (linha `id = 1`): `issuer_name`, `issuer_document`, `issuer_document_type`, `city`, `logo_path`, `receipt_template`.

Enums de domínio:
- `ReceiptType` → `CREDITOR`, `DEBTOR`
- `DocumentType` → `CPF`, `CNPJ`

---

## 5. API REST

Base: `/api/v1` — porta `8080`. CORS liberado para `http://localhost:4200`, `http://127.0.0.1:4200` e `http://localhost:5173`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/dashboard` | Resumo: nº de clientes, nº de recibos, soma de valores e 5 recibos recentes |
| `GET` | `/api/v1/clients?q=` | Lista/pesquisa clientes (por nome ou documento) |
| `GET` | `/api/v1/clients/{id}` | Detalhe de um cliente |
| `POST` | `/api/v1/clients` | Cria cliente (201) |
| `PUT` | `/api/v1/clients/{id}` | Atualiza cliente |
| `DELETE` | `/api/v1/clients/{id}` | Remove cliente (204) |
| `GET` | `/api/v1/receipts?q=` | Lista/pesquisa recibos (nome/documento de pagador ou recebedor) |
| `GET` | `/api/v1/receipts/{id}` | Detalhe de um recibo |
| `POST` | `/api/v1/receipts` | Cria recibo com `id` sequencial (201) |
| `PUT` | `/api/v1/receipts/{id}` | Atualiza recibo |
| `DELETE` | `/api/v1/receipts/{id}` | Remove recibo (204) |
| `GET` | `/api/v1/receipts/{id}/preview` | Retorna `{ "html": "..." }` com o recibo renderizado |
| `GET` | `/api/v1/config` | Lê a configuração do emitente |
| `PUT` | `/api/v1/config` | Atualiza a configuração do emitente |

Endpoints de monitoramento (Actuator): `/actuator/health`, `/actuator/info`.

---

## 6. Fluxo da aplicação

```
[Usuário] ──▶ SPA Angular (4200) ──HTTP──▶ API Spring Boot (8080) ──JPA──▶ H2 (arquivo)
```

1. **Configuração inicial** (`/configuracoes`): o usuário define os dados do **emitente** (nome, documento, cidade, template). Há um registro padrão semeado por `data.sql`.
2. **Cadastro de clientes** (`/clientes`): CRUD de clientes com máscara de CPF/CNPJ aplicada no front (`document-mask.ts`) e documento sanitizado/validado no back.
3. **Emissão de recibos** (`/recibos`):
   - O usuário informa valor, pagador, recebedor, referência, data e local.
   - O **valor por extenso** e a **data por extenso** são calculados automaticamente — tanto no front (`receipt-utils.ts`) quanto no back (`ReceiptService.amountToWords/dateToWords`), em português.
   - O `id` do recibo é **sequencial** (`max(id numérico) + 1` via `findMaxNumericId`).
4. **Pré-visualização / impressão**: `GET /receipts/{id}/preview` gera um **HTML completo e estilizado** (CSS embutido, layout A4 com cabeçalho, corpo, assinaturas) que o front exibe em um `<iframe>` para impressão.
5. **Dashboard** (`/`): consolida contagens, soma de valores e recibos recentes via `DashboardService`.

### Regras de negócio relevantes (backend)
- **Valor por extenso em PT-BR**: `numberToWords` cobre unidades, dezenas, centenas, milhares e milhões, com tratamento de "real/reais" e "centavo/centavos".
- **Data por extenso**: "dia de mês de ano" em português.
- **Sanitização de documentos**: remoção de não-dígitos antes de persistir/pesquisar.
- **Validação**: DTOs anotados com Jakarta Validation (`@NotBlank`, `@Size`, `@NotNull`).
- **Unicidade de documento de cliente**: `existsByDocumentAndIdNot`.

---

## 7. Como executar

### Pré-requisitos
- **Java 25** e **Maven** (ou o wrapper, se presente)
- **Node.js** (compatível com Angular 18) e **npm**

### Backend
```bash
cd backend
mvn spring-boot:run
# API em http://localhost:8080  (base: /api/v1)
```
O banco H2 é criado em arquivo na pasta de execução (`iwarecibos-web.*`). `schema.sql` e `data.sql` são aplicados na inicialização (`spring.sql.init.mode=always`).

### Frontend
```bash
cd frontend
npm install
npm run dev        # ng serve → http://localhost:4200
```
Em desenvolvimento, o front consome `http://localhost:8080/api/v1` (ver `src/environments/environment.development.ts`). Em produção, usa o caminho relativo `/api/v1`.

Build de produção:
```bash
cd frontend
npm run build      # saída em dist/iwarecibos-web
```

---

## 8. Rotas do frontend

| Rota | Página | Função |
| --- | --- | --- |
| `/` | Dashboard | Indicadores e recibos recentes |
| `/clientes` | Clientes | CRUD de clientes |
| `/recibos` | Recibos | CRUD + pré-visualização de recibos |
| `/configuracoes` | Configurações | Dados do emitente / template |
| `**` | — | Redireciona para `/` |

---

## 9. Observações

- O projeto está na branch `feature/migrate-from-java-swing` — trata-se da **reescrita web** do antigo aplicativo desktop **IwaRecibos** (Java Swing).
- O H2 em arquivo é adequado para desenvolvimento; para produção recomenda-se trocar por um banco persistente (PostgreSQL/MySQL) ajustando `application.properties`.
- A lógica de "valor/data por extenso" está **duplicada** entre front e back (UX imediata no front, fonte da verdade no back) — ponto de atenção para manutenção.
