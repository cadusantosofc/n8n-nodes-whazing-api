import { INodeProperties } from 'n8n-workflow';

export const whazingDescription: INodeProperties[] = [

	// ============================================================
	//  RECURSO
	//  O caractere › no nome cria o agrupamento visual no painel
	//  de ações do n8n:  Mensagens › Baileys / API Oficial / API PLUS
	// ============================================================
	{
		displayName: 'Recurso',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Admin',                   value: 'admin',       description: 'Empresas e usuários (multi-tenant)' },
			{ name: 'Canal',                   value: 'channel',     description: 'Status, QR Code, logout e restart' },
			{ name: 'Contato',                value: 'contact',     description: 'CRM, tags e carteiras' },
			{ name: 'Fatura',                 value: 'invoice',     description: 'Gerenciar faturas, pagamentos PIX e cobranças' },
			{ name: 'Kanban Pro',              value: 'kanban',      description: 'Boards, colunas e cards (funil)' },
			{ name: 'Mensagens › API Oficial', value: 'msgOfficial', description: 'Botões, listas, templates e localização (Meta)' },
			{ name: 'Mensagens › API PLUS',    value: 'msgPlus',     description: 'Botões dinâmicos, carrossel, Pix e pagamentos' },
			{ name: 'Mensagens › Baileys',     value: 'msgBaileys',  description: 'Texto, arquivo, sticker, localização, contato, params' },
			{ name: 'NFS-e',                  value: 'nfse',        description: 'Nota Fiscal de Serviço Eletrônica — emissão, consulta e dados fiscais (API Admin)' },
			{ name: 'Ticket',                 value: 'ticket',      description: 'Criar, consultar e gerenciar atendimentos' },
		],
		default: 'msgBaileys',
	},

	// ============================================================
	//  OPERAÇÕES — Mensagens › Baileys
	// ============================================================
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['msgBaileys'] } },
		options: [
			{ name: 'Enviar Arquivo',                   value: 'sendFile',        action: 'Enviar mensagem com arquivo' },
			{ name: 'Enviar Botão',                     value: 'sendButton',      action: 'Enviar mensagem com botões' },
			{ name: 'Enviar Contato',                   value: 'sendContact',     action: 'Enviar um contato' },
			{ name: 'Enviar Localização',               value: 'sendLocation',    action: 'Enviar mensagem com localização' },
			{ name: 'Enviar Sticker',                   value: 'sendSticker',     action: 'Enviar sticker' },
			{ name: 'Enviar Texto',                     value: 'sendText',        action: 'Enviar mensagem de texto' },
			{ name: 'Mensagem Via Parâmetros (Grupo)',  value: 'sendParamsGroup', action: 'Enviar mensagem para grupo via parâmetros' },
			{ name: 'Mensagem Via Parâmetros (Número)', value: 'sendParams',      action: 'Enviar mensagem via parâmetros' },
		],
		default: 'sendText',
	},

	// ============================================================
	//  OPERAÇÕES — Mensagens › API Oficial
	// ============================================================
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['msgOfficial'] } },
		options: [
			{ name: 'Enviar Botão',                     value: 'sendButtonOfficial',  action: 'Enviar botão oficial' },
			{ name: 'Enviar Botão Com Imagem',          value: 'sendButtonImageOfficial', action: 'Enviar botão com imagem no cabeçalho' },
			{ name: 'Enviar Carrossel',                 value: 'sendCarouselOfficial', action: 'Enviar carrossel oficial' },
			{ name: 'Enviar Link CTA',                  value: 'sendLinkCta',         action: 'Enviar link CTA' },
			{ name: 'Enviar Link Com Imagem',           value: 'sendLinkImageOfficial', action: 'Enviar link CTA com imagem no cabeçalho' },
			{ name: 'Enviar Lista',                     value: 'sendList',            action: 'Enviar lista' },
			{ name: 'Enviar Template (Com Parâmetros)', value: 'sendTemplateParams',  action: 'Enviar template com parâmetros' },
			{ name: 'Enviar Template (Sem Parâmetros)', value: 'sendTemplate',        action: 'Enviar template' },
			{ name: 'Solicitar Localização',            value: 'requestLocation',     action: 'Solicitar localização' },
		],
		default: 'sendButtonOfficial',
	},

	// ============================================================
	//  OPERAÇÕES — Mensagens › API PLUS
	// ============================================================
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['msgPlus'] } },
		options: [
			{ name: 'Enviar Botão',                    value: 'sendButtonPlus',           action: 'Enviar botão plus' },
			{ name: 'Enviar Botão Dinâmico',           value: 'sendButtonDynamicPlus',    action: 'Enviar botão dinâmico plus' },
			{ name: 'Enviar Botão Dinâmico Com Imagem', value: 'sendButtonDynamicImagePlus', action: 'Enviar botão dinâmico com imagem plus' },
			{ name: 'Enviar Botão Pix',                value: 'sendPixButtonPlus',        action: 'Enviar pix button plus' },
			{ name: 'Enviar Carrossel',                value: 'sendCarouselPlus',         action: 'Enviar carrossel plus' },
			{ name: 'Enviar Link',                     value: 'sendLinkPlus',             action: 'Enviar link plus' },
			{ name: 'Enviar Link CTA',                 value: 'sendLinkCtaPlus',          action: 'Enviar link CTA plus' },
			{ name: 'Enviar Lista',                    value: 'sendListPlus',             action: 'Enviar lista plus' },
			{ name: 'Enviar Solicitação De Pagamento', value: 'sendRequestPaymentPlus',   action: 'Enviar solicitação de pagamento plus' },
			{ name: 'Solicitar Localização',           value: 'requestLocationPlus',      action: 'Solicitar localização plus' },
		],
		default: 'sendButtonPlus',
	},

	// ============================================================
	//  OPERAÇÕES — Tickets
	// ============================================================
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['ticket'] } },
		options: [
			{ name: 'Alterar Chatbot Do Ticket',         value: 'updateChatbot',     action: 'Alterar chatbot do ticket' },
			{ name: 'Ativar / Desativar Chatbot',        value: 'setChatBot',        action: 'Ativar ou desativar chatbot do ticket' },
			{ name: 'Atualizar Fila',                    value: 'setQueue',          action: 'Atualizar fila do ticket' },
			{ name: 'Atualizar Informações',             value: 'updateInfo',        action: 'Atualizar informações do ticket' },
			{ name: 'Consultar Ticket Do Chatbot',       value: 'showTicketChatBot', action: 'Consultar ticket do chatbot' },
			{ name: 'Consultar Último Ticket Do Número', value: 'showTicket',        action: 'Consultar último ticket do número' },
			{ name: 'Criar Ticket',                      value: 'create',            action: 'Criar ticket' },
			{ name: 'Listar Mensagens Do Ticket (Por ID)', value: 'listMessages',      action: 'Listar mensagens do ticket — requer ID do ticket' },
			{ name: 'Listar Todos Os Tickets',           value: 'getAll',            action: 'Listar todos os tickets do número' },
			{ name: 'Obter Detalhes Do Ticket (Por ID)', value: 'get',               action: 'Obter detalhes do ticket — requer ID do ticket' },
		],
		default: 'create',
	},

	// ============================================================
	//  OPERAÇÕES — Contatos
	// ============================================================
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contact'] } },
		options: [
			{ name: 'Atualizar Contato',       value: 'update',         action: 'Atualizar contato' },
			{ name: 'Criar Contato',           value: 'create',         action: 'Criar contato' },
			{ name: 'Definir CRM',             value: 'setCrm',         action: 'Definir CRM do contato' },
			{ name: 'Definir Follow-Up',       value: 'setFollowup',    action: 'Definir follow up do contato' },
			{ name: 'Gerenciar Tags',          value: 'setTags',        action: 'Gerenciar tags do contato' },
			{ name: 'Listar Por Carteira',     value: 'listByWallet',   action: 'Listar contatos por carteira' },
			{ name: 'Listar Por CRM',          value: 'listByCrm',      action: 'Listar contatos por CRM' },
			{ name: 'Listar Por Follow-Up',    value: 'listByFollowup', action: 'Listar contatos por follow up' },
			{ name: 'Listar Por Tag',          value: 'listByTag',      action: 'Listar contatos por tag' },
			{ name: 'Obter Dados Do Contato',  value: 'get',            action: 'Obter dados do contato' },
			{ name: 'Validar Número WhatsApp', value: 'validateNumber', action: 'Validar número do WhatsApp' },
		],
		default: 'create',
	},

	// ============================================================
	//  OPERAÇÕES — Canal
	// ============================================================
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['channel'] } },
		options: [
			{ name: 'Desconectar / Logout',        value: 'logout',    action: 'Fazer logout do canal' },
			{ name: 'Gerar QR Code (Nova Sessão)', value: 'getQrCode', action: 'Gerar QR code' },
			{ name: 'Obter Status Da Conexão',     value: 'getStatus', action: 'Obter status do canal' },
			{ name: 'Reiniciar Sessão',            value: 'restart',   action: 'Reiniciar sessão do canal' },
		],
		default: 'getStatus',
	},

	// ============================================================
	//  OPERAÇÕES — Kanban Pro
	// ============================================================
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['kanban'] } },
		options: [
			{ name: 'Atualizar Card',            value: 'updateCard',      action: 'Atualizar card' },
			{ name: 'Criar / Mover Card (Bot)',  value: 'createOrMoveCard', action: 'Criar ou mover card usando lógica de bot' },
			{ name: 'Deletar / Arquivar Card',   value: 'deleteCard',      action: 'Deletar ou arquivar card' },
			{ name: 'Listar Boards',             value: 'getBoards',       action: 'Listar boards' },
			{ name: 'Listar Cards Do Board',     value: 'getCards',        action: 'Listar cards do board' },
			{ name: 'Listar Cards Do Contato',   value: 'getContactCards', action: 'Listar cards do contato' },
			{ name: 'Listar Colunas Do Board',   value: 'getColumns',      action: 'Listar colunas do board' },
			{ name: 'Obter Detalhes Do Card',    value: 'getCard',         action: 'Obter detalhes do card' },
		],
		default: 'getBoards',
	},

	// ============================================================
	//  OPERAÇÕES — Admin
	// ============================================================
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['admin'] } },
		options: [
			{ name: 'Alterar Senha Do Usuário',    value: 'changePassword', action: 'Alterar senha do usuário' },
			{ name: 'Atualizar Empresa',           value: 'updateTenant',   action: 'Atualizar empresa' },
			{ name: 'Criar Empresa',               value: 'createTenant',   action: 'Criar empresa' },
			{ name: 'Listar Planos',               value: 'listPlans',      action: 'Listar todos os planos' },
			{ name: 'Listar Todas As Empresas',    value: 'listTenants',    action: 'Listar todas as empresas' },
			{ name: 'Listar Usuários Da Empresa',  value: 'listUsers',      action: 'Listar usuários da empresa' },
			{ name: 'Obter Empresa Por ID',        value: 'getTenant',      action: 'Obter empresa por ID' },
			{ name: 'Renovar Assinatura', value: 'addMonth',       action: 'Renovar assinatura' },
		],
		default: 'createTenant',
	},
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['invoice'] } },
		options: [
			{ name: 'Criar Cobrança Avulsa',          value: 'createInvoiceAvulsa', action: 'Criar cobrança avulsa' },
			{ name: 'Deletar Fatura',                 value: 'deleteInvoice',        action: 'Deletar fatura' },
			{ name: 'Editar Fatura',                  value: 'updateInvoice',        action: 'Editar fatura' },
			{ name: 'Faturas Em Aberto (Atalho)',     value: 'getInvoicesOpen',      action: 'Listar faturas em aberto da Empresa' },
			{ name: 'Gerar Pagamento / QR Code PIX',  value: 'generatePaymentPix',  action: 'Gerar pagamento ou qr code pix da fatura' },
			{ name: 'Marcar Como Paga (Manual)',      value: 'markPaidManual',       action: 'Marcar fatura como paga manualmente' },
			{ name: 'Recriar Faturas da Empresa',      value: 'recreateInvoices',     action: 'Deletar e recriar faturas abertas da Empresa' },
			{ name: 'Listar Todas As Faturas',        value: 'getInvoices',          action: 'Listar histórico de faturas da Empresa' },
		],
		default: 'getInvoices',
	},

	// ============================================================
	//  CAMPOS COMUNS — Número e Ticket ID
	//  number NÃO é required — ticketId pode ser usado no lugar
	// ============================================================
	{
		displayName: 'Número Do WhatsApp',
		name: 'number',
		type: 'string',
		displayOptions: {
			show: { resource: ['msgBaileys', 'msgOfficial', 'msgPlus', 'contact'] },
			hide: { operation: ['sendTemplate', 'sendTemplateParams'] },
		},
		default: '',
		placeholder: '5511999999999',
		description: 'Número no formato internacional. Pode ser substituído pelo ID do Ticket abaixo.',
	},
	{
		// Número para o recurso Ticket — exibido apenas para operações que consultam por número.
		// Operações como listMessages e get usam Ticket ID e NÃO aparecem aqui.
		displayName: 'Número Do WhatsApp',
		name: 'number',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['create', 'showTicket', 'showTicketChatBot', 'getAll'],
			},
		},
		default: '',
		placeholder: '5511999999999',
		description: 'Número no formato internacional. Obrigatório para esta operação.',
	},
	{
		displayName: 'ID Do Ticket',
		name: 'ticketId',
		type: 'string',
		displayOptions: {
			show: { resource: ['msgBaileys', 'msgOfficial', 'msgPlus', 'contact', 'kanban'] },
			hide: { operation: ['validateNumber', 'getBoards', 'getColumns', 'getCards', 'getCard', 'getContactCards', 'deleteCard', 'updateCard'] },
		},
		default: '',
		description: 'Se fornecido, substitui o número como identificador do destinatário',
	},
	{
		// ticketId para ops de ticket que o exigem como alvo
		// NOTA: listMessages e get NÃO suportam busca por número — use apenas o ID do ticket
		displayName: 'ID Do Ticket',
		name: 'ticketId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['updateInfo', 'setQueue', 'setChatBot', 'updateChatbot', 'listMessages', 'get'],
			},
		},
		default: '',
		description: 'ID numérico do ticket. Obrigatório — estas operações não aceitam número de telefone.',
	},

	// ============================================================
	//  CAMPOS — Corpo da mensagem
	// ============================================================
	{
		displayName: 'Mensagem (Corpo)',
		name: 'body',
		type: 'string',
		required: true,
		displayOptions: { show: { operation: ['requestLocation', 'requestLocationPlus'] } },
		default: '',
		description: 'Mensagem exibida ao solicitar a localização do usuário',
	},
	{
		displayName: 'Mensagem (Corpo)',
		name: 'body',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'sendText', 'sendButton', 'sendList',
					'sendButtonOfficial', 'sendButtonImageOfficial', 'sendButtonPlus', 'sendListPlus',
					'sendLinkPlus', 'sendLinkCta', 'sendLinkCtaPlus', 'sendLinkImageOfficial',
					'sendButtonDynamicPlus', 'sendButtonDynamicImagePlus', 'sendFile', 'sendSticker',
					'sendCarouselPlus', 'sendCarouselOfficial', 'sendRequestPaymentPlus',
					'sendParams', 'sendParamsGroup',
				],
			},
		},
		default: '',
		placeholder: 'Digite sua mensagem aqui...',
	},

	// ============================================================
	//  CAMPOS — Arquivo / Mídia
	// ============================================================
	{
		displayName: 'Método De Envio',
		name: 'sendMethod',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { operation: ['sendFile'] } },
		options: [
			{ name: 'Base64 / Binário (Texto)', value: 'base64' },
			{ name: 'Upload De Arquivo (Binário)', value: 'binary' },
			{ name: 'URL Do Arquivo',   value: 'url' },
		],
		default: 'url',
	},
	{
		displayName: 'Propriedade Binária',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		displayOptions: { show: { operation: ['sendFile'], sendMethod: ['binary'] } },
		default: 'data',
		description: 'Nome da propriedade binária do n8n que contém o arquivo a ser enviado',
	},
	{
		displayName: 'URL Do Arquivo',
		name: 'mediaUrl',
		type: 'string',
		displayOptions: { show: { operation: ['sendFile'], sendMethod: ['url'] } },
		default: '',
		placeholder: 'https://example.com/arquivo.pdf',
	},
	{
		displayName: 'Tipo De Mídia',
		name: 'mediaType',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { operation: ['sendFile'], sendMethod: ['base64'] } },
		options: [
			{ name: 'Áudio',     value: 'audio' },
			{ name: 'Documento', value: 'document' },
			{ name: 'Imagem',    value: 'image' },
			{ name: 'Vídeo',     value: 'video' },
		],
		default: 'image',
	},
	{
		displayName: 'Arquivo (Base64)',
		name: 'mediaBase64',
		type: 'string',
		displayOptions: { show: { operation: ['sendFile'], sendMethod: ['base64'] } },
		default: '',
	},
	{
		displayName: 'Nome Do Arquivo',
		name: 'fileName',
		type: 'string',
		displayOptions: { show: { operation: ['sendFile'], sendMethod: ['base64'] } },
		default: '',
		placeholder: 'documento.pdf',
	},
	{
		displayName: 'Propriedade Binária',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		displayOptions: { show: { operation: ['sendSticker'] } },
		default: 'data',
		description: 'Nome da propriedade binária do n8n que contém a imagem do sticker',
	},

	// ============================================================
	//  CAMPOS — Card de Contato
	// ============================================================
	{
		displayName: 'Nome De Exibição',
		name: 'contactDisplayName',
		type: 'string',
		required: true,
		displayOptions: { show: { operation: ['sendContact'] } },
		default: '',
		placeholder: 'Ex: João Silva',
	},
	{
		displayName: 'Telefone Do Contato',
		name: 'contactTelephone',
		type: 'string',
		required: true,
		displayOptions: { show: { operation: ['sendContact'] } },
		default: '',
		placeholder: '5511999999999',
	},

	// ============================================================
	//  CAMPOS — External Key
	// ============================================================
	{
		displayName: 'External Key',
		name: 'externalKey',
		type: 'string',
		displayOptions: {
			show: { operation: ['sendText', 'sendFile', 'sendSticker', 'sendParams', 'sendParamsGroup'] },
		},
		default: '',
		description: 'Chave externa para identificar a mensagem no webhook do seu sistema',
	},

	// ============================================================
	//  CAMPOS — Cabeçalho / Rodapé / Links
	// ============================================================
	{
		displayName: 'Título Do Cabeçalho',
		name: 'headerText',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'sendButton', 'sendList',
					'sendButtonOfficial', 'sendButtonPlus', 'sendListPlus',
					'sendLinkPlus', 'sendLinkCta', 'sendLinkCtaPlus',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Tipo De Mídia Do Cabeçalho',
		name: 'headerMediaType',
		type: 'options',
		options: [
			{ name: 'Imagem',    value: 'image' },
			{ name: 'Vídeo',     value: 'video' },
			{ name: 'Documento', value: 'document' },
		],
		default: 'image',
		displayOptions: {
			show: {
				operation: [
					'sendButtonImageOfficial',
					'sendButtonPlus',
					'sendLinkImageOfficial',
					'sendButtonDynamicImagePlus',
					'sendLinkPlus',
					'sendLinkCtaPlus',
					'sendLinkCta',
				],
			},
		},
	},
	{
		displayName: 'URL Do Cabeçalho',
		name: 'headerMediaUrl',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'sendButtonImageOfficial',
					'sendLinkImageOfficial',
					'sendButtonPlus',
					'sendButtonDynamicImagePlus',
					'sendLinkPlus',
					'sendLinkCtaPlus',
					'sendLinkCta',
				],
			},
		},
		default: '',
		placeholder: 'https://exemplo.com/arquivo',
		description: 'URL pública da mídia do cabeçalho (imagem, vídeo ou documento conforme tipo selecionado acima)',
	},
	{
		displayName: 'Rodapé (Opcional)',
		name: 'footer',
		type: 'string',
		displayOptions: {
			show: {
				operation: [
					'sendButton', 'sendList',
					'sendButtonOfficial', 'sendButtonPlus', 'sendListPlus',
					'sendButtonImageOfficial',
					'sendLinkPlus', 'sendLinkCta', 'sendLinkCtaPlus',
					'sendLinkImageOfficial',
					'sendButtonDynamicPlus', 'sendButtonDynamicImagePlus', 'sendRequestPaymentPlus',
				],
			},
		},
		default: '',
	},
	{
		displayName: 'Texto Do Botão Link',
		name: 'linkDisplayText',
		type: 'string',
		displayOptions: { show: { operation: ['sendLinkCta', 'sendLinkCtaPlus', 'sendLinkImageOfficial'] } },
		default: 'Ver mais',
	},
	{
		displayName: 'URL Do Link',
		name: 'linkUrl',
		type: 'string',
		required: true,
		displayOptions: { show: { operation: ['sendLinkCta', 'sendLinkCtaPlus', 'sendLinkImageOfficial'] } },
		default: 'https://',
	},
	{
		displayName: 'URL Do Link (PLUS)',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: { show: { operation: ['sendLinkPlus'] } },
		default: 'https://',
	},
	{
		displayName: 'Texto Do Botão Link (PLUS)',
		name: 'buttonText',
		type: 'string',
		displayOptions: { show: { operation: ['sendLinkPlus'] } },
		default: 'Ver Link',
	},
	{
		displayName: 'Texto Do Botão (Trigger Lista)',
		name: 'buttonText',
		type: 'string',
		displayOptions: { show: { operation: ['sendList', 'sendListPlus'] } },
		default: 'Clique para ver as opções',
	},

	// ============================================================
	//  CAMPOS — Seções de Lista
	// ============================================================
	{
		displayName: 'Seções Da Lista',
		name: 'sections',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		displayOptions: { show: { operation: ['sendList', 'sendListPlus'] } },
		default: {},
		options: [
			{
				name: 'sectionValues',
				displayName: 'Seção',
				values: [
					{ displayName: 'Título Da Seção', name: 'title', type: 'string', default: '' },
					{
						displayName: 'Itens Da Seção',
						name: 'rows',
						type: 'fixedCollection',
						typeOptions: { multipleValues: true },
						default: {},
						options: [
							{
								name: 'rowValues',
								displayName: 'Item',
								values: [
									{ displayName: 'ID Do Item',  name: 'id',          type: 'string', default: '' },
									{ displayName: 'Título',      name: 'title',       type: 'string', default: '' },
									{ displayName: 'Descrição',   name: 'description', type: 'string', default: '' },
								],
							},
						],
					},
				],
			},
		],
	},

	// ============================================================
	//  CAMPOS — Botões Simples
	// ============================================================
	{
		displayName: 'Botões',
		name: 'buttons',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		displayOptions: { show: { operation: ['sendButton', 'sendButtonOfficial', 'sendButtonPlus', 'sendButtonImageOfficial'] } },
		default: {},
		options: [
			{
				name: 'buttonValues',
				displayName: 'Botão',
				values: [
					{ displayName: 'Texto Do Botão',         name: 'text', type: 'string', default: '' },
					{ displayName: 'ID Do Botão (Opcional)', name: 'id',   type: 'string', default: '' },
				],
			},
		],
	},

	// ============================================================
	//  CAMPOS — Botões Dinâmicos (PLUS)
	// ============================================================
	{
		displayName: 'Botões Dinâmicos',
		name: 'dynamicButtons',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		displayOptions: { show: { operation: ['sendButtonDynamicPlus', 'sendButtonDynamicImagePlus'] } },
		default: {},
		description: 'Configure os botões dinâmicos. Use a URL da imagem do cabeçalho para enviar uma imagem acima da mensagem.',
		options: [
			{
				name: 'buttonValues',
				displayName: 'Botão',
				values: [
					{
						displayName: 'Tipo',
						name: 'btnType',
						type: 'options',
						noDataExpression: true,
						options: [
							{ name: 'Abrir Site (URL)', value: 'url' },
							{ name: 'Copiar Texto',     value: 'copy' },
							{ name: 'Ligar (Call)',     value: 'call' },
							{ name: 'Resposta (Reply)', value: 'reply' },
						],
						default: 'reply',
					},
					{ displayName: 'Texto De Exibição',      name: 'displayText', type: 'string', default: '' },
					{ displayName: 'ID / Texto / Tel / URL', name: 'value',       type: 'string', default: '' },
				],
			},
		],
	},

	// ============================================================
	//  CAMPOS — Carrossel (PLUS)
	// ============================================================
	{
		displayName: 'Itens Do Carrossel',
		name: 'carouselItems',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		displayOptions: { show: { operation: ['sendCarouselPlus', 'sendCarouselOfficial'] } },
		default: {},
		options: [
			{
				name: 'itemValues',
				displayName: 'Item Do Carrossel',
				values: [
					{ displayName: 'Texto Do Item',   name: 'text',  type: 'string', default: '' },
					{ displayName: 'Imagem (Base64)', name: 'image', type: 'string', default: '' },
					{
						displayName: 'Botões Do Item',
						name: 'buttons',
						type: 'fixedCollection',
						typeOptions: { multipleValues: true },
						default: {},
						options: [
							{
								name: 'buttonValues',
								displayName: 'Botão',
								values: [
									{
										displayName: 'Tipo',
										name: 'itemBtnType',
										type: 'options',
										noDataExpression: true,
										options: [
											{ name: 'Ligar',    value: 'call' },
											{ name: 'Resposta', value: 'reply' },
											{ name: 'URL',      value: 'url' },
										],
										default: 'reply',
									},
									{ displayName: 'Texto',     name: 'displayText', type: 'string', default: '' },
									{ displayName: 'Valor/URL', name: 'value',       type: 'string', default: '' },
								],
							},
						],
					},
				],
			},
		],
	},

	// ============================================================
	//  CAMPOS — Templates (API Oficial)
	// ============================================================
	{
		displayName: 'Nome Do Template',
		name: 'templateName',
		type: 'string',
		displayOptions: { show: { operation: ['sendTemplate', 'sendTemplateParams'] } },
		default: '',
		placeholder: 'nome_do_template',
		description: 'Nome exato do template aprovado no Meta Business Manager',
	},
	{
		displayName: 'Código Do Idioma',
		name: 'languageCode',
		type: 'string',
		displayOptions: { show: { operation: ['sendTemplate', 'sendTemplateParams'] } },
		default: 'pt_BR',
	},
	{
		displayName: 'Componentes Do Template',
		name: 'templateComponents',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		displayOptions: { show: { operation: ['sendTemplateParams'] } },
		default: {},
		options: [
			{
				name: 'componentValues',
				displayName: 'Componente',
				values: [
					{
						displayName: 'Tipo De Componente',
						name: 'componentType',
						type: 'options',
						options: [
							{ name: 'Botão (Button)',      value: 'button' },
							{ name: 'Cabeçalho (Header)', value: 'header' },
							{ name: 'Corpo (Body)',        value: 'body' },
						],
						default: 'body',
					},
					{
						displayName: 'Subtipo (Somente Para Botão)',
						name: 'sub_type',
						type: 'options',
						options: [
							{ name: 'Quick Reply', value: 'quick_reply' },
							{ name: 'URL / CTA',   value: 'url' },
						],
						default: 'quick_reply',
					},
					{ displayName: 'Índice Do Botão', name: 'index', type: 'number', default: 0 },
					{
						displayName: 'Parâmetros',
						name: 'parameters',
						type: 'fixedCollection',
						typeOptions: { multipleValues: true },
						default: {},
						options: [
							{
								name: 'parameterValues',
								displayName: 'Parâmetro',
								values: [
									{
										displayName: 'Tipo',
										name: 'parameterType',
										type: 'options',
										options: [
											{ name: 'Imagem', value: 'image' },
											{ name: 'Texto',  value: 'text' },
										],
										default: 'text',
									},
									{ displayName: 'Nome Do Parâmetro', name: 'parameter_name', type: 'string', default: '' },
									{ displayName: 'Texto',            name: 'text',           type: 'string', default: '' },
									{ displayName: 'Link Da Imagem',   name: 'link',           type: 'string', default: '' },
								],
							},
						],
					},
				],
			},
		],
	},

	// ============================================================
	//  CAMPOS — Localização (Baileys)
	// ============================================================
	{
		displayName: 'Latitude',
		name: 'latitude',
		type: 'string',
		displayOptions: { show: { operation: ['sendLocation'] } },
		default: '',
		placeholder: '-23.5505',
	},
	{
		displayName: 'Longitude',
		name: 'longitude',
		type: 'string',
		displayOptions: { show: { operation: ['sendLocation'] } },
		default: '',
		placeholder: '-46.6333',
	},
	{
		displayName: 'Nome Do Local',
		name: 'locationName',
		type: 'string',
		displayOptions: { show: { operation: ['sendLocation'] } },
		default: '',
	},
	{
		displayName: 'Endereço',
		name: 'address',
		type: 'string',
		displayOptions: { show: { operation: ['sendLocation'] } },
		default: '',
	},

	// ============================================================
	//  CAMPOS — Tickets
	// ============================================================
	{
		displayName: 'ID Do ChatBot',
		name: 'chatbotId',
		type: 'string',
		displayOptions: { show: { resource: ['ticket'], operation: ['updateChatbot'] } },
		default: '',
	},
	{
		displayName: 'ID Do Atendente',
		name: 'userId',
		type: 'string',
		displayOptions: { show: { resource: ['ticket'], operation: ['create', 'updateInfo'] } },
		default: '',
		description: 'ID do usuário/atendente responsável. Deixe vazio para não atribuir.',
	},
	{
		displayName: 'Ativar ChatBot',
		name: 'enableChatbot',
		type: 'boolean',
		displayOptions: { show: { resource: ['ticket'], operation: ['setChatBot'] } },
		default: true,
		description: 'Ativa (true) ou desativa (false) o chatbot para este ticket',
	},
	{
		displayName: 'Status Do Ticket',
		name: 'status',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['ticket'], operation: ['create', 'updateInfo'] } },
		options: [
			{ name: 'Aberto',   value: 'open' },
			{ name: 'Fechado',  value: 'closed' },
			{ name: 'Pendente', value: 'pending' },
		],
		default: 'open',
		placeholder: 'Selecione um status...',
	},
	{
		displayName: 'ID Da Fila',
		name: 'queueId',
		type: 'string',
		displayOptions: { show: { resource: ['ticket'], operation: ['create', 'updateInfo', 'setQueue'] } },
		default: '',
	},

	// ============================================================
	//  CAMPOS — Contatos
	// ============================================================
	{
		displayName: 'ID Do Contato',
		name: 'contactId',
		type: 'string',
		displayOptions: {
			show: { resource: ['contact'], operation: ['update', 'get', 'setCrm', 'setFollowup', 'setTags'] },
		},
		default: '',
		description: 'Se vazio, busca pelo número ou ticketId',
	},
	{
		displayName: 'ID Do Contato',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: {
			show: { resource: ['kanban'], operation: ['getContactCards'] },
		},
		default: '',
	},
	{
		displayName: 'ID Do Contato',
		name: 'contactId',
		type: 'string',
		displayOptions: {
			show: { resource: ['kanban'], operation: ['createOrMoveCard'] },
		},
		default: '',
		description: 'Opcional se o ID do Ticket for fornecido',
	},
	{
		displayName: 'ID Do Board',
		name: 'boardId',
		type: 'string',
		required: true,
		displayOptions: {
			show: { resource: ['kanban'], operation: ['getColumns', 'getCards', 'createOrMoveCard'] },
		},
		default: '',
	},
	{
		displayName: 'ID Do Card',
		name: 'cardId',
		type: 'string',
		required: true,
		displayOptions: {
			show: { resource: ['kanban'], operation: ['getCard', 'updateCard', 'deleteCard'] },
		},
		default: '',
	},
	{
		displayName: 'ID Da Coluna',
		name: 'columnId',
		type: 'string',
		required: true,
		displayOptions: {
			show: { resource: ['kanban'], operation: ['createOrMoveCard'] },
		},
		default: '',
	},
	{
		displayName: 'ID Da Coluna (Opcional)',
		name: 'columnId',
		type: 'string',
		displayOptions: {
			show: { resource: ['kanban'], operation: ['getCards', 'updateCard'] },
		},
		default: '',
	},
	{
		displayName: 'Ação (Bot)',
		name: 'kanbanAction',
		type: 'options',
		displayOptions: {
			show: { resource: ['kanban'], operation: ['createOrMoveCard'] },
		},
		options: [
			{ name: 'Criar Ou Mover (Padrão)', value: 'create_or_move', description: 'Cria ou move para a coluna informada' },
			{ name: 'Criar Ou Atualizar', value: 'create_or_update', description: 'Cria ou atualiza dados sem mover' },
			{ name: 'Sempre Criar Novo', value: 'create_only', description: 'Sempre cria um novo card' },
			{ name: 'Apenas Mover', value: 'move_only', description: 'Só move se já existir, ignora se não existir' },
		],
		default: 'create_or_move',
	},
	{
		displayName: 'Título Do Card',
		name: 'cardTitle',
		type: 'string',
		displayOptions: {
			show: { resource: ['kanban'], operation: ['createOrMoveCard', 'updateCard'] },
		},
		default: '',
	},
	{
		displayName: 'Prioridade',
		name: 'kanbanPriority',
		type: 'options',
		displayOptions: {
			show: { resource: ['kanban'], operation: ['createOrMoveCard', 'updateCard', 'getCards'] },
		},
		options: [
			{ name: 'Nenhuma', value: 'none' },
			{ name: 'Baixa', value: 'low' },
			{ name: 'Média', value: 'medium' },
			{ name: 'Alta', value: 'high' },
			{ name: 'Urgente', value: 'urgent' },
		],
		default: 'none',
	},
	{
		displayName: 'Nota / Comentário',
		name: 'kanbanNote',
		type: 'string',
		displayOptions: {
			show: { resource: ['kanban'], operation: ['createOrMoveCard', 'updateCard'] },
		},
		default: '',
		description: 'Aparecerá no histórico do card',
	},
	{
		displayName: 'ID Do Responsável (User ID)',
		name: 'assigneeId',
		type: 'string',
		displayOptions: {
			show: { resource: ['kanban'], operation: ['updateCard'] },
		},
		default: '',
	},
	{
		displayName: 'Data Limite (Due Date)',
		name: 'kanbanDueDate',
		type: 'dateTime',
		displayOptions: {
			show: { resource: ['kanban'], operation: ['updateCard'] },
		},
		default: '',
	},
	{
		displayName: 'Tags (Opcional)',
		name: 'tags',
		type: 'string',
		displayOptions: {
			show: { resource: ['kanban'], operation: ['createOrMoveCard', 'updateCard'] },
		},
		default: '',
		description: 'Tags associadas ao card. Use string separada por vírgulas ou expressão n8n para array.',
	},
	{
		displayName: 'Deletar Permanentemente',
		name: 'permanentDelete',
		type: 'boolean',
		displayOptions: {
			show: { resource: ['kanban'], operation: ['deleteCard'] },
		},
		default: false,
		description: 'Se desativado, o card será apenas arquivado (exclusão reversível)',
	},
	{
		displayName: 'Filtros Adicionais',
		name: 'kanbanFilters',
		type: 'collection',
		placeholder: 'Adicionar Filtro',
		default: {},
		displayOptions: {
			show: { resource: ['kanban'], operation: ['getCards', 'getContactCards'] },
		},
		options: [
			{
				displayName: 'Busca (Termo)',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Busca no título e descrição do card',
			},
			{
				displayName: 'Incluir Arquivados',
				name: 'includeArchived',
				type: 'boolean',
				default: false,
			},
		],
	},
	{
		displayName: 'Nome Do Contato',
		name: 'contactName',
		type: 'string',
		displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
		default: '',
	},
	{
		displayName: 'E-Mail',
		name: 'email',
		type: 'string',
		placeholder: 'nome@email.com',
		displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
		default: '',
	},
	{
		displayName: 'Observações',
		name: 'commentary',
		type: 'string',
		displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
		default: '',
	},
	{
		displayName: 'Prazo (Deadline)',
		name: 'deadline',
		type: 'dateTime',
		displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
		default: '',
	},
	{
		displayName: 'Preço Kanban',
		name: 'kanbanPrice',
		type: 'string',
		displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
		default: '',
	},
	{
		displayName: 'Desativar Bot',
		name: 'disableBot',
		type: 'boolean',
		displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
		default: false,
	},
	{
		displayName: 'Desativar Campanha',
		name: 'disableCampaign',
		type: 'boolean',
		displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
		default: false,
	},
	{
		displayName: 'Desativar Kanban',
		name: 'disableKanban',
		type: 'boolean',
		displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
		default: false,
	},
	{
		displayName: 'Ignorar Contato',
		name: 'ignore',
		type: 'boolean',
		displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
		default: false,
	},
	{
		displayName: 'Informações Extras',
		name: 'extraInfo',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
		default: {},
		options: [
			{
				name: 'extraInfoValues',
				displayName: 'Campo Extra',
				values: [
					{ displayName: 'Nome Do Campo', name: 'name',  type: 'string', default: '' },
					{ displayName: 'Valor',         name: 'value', type: 'string', default: '' },
				],
			},
		],
	},
	{
		displayName: 'Valor (ID)',
		name: 'valueId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['setCrm', 'setFollowup', 'setTags', 'listByTag', 'listByCrm', 'listByFollowup', 'listByWallet'],
			},
		},
		default: '',
		description: 'ID do CRM, tag, follow-up ou carteira',
	},

	// ============================================================
	//  CAMPOS — Admin
	// ============================================================
	{
		displayName: 'ID Da Empresa',
		name: 'tenantId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['admin', 'invoice'],
				operation: ['getTenant', 'updateTenant', 'addMonth', 'listUsers', 'getInvoices', 'getInvoicesOpen', 'createInvoiceAvulsa', 'recreateInvoices'],
			},
		},
		default: '',
	},
	{
		displayName: '⚠️ O ID 1 É A Empresa Mestre. Esta Operação Pode Retornar 401 Ou Falhar. Use Por Conta E Risco.',
		name: 'adminTenantNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['updateTenant', 'addMonth', 'listUsers'],
				tenantId: ['1'],
			},
		},
		default: '',
	},
	{
		displayName: 'ID Da Fatura',
		name: 'invoiceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['generatePaymentPix', 'markPaidManual', 'updateInvoice', 'deleteInvoice'],
			},
		},
		default: '',
	},

	{
		displayName: 'ID Do Usuário',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['admin'], operation: ['changePassword'] } },
		default: '',
	},
	{
		displayName: '⚠️ O ID 1 É O Administrador Global. Esta Operação Pode Retornar 401 Ou Falhar. Use Por Conta E Risco.',
		name: 'adminUserNotice',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['changePassword'],
				userId: ['1'],
			},
		},
		default: '',
	},
	{
		displayName: 'Senha (Nova)',
		name: 'adminPassword',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: { show: { resource: ['admin'], operation: ['createTenant', 'changePassword'] } },
		default: '',
	},
	{
		displayName: 'Nome Do Administrador',
		name: 'adminUserName',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['admin'], operation: ['createTenant'] } },
		default: '',
	},
	{
		displayName: 'Nome Da Empresa',
		name: 'tenantName',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['admin'], operation: ['createTenant', 'updateTenant'] } },
		default: '',
	},
	{
		displayName: 'E-Mail De Login',
		name: 'adminEmail',
		type: 'string',
		placeholder: 'admin@empresa.com',
		displayOptions: { show: { resource: ['admin'], operation: ['createTenant', 'updateTenant'] } },
		default: '',
	},
	{
		displayName: 'Telefone De Contato',
		name: 'adminPhone',
		type: 'string',
		placeholder: '5511999999999',
		displayOptions: { show: { resource: ['admin'], operation: ['createTenant', 'updateTenant'] } },
		default: '',
	},
	{
		displayName: 'Plano (ID)',
		name: 'planId',
		type: 'string',
		displayOptions: { show: { resource: ['admin'], operation: ['createTenant', 'updateTenant'] } },
		default: '1',
	},
	{
		displayName: 'Recorrência',
		name: 'recurrence',
		type: 'options',
		displayOptions: { show: { resource: ['admin'], operation: ['createTenant', 'updateTenant'] } },
		options: [
			{ name: 'Mensal',    value: 'MENSAL' },
			{ name: 'Bimestral', value: 'BIMESTRAL' },
			{ name: 'Trimestral', value: 'TRIMESTRAL' },
			{ name: 'Semestral', value: 'SEMESTRAL' },
			{ name: 'Anual',     value: 'ANUAL' },
		],
		default: 'MENSAL',
	},
	{
		displayName: 'Dias De Teste (Trial)',
		name: 'timeTest',
		type: 'string',
		displayOptions: { show: { resource: ['admin'], operation: ['createTenant'] } },
		default: '3',
	},
	{
		displayName: 'Data De Vencimento',
		name: 'dueDate',
		type: 'dateTime',
		displayOptions: { show: { resource: ['admin'], operation: ['updateTenant'] } },
		default: '',
	},
	{
		displayName: 'Status da Empresa',
		name: 'tenantStatus',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['createTenant', 'updateTenant'],
			},
		},
		options: [
			{ name: 'Ativo', value: 'active' },
			{ name: 'Inativo', value: 'inactive' },
		],
		default: 'active',
	},
	{
		displayName: 'Trial',
		name: 'tenantTrial',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['createTenant', 'updateTenant'],
			},
		},
		default: false,
		description: 'Define se a empresa está em período de testes (trial)',
	},
	{
		displayName: 'Afiliado',
		name: 'tenantAffiliate',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['createTenant'],
			},
		},
		default: false,
		description: 'Define se a empresa é um afiliado',
	},

	// ============================================================
	//  CAMPOS — Pagamento (API PLUS)
	// ============================================================
	{
		displayName: 'Valor (Amount)',
		name: 'amount',
		type: 'number',
		required: true,
		typeOptions: { numberPrecision: 2 },
		displayOptions: { show: { operation: ['sendRequestPaymentPlus'] } },
		default: 0,
	},
	{
		displayName: 'Título Do Pagamento',
		name: 'paymentTitle',
		type: 'string',
		displayOptions: { show: { operation: ['sendRequestPaymentPlus'] } },
		default: 'Detalhes do pedido',
	},
	{
		displayName: 'Nome Do Item',
		name: 'itemName',
		type: 'string',
		displayOptions: { show: { operation: ['sendRequestPaymentPlus'] } },
		default: '',
	},
	{
		displayName: 'Tipo De Pix',
		name: 'pixType',
		type: 'options',
		required: true,
		displayOptions: { show: { operation: ['sendPixButtonPlus', 'sendRequestPaymentPlus'] } },
		options: [
			{ name: 'Chave Aleatória (EVP)', value: 'EVP' },
			{ name: 'CNPJ',                  value: 'CNPJ' },
			{ name: 'CPF',                   value: 'CPF' },
			{ name: 'E-Mail',                value: 'EMAIL' },
			{ name: 'Telefone',              value: 'PHONE' },
		],
		default: 'CNPJ',
	},
	{
		displayName: 'Chave Pix',
		name: 'pixKey',
		type: 'string',
		required: true,
		displayOptions: { show: { operation: ['sendPixButtonPlus', 'sendRequestPaymentPlus'] } },
		default: '',
	},
	{
		displayName: 'Nome Do Beneficiário Pix',
		name: 'pixName',
		type: 'string',
		required: true,
		displayOptions: { show: { operation: ['sendPixButtonPlus', 'sendRequestPaymentPlus'] } },
		default: '',
	},
	{
		displayName: 'Código Do Boleto',
		name: 'boletoCode',
		type: 'string',
		displayOptions: { show: { operation: ['sendRequestPaymentPlus'] } },
		default: '',
	},
	{
		displayName: 'Status Da Fatura',
		name: 'invoiceStatusFilter',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['getInvoices'],
			},
		},
		options: [
			{ name: 'Todas', value: 'all' },
			{ name: 'Em Aberto', value: 'open' },
			{ name: 'Pagas', value: 'paid' },
		],
		default: 'all',
		description: 'Filtrar faturas por status',
	},
	{
		displayName: 'Preço (Opcional)',
		name: 'invoicePrice',
		type: 'number',
		typeOptions: { numberPrecision: 2 },
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['generatePaymentPix'],
			},
		},
		default: 0,
		description: 'Se omitido, usa o valor da fatura',
	},
	{
		displayName: 'Detalhes Da Fatura',
		name: 'invoiceDetail',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['createInvoiceAvulsa', 'updateInvoice'],
			},
		},
		default: '',
		placeholder: 'Ex: Taxa de implantação',
	},
	{
		displayName: 'Valor Da Fatura',
		name: 'invoiceValue',
		type: 'number',
		required: true,
		typeOptions: { numberPrecision: 2 },
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['createInvoiceAvulsa'],
			},
		},
		default: 0,
	},
	{
		displayName: 'Valor Da Fatura',
		name: 'invoiceValueOptional',
		type: 'number',
		typeOptions: { numberPrecision: 2 },
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['updateInvoice'],
			},
		},
		default: 0,
		description: 'Deixe 0 para não alterar',
	},
	{
		displayName: 'Data De Vencimento',
		name: 'invoiceDueDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['createInvoiceAvulsa'],
			},
		},
		default: '',
	},
	{
		displayName: 'Data De Vencimento (Opcional)',
		name: 'invoiceDueDateOptional',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['updateInvoice'],
			},
		},
		default: '',
	},
	{
		displayName: 'Recorrência (Opcional)',
		name: 'invoiceRecurrence',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['createInvoiceAvulsa'],
			},
		},
		options: [
			{ name: 'Mensal',    value: 'MENSAL' },
			{ name: 'Bimestral', value: 'BIMESTRAL' },
			{ name: 'Trimestral', value: 'TRIMESTRAL' },
			{ name: 'Semestral', value: 'SEMESTRAL' },
			{ name: 'Anual',     value: 'ANUAL' },
		],
		default: 'MENSAL',
		description: 'Herda a recorrência da Empresa se omitido',
	},
	{
		displayName: 'Status Da Fatura',
		name: 'invoiceStatus',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['updateInvoice'],
			},
		},
		options: [
			{ name: 'Em Aberto', value: 'open' },
			{ name: 'Paga', value: 'paid' },
		],
		default: 'open',
		description: 'Atualizar status da fatura',
	},
	// ============================================================
	//  OPERAÇÕES — NFS-e
	// ============================================================
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['nfse'] } },
		options: [
			{ name: 'Atualizar Dados Fiscais',     value: 'updateFiscalData',  action: 'Atualizar dados fiscais do tenant' },
			{ name: 'Autorizar NFS-e',             value: 'authorizeNfse',     action: 'Forçar autorização de uma NFS-e' },
			{ name: 'Cancelar NFS-e',              value: 'cancelNfse',        action: 'Cancelar uma NFS-e' },
			{ name: 'Consultar Dados Fiscais',     value: 'getFiscalData',     action: 'Consultar dados fiscais do tenant' },
			{ name: 'Download PDF',                value: 'downloadNfsePdf',   action: 'Baixar PDF da NFS-e' },
			{ name: 'Download XML',                value: 'downloadNfseXml',   action: 'Baixar XML da NFS-e' },
			{ name: 'Emitir / Agendar NFS-e',     value: 'scheduleNfse',      action: 'Agendar emissão de NFS-e por fatura' },
			{ name: 'Listar NFS-e',               value: 'listNfse',          action: 'Listar notas fiscais com filtros' },
			{ name: 'NFS-e Por Fatura',            value: 'getNfseByInvoice',  action: 'Listar NFS-e de uma fatura' },
			{ name: 'Obter Detalhe NFS-e',        value: 'getNfse',           action: 'Obter detalhes de uma NFS-e' },
			{ name: 'Sincronizar NFS-e',           value: 'syncNfse',          action: 'Sincronizar status de uma NFS-e' },
		],
		default: 'listNfse',
	},

	// ============================================================
	//  CAMPOS — NFS-e: ID da Empresa
	// ============================================================
	{
		displayName: 'ID Da Empresa',
		name: 'tenantId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nfse'],
				operation: ['getFiscalData', 'updateFiscalData'],
			},
		},
		default: '',
		description: 'ID do tenant para consulta/atualização dos dados fiscais',
	},

	// ============================================================
	//  CAMPOS — NFS-e: ID da NFS-e
	// ============================================================
	{
		displayName: 'ID Da NFS-e',
		name: 'nfseId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nfse'],
				operation: ['getNfse', 'authorizeNfse', 'cancelNfse', 'syncNfse', 'downloadNfsePdf', 'downloadNfseXml'],
			},
		},
		default: '',
		description: 'ID numérico da NFS-e a ser manipulada',
	},

	// ============================================================
	//  CAMPOS — NFS-e: ID da Fatura
	// ============================================================
	{
		displayName: 'ID Da Fatura',
		name: 'invoiceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nfse'],
				operation: ['getNfseByInvoice', 'scheduleNfse'],
			},
		},
		default: '',
		description: 'ID da fatura vinculada à NFS-e',
	},

	// ============================================================
	//  CAMPOS — NFS-e: Data de emissão (scheduleNfse)
	// ============================================================
	{
		displayName: 'Data De Emissão (Effective Date)',
		name: 'nfseEffectiveDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['nfse'],
				operation: ['scheduleNfse'],
			},
		},
		default: '',
		description: 'Data de competência para emissão da nota fiscal (formato YYYY-MM-DD)',
	},

	// ============================================================
	//  CAMPOS — NFS-e: Dados Fiscais (updateFiscalData)
	// ============================================================
	{
		displayName: 'Dados Fiscais',
		name: 'fiscalData',
		type: 'collection',
		placeholder: 'Adicionar Campo Fiscal',
		default: {},
		displayOptions: {
			show: {
				resource: ['nfse'],
				operation: ['updateFiscalData'],
			},
		},
		options: [
			{ displayName: 'Nome Fiscal Da Empresa',  name: 'tenantFiscalName',       type: 'string',  default: '', placeholder: 'Empresa LTDA' },
			{ displayName: 'CPF / CNPJ',              name: 'cpfCnpj',                type: 'string',  default: '', placeholder: '00.000.000/0001-00' },
			{ displayName: 'E-Mail Fiscal',           name: 'fiscalEmail',             type: 'string',  default: '', placeholder: 'fiscal@empresa.com' },
			{ displayName: 'Telefone Fiscal',         name: 'fiscalMobilePhone',       type: 'string',  default: '', placeholder: '11999999999' },
			{ displayName: 'Endereço',                name: 'address',                 type: 'string',  default: '' },
			{ displayName: 'Número',                  name: 'addressNumber',            type: 'string',  default: '' },
			{ displayName: 'Complemento',             name: 'complement',              type: 'string',  default: '' },
			{ displayName: 'Bairro',                  name: 'province',                type: 'string',  default: '' },
			{ displayName: 'Cidade',                  name: 'city',                    type: 'string',  default: '' },
			{ displayName: 'Estado (UF)',             name: 'state',                   type: 'string',  default: '', placeholder: 'SP' },
			{ displayName: 'CEP',                     name: 'postalCode',              type: 'string',  default: '', placeholder: '01001000' },
			{ displayName: 'Habilitar Emissão NFS-e', name: 'invoiceEmissionEnabled',  type: 'boolean', default: false, description: 'Ativa a emissão automática de NFS-e para este tenant' },
		],
	},

	// ============================================================
	//  CAMPOS — NFS-e: Filtros de listagem (listNfse)
	// ============================================================
	{
		displayName: 'Filtros',
		name: 'nfseFilters',
		type: 'collection',
		placeholder: 'Adicionar Filtro',
		default: {},
		displayOptions: {
			show: {
				resource: ['nfse'],
				operation: ['listNfse'],
			},
		},
		options: [
			{ displayName: 'ID Da Empresa', name: 'tenantId',  type: 'string', default: '',  description: 'Filtrar notas de um tenant específico' },
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Autorizada', value: 'AUTHORIZED' },
					{ name: 'Agendada',   value: 'SCHEDULED'  },
					{ name: 'Cancelada',  value: 'CANCELED'   },
					{ name: 'Erro',       value: 'ERROR'       },
				],
				default: 'AUTHORIZED',
			},
			{ displayName: 'ID Da Fatura',         name: 'invoiceId',   type: 'string',   default: '',  description: 'Filtrar NFS-e de uma fatura específica' },
			{ displayName: 'Data Inicial',         name: 'startDate',   type: 'dateTime', default: '',  description: 'Filtro por effectiveDate (YYYY-MM-DD)' },
			{ displayName: 'Data Final',           name: 'endDate',     type: 'dateTime', default: '',  description: 'Filtro por effectiveDate (YYYY-MM-DD)' },
			{ displayName: 'Página',               name: 'pageNumber',  type: 'number',   default: 1,   typeOptions: { minValue: 1 } },
			{ displayName: 'Itens Por Página',     name: 'pageSize',    type: 'number',   default: 20,  typeOptions: { minValue: 1, maxValue: 100 } },
		],
	},
];