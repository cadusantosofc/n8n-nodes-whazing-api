# Registro de Atualizações - Whazing Node

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
