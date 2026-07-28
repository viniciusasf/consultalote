# PROMPT — Consulta de Lotes Resort (para IDE Antigravity)

Você atuará como **desenvolvedor(a) sênior full-stack**, responsável técnico pelo projeto **"Consulta de Lotes Resort"**. Abaixo está todo o contexto do projeto. Leia com atenção antes de gerar qualquer código, estrutura de pastas ou decisão de arquitetura.

---

## 1. Contexto e Objetivo do Projeto

Estamos desenvolvendo um **PWA (Progressive Web App)** para consulta de lotes disponíveis para venda em um resort. O sistema deve permitir pesquisas rápidas, filtros avançados e visualização detalhada dos lotes, funcionando de forma responsiva em computadores, tablets e smartphones.

Na **Versão 1 (MVP)**, a fonte oficial de dados será uma **planilha do Google Sheets**, atualizada semanalmente por uma pessoa não-técnica, sem que isso exija alterações no sistema. O projeto deve ser **modular desde o início**, para permitir, no futuro, a migração da fonte de dados para **Supabase (PostgreSQL)** sem qualquer impacto no frontend.

Seu papel é conduzir as decisões técnicas com foco em: modularidade, separação de responsabilidades, preparação para escala, e qualidade de código pronta para produção — mesmo sendo um MVP.

---

## 2. Objetivos de Negócio

- Centralizar a consulta dos lotes disponíveis, eliminando pesquisa manual em planilha.
- Acesso via computador e smartphone.
- Filtros rápidos e intuitivos.
- Informações organizadas e de fácil leitura.
- Atualização simples da base de dados (sem intervenção técnica).
- Arquitetura preparada para expansões futuras.

---

## 3. Escopo da Versão 1 (MVP)

### 3.1 Consulta de lotes
- Listagem dos lotes disponíveis.
- Pesquisa por número do lote.
- Pesquisa por texto livre.

### 3.2 Filtros
- Tamanho do lote
- Gleba
- Quadra
- Área mínima / máxima
- Valor mínimo / máximo

### 3.3 Ordenação
- Menor preço / Maior preço
- Menor área / Maior área

### 3.4 Visualização
- Cards responsivos
- Tela de detalhes do lote
- Interface mobile-first

**Importante:** não implemente, nesta fase, nenhuma funcionalidade fora deste escopo (login, favoritos, reservas, dashboards etc.), mas **estruture o código de forma que essas features possam ser adicionadas depois sem refatoração pesada**.

---

## 4. Funcionalidades Futuras (fora do MVP, mas devem influenciar a arquitetura)

- Login de usuários e controle de permissões
- Favoritos
- Compartilhamento de lotes
- Dashboard gerencial
- Reserva de lotes
- Relatórios
- Integrações externas

Ao tomar decisões de arquitetura (nomes de módulos, camadas, contratos de API), considere que essas features virão. Prefira, por exemplo, um design de API que já isole "autenticação" e "autorização" como camadas plugáveis, mesmo que hoje não existam.

---

## 5. Stack Tecnológica

### Backend
- Python 3.13
- FastAPI
- Uvicorn
- Pandas
- Google Sheets API
- Pydantic

### Frontend
- React
- Vite
- Material UI (MUI)
- Axios
- React Router

### Banco de Dados
- **V1:** Google Sheets (fonte oficial dos dados)
  - Link de referência: https://docs.google.com/spreadsheets/d/1QDz2tiAKs_9YoAsFh1WMHj9UF8IyKhl4lifvdJLW6AM/edit?usp=drive_link
- **Futuro:** Supabase (PostgreSQL)

---

## 6. Arquitetura (3 camadas)

```
Frontend (React)
      ↓
Backend (FastAPI)
      ↓
Google Sheets
```

**Regra inegociável:** todo acesso a dados passa exclusivamente pelo Backend. O Frontend **nunca** acessa a planilha diretamente.

### Fluxo geral da aplicação

```
Usuário
  ↓
Interface Web (React)
  ↓
API REST (FastAPI)
  ↓
Serviço de Consulta
  ↓
Google Sheets
  ↓
Resposta JSON
  ↓
Interface Web
```

Sugestão de organização em camadas no backend (adapte se tiver argumento técnico melhor, mas justifique):
- `api/` — rotas/controllers FastAPI (contratos REST)
- `services/` — regras de negócio (filtros, ordenação, paginação)
- `repositories/` — abstração de acesso a dados (interface `LoteRepository`), com implementação atual `GoogleSheetsLoteRepository` e um "slot" já pensado para `SupabaseLoteRepository` no futuro
- `models/` — schemas Pydantic (entidade Lote, filtros, respostas)
- `core/` — configuração, cache, exceptions

Isso garante que trocar Google Sheets por Supabase no futuro seja apenas **trocar a implementação do repository**, sem tocar em `api/` ou `services/`.

---

## 7. Fonte dos Dados (Google Sheets)

- Atualização semanal, manual, feita por pessoa não-técnica.
- Leitura automática pelo backend (sem intervenção manual no código).
- **Cache obrigatório** para reduzir requisições à API do Google Sheets (definir TTL razoável, ex.: 5-15 minutos, configurável).
- **Independência da ordem das colunas**: o mapeamento deve ser feito pelo **nome dos cabeçalhos**, nunca por posição/índice de coluna.
- Trate a planilha como uma fonte "suja": valide e trate tipos (números, valores monetários, textos), linhas vazias, cabeçalhos ausentes ou renomeados, e falhe de forma clara e informativa quando o schema mudar.

---

## 8. Princípios de Desenvolvimento

- Código modular e componentizado.
- Separação clara de responsabilidades entre camadas.
- APIs REST padronizadas (verbos HTTP corretos, status codes corretos, contratos consistentes).
- Documentação contínua (docstrings, README por módulo quando fizer sentido).
- Preparado para escalabilidade e novas features sem retrabalho estrutural.
- Testes automatizados básicos no backend (ao menos para services e repositories), mesmo no MVP.

---

## 9. Convenções do Projeto

### Idioma
- **Toda a documentação, comentários relevantes, nomes de telas e mensagens ao usuário devem ser em português.**
- **Identificadores técnicos** (classes, métodos, variáveis, rotas, nomes de arquivos) seguem as convenções usuais da comunidade dev (geralmente em inglês, ex.: `LoteRepository`, `get_lotes`, `/api/lotes`), priorizando legibilidade e consistência com o ecossistema (PEP8 no Python, convenções React no frontend).

---

## 10. Roadmap

| Etapa | Descrição |
|-------|-----------|
| 1 | Documentação completa |
| 2 | Arquitetura técnica |
| 3 | Desenvolvimento do Backend |
| 4 | Desenvolvimento do Frontend |
| 5 | Integração com Google Sheets |
| 6 | Testes |
| 7 | Deploy |
| 8 | Publicação da PWA |

---

## 11. Critérios de Sucesso do MVP

- Consulta rápida dos lotes.
- Filtros funcionando corretamente.
- Interface responsiva.
- Integração estável com o Google Sheets.
- Documentação técnica atualizada.
- Código organizado e preparado para evolução.

---

## 12. Instruções de Trabalho para Você (Antigravity)

1. Antes de gerar qualquer código, **proponha a estrutura de pastas** do monorepo (ou dos dois repositórios, backend e frontend — decida e justifique).
2. Comece pelo **backend**: modelos Pydantic da entidade Lote, o `LoteRepository` (interface) e a implementação `GoogleSheetsLoteRepository`, depois os endpoints REST de listagem, busca e filtros.
3. Em seguida, o **frontend**: estrutura de páginas (listagem, detalhe do lote), componentes de cards, componente de filtros, integração via Axios com a API.
4. Sempre que tomar uma decisão de arquitetura não especificada aqui (ex.: nome exato das rotas, formato do JSON de resposta, paginação), **explique a decisão em 2-3 linhas antes de implementar**.
5. Não implemente nenhuma funcionalidade da seção 4 (futuras) nesta fase — apenas garanta que a arquitetura não as impeça.
6. Priorize código pronto para produção: tratamento de erros, validação de entrada, tipagem forte (Pydantic/TypeScript se aplicável), e mensagens de erro claras em português para o usuário final.
7. Ao final de cada etapa entregue, valide contra os **Critérios de Sucesso** (seção 11).

Confirme que entendeu o escopo e, em seguida, comece propondo a estrutura de pastas do projeto (item 1 desta seção).