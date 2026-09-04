# Registro de Atualizações - Whazing Node

## [1.0.12] - 04/09/2026

### 🚀 Novos Módulos (Agenda, Agendamento e SMS) · 🏆 Conformidade Oficial n8n · 🛡️ Tipagem Segura

Esta versão traz uma grande expansão de recursos alinhada à API oficial do Whazing, adicionando **3 módulos completos** que não existiam no node (**Agenda**, **Agendamento De Mensagem** e **SMS**), além de preparar o node para publicação oficial na comunidade n8n com **100% de conformidade no linter (`n8n-node lint`)**, tipagem TypeScript estrita e total retrocompatibilidade com fluxos existentes em produção.

---

### ✨ Novos Recursos e Endpoints Adicionados

#### 1. 📅 Agenda e Compromissos (`/agenda/*` — 8 operações)
Gerenciamento de calendários, profissionais da equipe, catálogo de serviços e compromissos:
| Operação | Endpoint | Descrição |
|---|---|---|
| **Listar Calendários** | `GET /agenda/calendars` | Consulta todos os calendários configurados |
| **Listar Profissionais** | `GET /agenda/professionals` | Lista os profissionais vinculados a um calendário |
| **Listar Serviços** | `GET /agenda/services` | Lista os serviços oferecidos por um profissional |
| **Criar Compromisso** | `POST /agenda` | Cria agendamento por serviço cadastrado ou horário manual |
| **Consultar Compromisso** | `GET /agenda/{id}` | Obtém detalhes completos de um compromisso |
| **Listar Compromissos** | `GET /agenda` | Lista agendamentos com filtros por período e número |
| **Atualizar Compromisso** | `PUT /agenda/{id}` | Edita status, horário, serviço ou profissional |
| **Cancelar Compromisso** | `DELETE /agenda/{id}` | Remove ou cancela o compromisso na agenda |

#### 2. ⏰ Agendamento De Mensagem (`/schedule` e `/schedules` — 4 operações)
Disparo programado de mensagens em data/hora futura com suporte completo a múltiplos formatos:
| Operação | Endpoint | Descrição |
|---|---|---|
| **Criar Agendamento** | `POST /schedule` | Programa envio de mensagem (Texto, Mídia por URL ou Binário, Templates Oficiais e Botões) |
| **Consultar Agendamento** | `GET /schedule/{id}` | Consulta dados e status de um agendamento específico |
| **Listar Agendamentos** | `GET /schedules` | Lista agendamentos com filtros por status e número |
| **Cancelar Agendamento** | `DELETE /schedule/{id}` | Cancela uma mensagem agendada antes do disparo |

#### 3. 💬 SMS (`/sendsms` — 1 operação)
Canal alternativo de disparo via SMS:
| Operação | Endpoint | Descrição |
|---|---|---|
| **Enviar SMS** | `POST /sendsms` | Envio direto de mensagem de texto via SMS |

---

### 🛡️ Conformidade e Boas Práticas n8n Community

- **`subtitle` Dinâmico no Canvas**: Adicionado o parâmetro `subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}'`, permitindo aos usuários visualizarem imediatamente no fluxo qual recurso e operação aquele nó está executando.
- **Tipagem Segura (Zero `any`)**: Refatoração completa das funções de requisição em `GenericFunctions.ts` e `Whazing.node.ts`, criando a interface `IHttpError` e adotando `unknown` e type-narrowing seguro.
- **Tratamento de Erros Padronizado**: Envelopamento de exceções com `NodeApiError` nos fallbacks de requisição de Kanban, garantindo exibição limpa e estruturada na interface do n8n.
- **Padronização de Menus (Ordem Alfabética)**: Todas as listas de opções (`msgOfficial`, `ticket`, `invoice`, `kanbanPriority`, `kanbanAdvancedUpdate`, `recurrence`, `updateFiscalData`, `nfseFilters`) foram ordenadas alfabeticamente para uma experiência de configuração mais rápida e intuitiva.
- **Descrições de Campos Booleanos**: Todas as propriedades do tipo booleano foram ajustadas para seguir o padrão internacional do n8n (`Whether to...`).
- **100% Retrocompatível**: Nenhuma chave de parâmetro (`name`) e nenhum identificador de operação (`value`) foi modificado. Todos os fluxos já criados continuam executando perfeitamente sem qualquer necessidade de reconfiguração.

---

## [1.0.11] - 20/06/2026

### 🆕 Novidades · 🐛 Correções de Lógica · 🔒 Robustez

Esta versão adiciona o módulo completo de **Checklist do Kanban Pro**, campos avançados para atualização de cards, corrige falhas de lógica críticas encontradas na revisão detalhada dos endpoints e remove logs de debug que poluíam o console do n8n em produção.

---

### ✨ Novidades

#### Checklist do Kanban Pro (5 operações novas)

O módulo de Checklist estava presente na API Postman mas não havia sido implementado no node. Agora está completo:

| Operação | Endpoint |
|---|---|
| **Listar Checklist Do Card** | `GET /kanbanpro/cards/{id}/checklists` |
| **Criar Item De Checklist** | `POST /kanbanpro/cards/{id}/checklists` |
| **Atualizar Item De Checklist** | `PUT /kanbanpro/checklists/{itemId}` |
| **Deletar Item De Checklist** | `DELETE /kanbanpro/checklists/{itemId}` |
| **Reordenar Checklist** | `POST /kanbanpro/cards/{id}/checklists/reorder` |

Campos de UI adicionados: `checklistText`, `checklistAssigneeId`, `checklistDueDate`, `checklistItemIds`, `checklistDoneAction` (com opção **Não Alterar** para evitar desmarcar itens por engano).

#### Campos Avançados em Atualizar Card (Kanban Pro)

Nova coleção **Campos Avançados (Opcional)** disponível na operação `updateCard`, alinhada com o Postman:

- `description`, `teamId`, `contactId`, `ticketId`, `dealValue`
- `startDate`, `estimatedHours`, `loggedHours`
- `coverColor`, `coverImage`, `labelIds`, `customFieldsJson`

---

### 🐛 Correções de Lógica

| Problema | Correção Aplicada |
|---|---|
| **Templates sem destinatário** — campo `number` estava oculto em `sendTemplate` / `sendTemplateParams` | Campo `number` voltou a aparecer; validação de destinatário restaurada em `handleApiMessage` |
| **setChatBot enviava `chatbot: boolean`** — a API espera `chatbotId` (número) | Agora envia `chatbotId` (número) ou `chatbotId: null` ao desativar; campo específico aparece quando "Ativar ChatBot" está ligado |
| **Kanban `tags` vs `labelIds`** — API espera `labelIds`, node enviava campo com nome errado | Campo renomeado na UI para **IDs Das Etiquetas** e mapeado corretamente para `labelIds` no payload |
| **Datas em formato datetime** — `dueDate`, `invoiceDueDate` e campos NFS-e iam com timestamp completo (`2025-07-17T20:58:00`) | Normalização para `YYYY-MM-DD` via `formatDateParam()` em todas as operações |
| **Telefone do contato sem formatação** — `sendContact` não aplicava `formatPhoneNumber` | Telefone formatado antes do envio, alinhado com demais operações |
| **Mensagens sem destinatário válido** — `sendText`, `sendFile`, `sendContact`, `sendButton`, `sendSticker` e `sendTemplateParams` podiam rodar sem `number` nem `ticketId` | Validação obrigatória de um dos dois adicionada em todas as operações |
| **Criar card sem destinatário** — `createOrMoveCard` podia rodar sem `contactId` nem `ticketId` | Validação obrigatória: pelo menos um dos dois deve ser informado |
| **Update card/checklist vazio** — PUT podia ser enviado sem nenhum campo preenchido | Erro claro exibido ao usuário se nenhum campo for informado |
| **`translateApiError` quebrava com `error: true`** — `body.error` era `boolean`, a função chamava `.toLowerCase()` nele | Extração de mensagem só ocorre quando o valor é `string` |
| **`estimatedHours` / `loggedHours` ignoravam valor 0** — condição `> 0` descartava zero | Corrigido para aceitar `0` como valor válido |

---

### 🔒 Robustez e Qualidade

- **`else` faltando em múltiplos recursos** — operações desconhecidas em `msgBaileys`, `contact`, `ticket`, `channel` e `kanban` agora geram `NodeOperationError` explícito em vez de falhar silenciosamente retornando `undefined`.
- **Remoção de logs de debug** — blocos `console.log` que imprimiam o payload completo no console do n8n em produção foram removidos de `GenericFunctions.ts`.
- **Traduções de erro para checklist** — mensagens de erro da API de checklist traduzidas para PT-BR (`gateway timeout`, `item de checklist não encontrado`, `texto obrigatório`, `itemIds deve ser um array`).
- **`formatDateParam()`** — função utilitária centralizada criada para normalizar datas em todos os recursos (Kanban, Faturas, NFS-e, Admin).
- **`parseOptionalId()`** — função utilitária que converte string de ID para `number` quando o valor for numérico, evitando envio de strings onde a API espera inteiros.

---

## [1.0.10] - 06/06/2026

### ⚡ Correções e Compatibilidade

Esta versão adiciona suporte a NF-e, endpointsAdmin - Empresas, suporte para números internacionais, melhorias nas operações de Tickets, correções de bugs e traduções para PT-BR.

## 🚀 Novidades da Versão 1.0.10

### Mensagens

- * Corrigido envio de mensagens utilizando ID do Ticket.
- * Corrigido envio de botões utilizando ID do Ticket.
- * Corrigido envio de localização.
- * Corrigido envio de mensagens parametrizadas utilizando ID do Ticket.
- * Adicionado suporte para envio de contatos utilizando ID do Ticket.
- * Adicionado suporte para envio de figurinhas utilizando ID do Ticket.
- * Adicionado suporte para envio de mensagens para números internacionais. (Obrigatório informar o DDI, exemplo: `+12546125421`).

### NF-e

- * Adicionado novos endpoints para NF-e. (Geração, consulta e listagem).

### Admin

- * Adicionado endpoint Admin - Empresas.
- * Agora é possível criar empresas já em modo Trial.
- * Empresas removidas do modo Trial não poderão retornar ao modo Trial posteriormente.

### Tickets

- * Melhoradas validações das operações de Tickets.
- * Ajustadas operações que exigem obrigatoriamente o ID do Ticket.
- * Corrigidas validações na consulta de contatos.

### Traduções

- * Tradução de erros conhecidos para PT-BR.
- * Quando disponível, o motivo do erro será exibido em português.

## [1.0.9] - 28/05/2026

### ⚡ Correções e Compatibilidade

Esta versão alinha o node Whazing com a coleção Postman mais recente, adicionando suporte a headers multimídia (imagem, vídeo e documento) em botões e links, mapeamento de `imageUrl` em botões dinâmicos da API Plus, e ajuste no envio de arquivos para não enviar `number` quando `ticketId` estiver presente. Também inclui pequenas melhorias de compatibilidade entre API Oficial e API Plus.

#### 🛠️ O que foi alterado em 1.0.9

- Suporte a `header.type = video|document` em botões e links (parâmetros `headerVideoLink` e `headerDocumentLink`).
- `headerImageLink` agora está disponível também para operações de link (`sendLinkPlus`, `sendLinkCta*`).
- Adicionado `imageUrl` por botão dinâmico (`dynamicButtons`) e propagação para `contents.imageUrl` quando presente.
- Ajuste em `sendFile`: não inclui `number` no payload quando `ticketId` estiver definido (compatibilidade com o comportamento mostrado no Postman).
- Correções menores de payload para garantir compatibilidade com exemplos do Postman.

---

## [1.0.8] - 21/05/2026

### ✨ Novos Recursos e Endpoints

Esta atualização traz mudanças importantes no node Whazing, não apenas um bump de versão.

#### 📝 O que foi adicionado em 1.0.8:

- **Novo recurso `Fatura`** (`invoice`) para gerenciar cobranças e pagamentos:
  - Criar cobrança avulsa
  - Deletar fatura
  - Editar fatura
  - Listar todas as faturas
  - Listar faturas em aberto do tenant
  - Gerar pagamento / QR Code PIX
  - Marcar fatura como paga manualmente
  - Recriar faturas abertas do tenant
- **Novo suporte a `Enviar Carrossel`** no recurso **Mensagens › API Oficial** (`sendCarouselOfficial`).
- **Aprimoramentos na interface do node** com nomes de recurso mais claros e campos adicionais para operações de fatura e cobrança.
- Sincronização de versão entre `package.json`, `package-lock.json` e a build em `dist/`.

---

## [1.0.7] - 05/05/2026

### 🔧 Padronização de Telefones e Correções de Busca

Esta versão foca na experiência do usuário e na resolução de problemas de busca de contatos e tickets que exigiam formatação manual do número de telefone.

#### 🛠️ O que mudou:

- **Formatação Automática de Telefone**: Implementada uma lógica global que limpa caracteres não numéricos e garante o prefixo **55** (Brasil) automaticamente para números informados com apenas o DDD (ex: 11999998888 vira 5511999998888).
- **Consistência em Mensagens e Tickets**: Agora, tanto o envio de mensagens quanto a consulta de tickets e contatos utilizam a mesma padronização, eliminando a necessidade de adicionar "55" manualmente em expressões no n8n.
- **Melhoria na Busca de Contatos**: As operações de "Consultar Último Ticket" e "Obter Contato" foram otimizadas para usar o método GET padronizado da API, garantindo maior velocidade e precisão no retorno dos dados.

---

## [1.0.6] - 05/05/2026

### 🚀 Lançamento do Kanban Pro e Upload Binário

Esta versão traz funcionalidades avançadas de gestão e melhorias críticas de infraestrutura para o node Whazing.

#### 🛠️ O que mudou:

- **Novo Recurso: Kanban Pro**: Integração completa com o sistema de funis. Agora é possível criar, mover, atualizar e listar cards, boards e colunas diretamente pelo n8n.
- **Suporte a Upload de Arquivos Binários**: Adicionado o método "Upload De Arquivo (Binário)" na operação de Enviar Arquivo. Agora você pode enviar documentos e imagens vindos diretamente de outros nodes do n8n sem precisar converter para Base64 manualmente.
- **Melhorias no Recurso Admin**:
  - Adicionada a operação **Listar Planos**.
  - Adicionado suporte ao campo **Recorrência** (Mensal, Bimestral, Trimestral, Semestral, Anual).
  - Correção na renovação de assinatura para preservar a recorrência atual.
- **Correções Críticas de Bugs**:
  - **ID do Atendente**: Corrigido erro onde o `userId` não era enviado corretamente na criação/atualização de tickets.
  - **Endpoints de Chatbot**: Alinhamento com a nova API (uso do endpoint `/updatechatbot`).
  - **Limpeza de Payloads**: Mensagens com botões agora não enviam cabeçalhos ou rodapés vazios, evitando rejeições da API.
- **UX e Interface**: Adicionados placeholders e validações para evitar o envio de campos obrigatórios vazios.

---

## [1.0.5] - 24/04/2026

### 🚀 Melhorias de Estabilidade e Correções

Esta atualização foca na compatibilidade com as versões mais recentes do n8n (v2.x) e na resolução de conflitos de parâmetros que causavam falhas na execução automática dos fluxos.

#### 🛠️ O que mudou:

- **Correção do Erro de Parâmetro "operation"**: Resolvemos o erro `Could not get parameter: operation` que ocorria quando o n8n recebia dados de entrada com nomes conflitantes. Agora, o node prioriza internamente a operação selecionada sem interferência de dados externos.
- **Proteção contra Expressões em Campos Críticos**: Adicionada a trava `noDataExpression: true` nos campos de **Recurso**, **Operação** e **Método de Envio**. Isso garante que o n8n não tente resolver esses campos como fórmulas, o que causava instabilidade na interface e falhas no motor de execução.
- **Resiliência em Execuções Automáticas**: Todos os parâmetros internos agora possuem valores padrão de segurança. Se um parâmetro estiver oculto ou não for enviado, o node não interrompe o fluxo com erro fatal, garantindo que as automações continuem rodando.
- **Mensagens de Erro Mais Claras**: Implementamos validações personalizadas que informam exatamente qual parâmetro está faltando ou mal configurado, facilitando o diagnóstico pelo usuário final.
- **Sincronização com API**: Atualização dos mapeamentos internos para garantir 100% de conformidade com a última versão da API Whazing, incluindo suporte aprimorado para envio de arquivos via URL e Base64.

---

**Nota para o usuário**: Se você encontrar instabilidades em fluxos criados em versões muito antigas, recomendamos abrir o node Whazing no seu workflow, re-selecionar o Recurso/Operação e salvar o fluxo novamente.
