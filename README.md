# AI Anota[qui]

Sistema local para upload de áudios (cultos, aulas, palestras), transcrição automática e geração de anotações/reflexões com IA. O objetivo é oferecer um fluxo simples para estudo e organização de conteúdo, com processamento assíncrono e controle de estado.

## 1) Propósito do sistema

O **AI Anota[qui]** foi projetado para:
- Receber arquivos de áudio pelo frontend web.
- Persistir metadados de upload e acompanhar status de processamento.
- Executar transcrição local (pipeline com FFmpeg + Vosk).
- Enriquecer a transcrição com IA (resumo estruturado, insights, reflexão e aplicações práticas).
- Permitir visualizar e editar o texto final de anotações no frontend.

A solução prioriza execução local, rastreabilidade e simplicidade arquitetural para MVP, com base em eventos em memória e workers internos.

---

## 2) Visão arquitetural (Mermaid)

```mermaid
flowchart LR
    U[Usuário\nDesktop/Mobile] --> FE[Frontend\nNext.js 14]

    subgraph BE[Backend Spring Boot]
        API[Controllers REST\n/api/file\n/api/annotations]
        APP[Application Services / Use Cases]
        BUS[EventBus + InMemoryQueue]
        W[Worker Thread]
        TH[TranscriptionHandler]
        AH[AIHandler]
        TC[FfmpegConverter]
        VE[VoskTranscriptionEngine\n(Python Script)]
        GE[GeminiAIEngine]

        API --> APP
        APP --> BUS
        BUS --> W
        W --> TH
        TH --> TC
        TC --> VE
        W --> AH
        AH --> GE
    end

    subgraph DB[SQLite]
        UP[(uploads)]
        TR[(transcriptions)]
        AO[(ai_outputs)]
    end

    FE -->|POST /api/upload| API
    FE -->|GET /api/upload/:filename| API
    FE -->|GET/PATCH /api/annotations| API

    APP --> UP
    TH --> TR
    AH --> AO
    TR --> AO
    UP --> TR

    FS[(upload-dir / arquivos WAV e áudio)]:::fs
    VE --> FS
    TH --> FS

    classDef fs fill:#0b3d2e,color:#fff,stroke:#2f855a;
```

---

## 3) Componentes principais

### Frontend (Next.js)
- Tela única com upload de áudio, acompanhamento de status e edição de anotação.
- Rotas API internas (`/api/upload`, `/api/annotations`) fazem proxy para o backend via `BACKEND_URL`.

### Backend (Spring Boot)
- **Controllers**: entrada HTTP para upload e consulta/edição de anotações.
- **Use Cases / Services**: persistem upload e disparam eventos de domínio.
- **Event Bus + Queue em memória**: desacopla etapas do pipeline.
- **Worker único em thread dedicada**: consome eventos continuamente.
- **TranscriptionHandler**: converte áudio para WAV 16k mono e transcreve.
- **AIHandler**: lê transcrição, chama LLM e grava saída de IA.

### Banco de dados (SQLite)
- `uploads`: metadados do arquivo e status de upload/processamento inicial.
- `transcriptions`: texto bruto, status e erro de transcrição.
- `ai_outputs`: resultado de IA (prompt, saída textual, modelo, status e erro).

---

## 4) Fluxos principais de dados

### Fluxo A — Upload até transcrição
1. Frontend envia `multipart/form-data` para o backend (`/api/file`).
2. Backend cria registro em `uploads` com `PROCESSING`, salva arquivo em `upload-dir`, atualiza para `DONE` e publica `UploadCreated`.
3. `UploadCreatedHandler` publica `TranscriptionsRequested`.
4. Worker despacha para `TranscriptionHandler`.
5. Handler converte áudio com FFmpeg para WAV mono 16k e chama script Python do Vosk.
6. Resultado textual é salvo em `transcriptions` com `DONE` (ou `ERROR`, em caso de falha).
7. Evento `TranscriptionCompleted` é publicado.

### Fluxo B — Transcrição até anotação IA
1. `TranscriptionCompletedHandler` publica `AIRequested`.
2. Worker despacha para `AIHandler`.
3. Handler cria registro `ai_outputs` em `PROCESSING`.
4. Backend envia prompt estruturado para Gemini.
5. Em sucesso: persiste `textOutput`, marca `DONE` e publica `AICompleted`.
6. Em erro: persiste `ERROR` com mensagem para reprocessamento/diagnóstico.

### Fluxo C — Consulta e edição no frontend
1. Frontend consulta lista `/api/annotations` periodicamente.
2. Usuário seleciona anotação e carrega detalhe `/api/annotations/{id}`.
3. Usuário pode editar e salvar via `PATCH /api/annotations/{id}`.

---

## 5) Tecnologias utilizadas

### Backend
- Java 21
- Spring Boot 3.5.x
- Spring Web + Spring Data JPA
- SQLite (`sqlite-jdbc` + dialeto Hibernate community)
- Springdoc OpenAPI (Swagger UI em `/docs`)
- Arquitetura event-driven leve com fila em memória

### Transcrição
- FFmpeg (normalização do áudio)
- Python 3
- Vosk (script `transcribe_vosk.py`)

### IA
- Integração HTTP com Google Gemini (`gemini-flash-latest` configurável por URL)

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Infra local
- Docker / Docker Compose (opcional, recomendado)
- Execução local sem broker externo

---

## 6) Pré-requisitos para rodar o projeto

## Opção 1: Com Docker (recomendado)
- Docker Engine + Docker Compose.
- Chave Gemini válida (`GEMINI_API_KEY`).
- **Modelo Vosk disponível no host**, montado em volume no container backend.
  - O usuário pode escolher **qualquer modelo Vosk** compatível.
  - Exemplo: `vosk-model-small-pt-0.3` ou outro idioma/modelo, desde que o diretório seja apontado em `VOSK_MODEL_PATH`.

## Opção 2: Sem Docker (local nativo)
- Java 21 (JDK) e Maven Wrapper (`./mvnw`).
- Node.js (LTS) + npm.
- Python 3 com pacote `vosk` instalado.
- FFmpeg instalado e acessível no `PATH`.
- Variáveis de ambiente para backend:
  - `PYTHON_PATH` (ex.: `/usr/bin/python3`)
  - `TRANSCRIBE_SCRIPT` (ex.: caminho absoluto para `transcribe_vosk.py`)
  - `VOSK_MODEL_PATH` (diretório do modelo escolhido)
  - `GEMINI_API_KEY` (chave para módulo de IA)

> Observação importante sobre Vosk: o sistema não prende a um modelo específico. Você pode usar qualquer modelo adequado ao idioma e à performance desejada, bastando atualizar `VOSK_MODEL_PATH`.

---

## 7) Como rodar o projeto

## 7.1 Rodando com Docker Compose

1. Defina variáveis no shell (ou em arquivo `.env`):

```bash
export GEMINI_API_KEY="sua-chave"
# Ajuste para o caminho real do seu modelo no host:
export VOSK_MODEL_HOST_PATH="/caminho/para/seu/modelo-vosk"
```

2. Ajuste o `docker-compose.yml` para montar seu modelo (ou substitua o path já existente):

```yaml
- ${VOSK_MODEL_HOST_PATH}:/app/models:ro
```

3. Suba os serviços:

```bash
docker compose up --build
```

4. Acesse:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Swagger: `http://localhost:8080/docs`

## 7.2 Rodando backend local (sem Docker)

1. Exportar variáveis:

```bash
export PYTHON_PATH="/usr/bin/python3"
export TRANSCRIBE_SCRIPT="/workspace/AI-Anotaqui/backend/annotations/scripts/transcribe_vosk.py"
export VOSK_MODEL_PATH="/caminho/para/seu/modelo-vosk"
export GEMINI_API_KEY="sua-chave"
```

2. Iniciar backend:

```bash
cd backend/annotations
./mvnw spring-boot:run
```

## 7.3 Rodando frontend local (sem Docker)

```bash
cd frontend
npm install
BACKEND_URL=http://localhost:8080 npm run dev
```

Abrir: `http://localhost:3000`.

---

## 8) Endpoints principais

### Upload e status
- `POST /api/file` — upload do arquivo de áudio (`audio/mpeg` ou `audio/mp4`).
- `GET /api/file/{filename}` — consulta metadados/status do upload.

### Anotações IA
- `GET /api/annotations` — lista saídas de IA.
- `GET /api/annotations/{id}` — detalhe da anotação.
- `PATCH /api/annotations/{id}` — edição parcial de `textOutput`.

---

## 9) Controle de estado e rastreabilidade

O sistema usa `Status` com valores `PENDING`, `PROCESSING`, `DONE`, `ERROR`, permitindo:
- Visibilidade da etapa atual.
- Identificação de falhas.
- Suporte a reprocessamento futuro.

Persistência separada por etapa (`uploads`, `transcriptions`, `ai_outputs`) facilita auditoria, troubleshooting e evolução da pipeline.

---

## 10) Considerações finais

A arquitetura atual atende bem a um MVP local orientado a eventos:
- simples de operar,
- robusta para processamento assíncrono básico,
- extensível para evoluir para filas externas, múltiplos workers e novos motores de IA/transcrição.

