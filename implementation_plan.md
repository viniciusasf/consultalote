# Plano de Implementação — Consulta de Lotes Resort (MVP)

Entendi perfeitamente todo o escopo, objetivos de negócio, princípios e restrições descritos no [README.md](file:///c:/wamp64/www/consultalote/README.md).

Este plano estabelece a proposta de arquitetura monorepo, a separação de responsabilidades em 3 camadas e os passos para o desenvolvimento sequencial do **Backend em FastAPI** e do **Frontend em React + Vite + Material UI**.

---

## 1. Proposta de Estrutura de Pastas (Monorepo)

Optamos pela estrutura de **Monorepo** (pastas `backend/` e `frontend/` no mesmo repositório). 
**Justificativa:** Facilita o alinhamento de esquemas de dados, versionamento único, compartilhamento de documentos de requisitos/contratos de API e simplifica o ambiente de desenvolvimento local e deploy.

```
consultalote/
├── README.md
├── backend/
│   ├── app/
│   │   ├── api/               # Endpoints REST (v1/lotes.py)
│   │   ├── core/              # Configurações (.env), cache em memória (TTL), exceções
│   │   ├── models/            # Schemas Pydantic (Lote, LoteFilter, Pagination, Responses)
│   │   ├── repositories/      # Interfaces e implementações (LoteRepository, GoogleSheetsLoteRepository)
│   │   ├── services/          # Regras de negócio (filtro por gleba/quadra/área/preço, busca textual, ordenação)
│   │   └── main.py            # Ponto de entrada FastAPI com CORS e middleware
│   ├── tests/                 # Testes unitários e de integração (pytest)
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── public/                # Manifest PWA, ícones e assets estáticos
    ├── src/
    │   ├── api/               # Cliente Axios configurado para comunicar com o Backend FastAPI
    │   ├── components/        # Componentes UI (LoteCard, LoteFilterBar, LoteGrid, Navbar)
    │   ├── hooks/             # Custom React Hooks (useLotes, useFiltros)
    │   ├── pages/             # Páginas da aplicação (LotesPage, LoteDetailPage)
    │   ├── theme/             # Tema customizado do Material UI (MUI theme)
    │   ├── types/             # Interfaces TypeScript / Tipos para a entidade Lote
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## User Review Required

> [!IMPORTANT]
> **Decisão sobre Acesso à Planilha do Google Sheets:**
> A leitura da planilha `1QDz2tiAKs_9YoAsFh1WMHj9UF8IyKhl4lifvdJLW6AM` pode ser realizada via **Google Sheets API v4 (requer API Key ou Service Account)** ou via **exportação pública em formato CSV/pandas com cache HTTP/TTL em memória**. Propomos suportar ambas, iniciando pelo consumo via exportação CSV tratada com Pandas + Cache TTL (15 minutos), garantindo baixa latência e zero fricção de credenciais no MVP.

> [!NOTE]
> **Evolução para Supabase:**
> A camada `repositories/base.py` definirá a classe abstrata `LoteRepository`. No futuro, bastará criar `SupabaseLoteRepository` e alterar a injeção de dependência na aplicação, sem alterar serviços ou rotas.

---

## Open Questions

> [!NOTE]
> 1. A planilha do Google Sheets atual possui os nomes das colunas exatamente definidos? (Faremos o parser tolerante à caixa e acentuação dos cabeçalhos).
> 2. No frontend, prefere TypeScript (`.tsx`) ou JavaScript (`.jsx`) com PropTypes para o desenvolvimento React? (Recomendamos TypeScript para sincronia de tipos com Pydantic).

---

## Proposed Changes

### Backend (FastAPI)

#### [NEW] [backend/requirements.txt](file:///c:/wamp64/www/consultalote/backend/requirements.txt)
- Dependências: `fastapi`, `uvicorn[standard]`, `pydantic`, `pydantic-settings`, `pandas`, `requests`, `cachetools`, `pytest`, `httpx`.

#### [NEW] [backend/app/main.py](file:///c:/wamp64/www/consultalote/backend/app/main.py)
- Inicialização do FastAPI com middleware de CORS para liberar consumo do frontend React.

#### [NEW] [backend/app/models/lote.py](file:///c:/wamp64/www/consultalote/backend/app/models/lote.py)
- Schemas Pydantic: `LoteSchema`, `LoteFilterParams`, `LoteListResponse`.

#### [NEW] [backend/app/repositories/base.py](file:///c:/wamp64/www/consultalote/backend/app/repositories/base.py)
- Interface abstrata `LoteRepository` definindo o contrato de busca e consulta de lotes.

#### [NEW] [backend/app/repositories/google_sheets.py](file:///c:/wamp64/www/consultalote/backend/app/repositories/google_sheets.py)
- Implementação `GoogleSheetsLoteRepository` com limpeza de dados sujos, mapeamento resiliente por nome de cabeçalho e suporte a cache TTL.

#### [NEW] [backend/app/services/lote_service.py](file:///c:/wamp64/www/consultalote/backend/app/services/lote_service.py)
- Lógica de negócios para busca textual, filtros (área min/máx, preço min/máx, gleba, quadra) e ordenação.

#### [NEW] [backend/app/api/v1/lotes.py](file:///c:/wamp64/www/consultalote/backend/app/api/v1/lotes.py)
- Endpoints REST `/api/v1/lotes` e `/api/v1/lotes/{id_lote}`.

---

### Frontend (React + Vite + MUI)

#### [NEW] [frontend/package.json](file:///c:/wamp64/www/consultalote/frontend/package.json)
- Configuração do projeto React com MUI (`@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`), `axios`, `react-router-dom`, e suporte a PWA (`vite-plugin-pwa`).

#### [NEW] [frontend/src/theme/index.js](file:///c:/wamp64/www/consultalote/frontend/src/theme/index.js)
- Tema visual moderno e responsivo do Material UI com paleta em tons elegantes para resort.

#### [NEW] [frontend/src/components/LoteCard.jsx](file:///c:/wamp64/www/consultalote/frontend/src/components/LoteCard.jsx)
- Card com detalhes visuais do lote (gleba, quadra, área, valor, status de disponibilidade).

#### [NEW] [frontend/src/components/LoteFilterBar.jsx](file:///c:/wamp64/www/consultalote/frontend/src/components/LoteFilterBar.jsx)
- Filtros interativos para pesquisa mobile e desktop (filtros por preço, área, busca por texto/número).

#### [NEW] [frontend/src/pages/LotesPage.jsx](file:///c:/wamp64/www/consultalote/frontend/src/pages/LotesPage.jsx)
- Tela principal de listagem e consulta dos lotes.

---

## Verification Plan

### Automated Tests
- Executar testes automatizados no backend com `pytest` cobrindo o parser de dados, serviço de busca/filtro/ordenação e endpoints do FastAPI:
  ```bash
  cd backend && pytest
  ```

### Manual Verification
- Testar a API FastAPI interativamente no Swagger Docs em `http://localhost:8000/docs`.
- Testar a interface web no navegador desktop e em simulação de dispositivos móveis no DevTools.
- Verificar o comportamento PWA (suporte a instalação na tela inicial e resposta offline graciosa).
