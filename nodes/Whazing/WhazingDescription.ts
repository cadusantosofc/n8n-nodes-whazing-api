import { INodeProperties } from 'n8n-workflow';

export const whazingDescription: INodeProperties[] = [
	{
		displayName: 'Recurso',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Administração (Empresas/Usuários)', value: 'admin' },
			{ name: 'Canais (Status/QR Code)', value: 'channel' },
			{ name: 'Contatos (CRM/Tags)', value: 'contact' },
			{ name: 'Mensagens (API Baileys/Simples)', value: 'message' },
			{ name: 'Mensagens (API Oficial)', value: 'messageOfficial' },
			{ name: 'Mensagens (API Plus/Pix)', value: 'messagePlus' },
			{ name: 'Tickets (Atendimentos/ChatBot)', value: 'ticket' },
		],
		default: 'message',
	},

	// ----------------------------------
	//         Mensagem Básica (Baileys)
	// ----------------------------------
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		options: [
			{
				name: 'Enviar Arquivo',
				value: 'sendFile',
				description: 'Enviar imagem, vídeo, áudio ou documento',
				action: 'Enviar uma mensagem com arquivo',
			},
			{
				name: 'Enviar Botões',
				value: 'sendButton',
				description: 'Enviar mensagem com botões interativos',
				action: 'Enviar uma mensagem com botões',
			},
			{
				name: 'Enviar Localização',
				value: 'sendLocation',
				description: 'Enviar um mapa com localização específica',
				action: 'Enviar uma mensagem com localização',
			},
			{
				name: 'Enviar Sticker',
				value: 'sendSticker',
				description: 'Enviar uma figurinha (sticker)',
				action: 'Enviar uma mensagem com sticker',
			},
			{
				name: 'Enviar Texto',
				value: 'sendText',
				description: 'Enviar uma mensagem de texto simples',
				action: 'Enviar uma mensagem de texto',
			},
			{
				name: 'Mensagem via Parâmetros',
				value: 'sendParams',
				description: 'Enviar mensagem usando parâmetros de URL',
				action: 'Enviar mensagem via parâmetros',
			},
		],
		default: 'sendText',
	},

	// ----------------------------------
	//         Mensagem Oficial
	// ----------------------------------
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['messageOfficial'],
			},
		},
		options: [
			{
				name: 'Enviar Botão Oficial',
				value: 'sendButtonOfficial',
				action: 'Enviar botão oficial',
			},
			{
				name: 'Enviar Link CTA',
				value: 'sendLinkCta',
				action: 'Enviar link CTA',
			},
			{
				name: 'Enviar Lista',
				value: 'sendList',
				action: 'Enviar lista',
			},
			{
				name: 'Enviar Template',
				value: 'sendTemplate',
				action: 'Enviar template',
			},
			{
				name: 'Enviar Template com Parâmetros',
				value: 'sendTemplateParams',
				action: 'Enviar template com parâmetros',
			},
			{
				name: 'Solicitar Localização',
				value: 'requestLocation',
				action: 'Solicitar localização',
			},
		],
		default: 'sendTemplate',
	},

	// ----------------------------------
	//         Mensagem API Plus
	// ----------------------------------
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['messagePlus'],
			},
		},
		options: [
			{
				name: 'Enviar Botão Dinâmico PLUS',
				value: 'sendButtonDynamicPlus',
				action: 'Enviar botão dinâmico PLUS',
			},
			{
				name: 'Enviar Botão PLUS',
				value: 'sendButtonPlus',
				action: 'Enviar botão PLUS',
			},
			{
				name: 'Enviar Carrossel PLUS',
				value: 'sendCarouselPlus',
				action: 'Enviar carrossel PLUS',
			},
			{
				name: 'Enviar Link PLUS',
				value: 'sendLinkPlus',
				action: 'Enviar link PLUS',
			},
			{
				name: 'Enviar Link CTA PLUS',
				value: 'sendLinkCtaPlus',
				action: 'Enviar link CTA PLUS',
			},
			{
				name: 'Enviar Lista PLUS',
				value: 'sendListPlus',
				action: 'Enviar lista PLUS',
			},
			{
				name: 'Enviar Pix Button PLUS',
				value: 'sendPixButtonPlus',
				action: 'Enviar Pix Button PLUS',
			},
			{
				name: 'Enviar Solicitação de Pagamento PLUS',
				value: 'sendRequestPaymentPlus',
				action: 'Enviar solicitação de pagamento PLUS',
			},
			{
				name: 'Solicitar Localização PLUS',
				value: 'requestLocationPlus',
				action: 'Solicitar localização PLUS',
			},
		],
		default: 'sendButtonPlus',
	},

	// ----------------------------------
	//         Campos Comuns: Número e Rastreio
	// ----------------------------------
	{
		displayName: 'Número do WhatsApp',
		name: 'number',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['message', 'messageOfficial', 'messagePlus', 'contact', 'ticket', 'channel'],
			},
			hide: {
				operation: ['sendTemplate', 'sendTemplateParams'],
			},
		},
		default: '',
		placeholder: '5511999999999',
	},
	{
		displayName: 'ID do Ticket',
		name: 'ticketId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['message', 'messageOfficial', 'messagePlus', 'contact', 'ticket'],
			},
			hide: {
				operation: ['validateNumber', 'setChatBot'],
			},
		},
		default: '',
		description: 'Se fornecido, o ticket será identificado por este ID em vez do número',
	},

	// ----------------------------------
	//         Campos de Mensagem (Gerais)
	// ----------------------------------
	{
		displayName: 'Mensagem (Corpo)',
		name: 'body',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendText', 'sendButton', 'sendList', 'sendButtonOfficial', 'sendButtonPlus', 'sendListPlus', 'sendLinkPlus', 'sendButtonDynamicPlus', 'sendFile', 'sendSticker', 'sendCarouselPlus', 'sendRequestPaymentPlus'],
			},
		},
		default: '',
	},
	{
		displayName: 'Método de Envio',
		name: 'sendMethod',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['sendFile'],
			},
		},
		options: [
			{ name: 'URL do Arquivo', value: 'url' },
			{ name: 'Base64 / Binário', value: 'base64' },
		],
		default: 'url',
	},
	{
		displayName: 'URL do Arquivo',
		name: 'mediaUrl',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendFile'],
				sendMethod: ['url'],
			},
		},
		default: '',
	},
	{
		displayName: 'Tipo de Mídia',
		name: 'mediaType',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['sendFile'],
				sendMethod: ['base64'],
			},
		},
		options: [
			{ name: 'Áudio', value: 'audio' },
			{ name: 'Documento', value: 'document' },
			{ name: 'Imagem', value: 'image' },
			{ name: 'Vídeo', value: 'video' },
		],
		default: 'image',
	},
	{
		displayName: 'Arquivo (Base64)',
		name: 'mediaBase64',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendFile'],
				sendMethod: ['base64'],
			},
		},
		default: '',
	},
	{
		displayName: 'Nome do Arquivo',
		name: 'fileName',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendFile'],
				sendMethod: ['base64'],
			},
		},
		default: '',
	},

	{
		displayName: 'Propriedade Binária',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				operation: ['sendSticker'],
			},
		},
		description: 'Nome da propriedade binária que contém o arquivo para gerar o sticker.',
	},
	{
		displayName: 'External Key',
		name: 'externalKey',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['sendSticker', 'sendText', 'sendFile', 'sendParams'],
			},
		},
		description: 'Chave externa opcional para identificação da mensagem.',
	},
	// ----------------------------------
	//         Mensagens: Detalhes Complexos (Listas e Botões)
	// ----------------------------------
	{
		displayName: 'Título do Cabeçalho',
		name: 'headerText',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendButton', 'sendList', 'sendButtonOfficial', 'sendButtonPlus', 'sendListPlus', 'sendLinkPlus', 'sendLinkCta', 'sendLinkCtaPlus'],
			},
		},
		default: '',
	},
	{
		displayName: 'Rodapé (Opcional)',
		name: 'footer',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendButton', 'sendList', 'sendButtonOfficial', 'sendButtonPlus', 'sendListPlus', 'sendLinkPlus', 'sendLinkCta', 'sendLinkCtaPlus', 'sendButtonDynamicPlus', 'sendRequestPaymentPlus'],
			},
		},
		default: '',
	},
	{
		displayName: 'Texto do Link (Display)',
		name: 'linkDisplayText',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendLinkCta', 'sendLinkCtaPlus'],
			},
		},
		default: 'Ver mais',
	},
	{
		displayName: 'URL do Link',
		name: 'linkUrl',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendLinkCta', 'sendLinkCtaPlus'],
			},
		},
		default: 'https://',
	},
	{
		displayName: 'Texto do Botão (Trigger Lista)',
		name: 'buttonText',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendList', 'sendListPlus'],
			},
		},
		default: 'Clique para ver as opções',
	},
	{
		displayName: 'Seções da Lista',
		name: 'sections',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['sendList', 'sendListPlus'],
			},
		},
		default: {},
		options: [
			{
				name: 'sectionValues',
				displayName: 'Valores da Seção',
				values: [
					{
						displayName: 'Título da Seção',
						name: 'title',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Itens da Seção',
						name: 'rows',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								name: 'rowValues',
								displayName: 'Valores do Item',
								values: [
									{
										displayName: 'ID do Item',
										name: 'id',
										type: 'string',
										default: '',
									},
									{
										displayName: 'Título',
										name: 'title',
										type: 'string',
										default: '',
									},
									{
										displayName: 'Descrição',
										name: 'description',
										type: 'string',
										default: '',
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		displayName: 'Botões',
		name: 'buttons',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['sendButton', 'sendButtonOfficial', 'sendButtonPlus'],
			},
		},
		default: {},
		options: [
			{
				name: 'buttonValues',
				displayName: 'Valores do Botão',
				values: [
					{
						displayName: 'Texto do Botão',
						name: 'text',
						type: 'string',
						default: '',
					},
					{
						displayName: 'ID do Botão (Opcional)',
						name: 'id',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
	{
		displayName: 'Botões Dinâmicos (PLUS)',
		name: 'dynamicButtons',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['sendButtonDynamicPlus'],
			},
		},
		default: {},
		options: [
			{
				name: 'buttonValues',
				displayName: 'Valores do Botão',
				values: [
					{
						displayName: 'Tipo',
						name: 'btnType',
						type: 'options',
						options: [
							{ name: 'Resposta (Reply)', value: 'reply' },
							{ name: 'Copiar Texto (Copy)', value: 'copy' },
							{ name: 'Ligar (Call)', value: 'call' },
							{ name: 'Abrir Site (URL)', value: 'url' },
						],
						default: 'reply',
					},
					{
						displayName: 'Texto de Exibição',
						name: 'displayText',
						type: 'string',
						default: '',
					},
					{
						displayName: 'ID / Valor / URL / Telefone',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Dependendo do tipo: ID para resposta, texto para copiar, número para ligação ou URL para site',
					},
				],
			},
		],
	},
	{
		displayName: 'Itens do Carrossel (PLUS)',
		name: 'carouselItems',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['sendCarouselPlus'],
			},
		},
		default: {},
		options: [
			{
				name: 'itemValues',
				displayName: 'Valores do Item',
				values: [
					{
						displayName: 'Texto do Item',
						name: 'text',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Imagem (Base64)',
						name: 'image',
						type: 'string',
						default: '',
						description: 'Data URL base64 da imagem',
					},
					{
						displayName: 'Botões do Item',
						name: 'buttons',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
								options: [
							{
								name: 'buttonValues',
								displayName: 'Botão',
								values: [
									{ displayName: 'Tipo', name: 'itemBtnType', type: 'options', options: [{ name: 'Resposta', value: 'reply' }, { name: 'URL', value: 'url' }, { name: 'Ligar', value: 'call' }], default: 'reply' },
									{ displayName: 'Texto', name: 'displayText', type: 'string', default: '' },
									{ displayName: 'Valor/URL', name: 'value', type: 'string', default: '' },
								],
							},
						],
					},
				],
			},
		],
	},

	// ----------------------------------
	//         Template (Oficial)
	// ----------------------------------
	{
		displayName: 'Nome do Template',
		name: 'templateName',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendTemplate', 'sendTemplateParams'],
			},
		},
		default: '',
	},
	{
		displayName: 'Código do Idioma',
		name: 'languageCode',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendTemplate', 'sendTemplateParams'],
			},
		},
		default: 'pt_BR',
	},
	{
		displayName: 'Componentes do Template',
		name: 'templateComponents',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				operation: ['sendTemplateParams'],
			},
		},
		default: {},
		options: [
			{
				name: 'componentValues',
				displayName: 'Componente',
				values: [
					{
						displayName: 'Tipo de Componente',
						name: 'componentType',
						type: 'options',
						options: [
							{ name: 'Cabeçalho (Header)', value: 'header' },
							{ name: 'Corpo (Body)', value: 'body' },
							{ name: 'Botão (Button)', value: 'button' },
						],
						default: 'body',
					},
					{
						displayName: 'Subtipo (Para Botão)',
						name: 'sub_type',
						type: 'options',
						options: [
							{ name: 'Ação (Quick Reply)', value: 'quick_reply' },
							{ name: 'URL / CTA', value: 'url' },
						],
						default: 'quick_reply',
					},
					{
						displayName: 'Índice do Botão',
						name: 'index',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Parâmetros',
						name: 'parameters',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								name: 'parameterValues',
								displayName: 'Parâmetro',
								values: [
									{
										displayName: 'Tipo de Parâmetro',
										name: 'parameterType',
										type: 'options',
										options: [
											{ name: 'Texto', value: 'text' },
											{ name: 'Imagem', value: 'image' },
										],
										default: 'text',
									},
									{
										displayName: 'Nome do Parâmetro',
										name: 'parameter_name',
										type: 'string',
										default: '',
									},
									{
										displayName: 'Texto',
										name: 'text',
										type: 'string',
										default: '',
									},
									{
										displayName: 'Link da Imagem',
										name: 'link',
										type: 'string',
										default: '',
									},
								],
							},
						],
					},
				],
			},
		],
	},

	// ----------------------------------
	//         Localização
	// ----------------------------------
	{
		displayName: 'Latitude',
		name: 'latitude',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendLocation'],
			},
		},
		default: '',
	},
	{
		displayName: 'Longitude',
		name: 'longitude',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendLocation'],
			},
		},
		default: '',
	},
	{
		displayName: 'Nome do Local',
		name: 'locationName',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendLocation'],
			},
		},
		default: '',
	},
	{
		displayName: 'Endereço',
		name: 'address',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendLocation'],
			},
		},
		default: '',
	},

	// ----------------------------------
	//         Recurso: Ticket
	// ----------------------------------
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['ticket'],
			},
		},
		options: [
			{ name: 'Criar Novo Ticket', value: 'create', action: 'Criar um ticket' },
			{ name: 'Consultar Último Ticket do Canal', value: 'showTicket', action: 'Consultar último ticket atribuído ao canal' },
			{ name: 'Consultar Ticket do ChatBot', value: 'showTicketChatBot', action: 'Consultar ticket do ChatBot' },
			{ name: 'Listar Todos os Tickets do Canal', value: 'getAll', action: 'Consultar todos os tickets atribuídos ao canal' },
			{ name: 'Atualizar Informações do Ticket', value: 'updateInfo', action: 'Atualizar informações do ticket' },
			{ name: 'Atualizar Fila do Ticket', value: 'setQueue', action: 'Atualizar fila do ticket' },
			{ name: 'Atualizar Chatbot do Ticket', value: 'updateChatbot', action: 'Atualizar chatbot do ticket' },
			{ name: 'Listar Mensagens do Ticket', value: 'listMessages', action: 'Listar mensagens do ticket' },
			{ name: 'Ativar/Desativar ChatBot (Geral)', value: 'setChatBot', action: 'Definir ativação de chatbot' },
			{ name: 'Obter Detalhes via ID', value: 'get', action: 'Obter informações do ticket' },
		],
		default: 'create',
	},
	{
		displayName: 'ID do Chatbot',
		name: 'chatbotId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['updateChatbot'],
			},
		},
		default: '',
	},
	{
		displayName: 'ID do Usuário (Atendente)',
		name: 'userId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['create', 'updateInfo'],
			},
		},
		default: '',
	},
	{
		displayName: 'Ativar ChatBot',
		name: 'enableChatbot',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['setChatBot'],
			},
		},
		description: 'Se deve ativar (Ligado) ou desativar (Desligado) o chatbot para este número.',
	},

	{
		displayName: 'Status do Ticket',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['create', 'updateInfo'],
			},
		},
		options: [
			{ name: 'Aberto', value: 'open' },
			{ name: 'Pendente', value: 'pending' },
			{ name: 'Fechado', value: 'closed' },
		],
		default: 'open',
	},
	{
		displayName: 'ID da Fila',
		name: 'queueId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['ticket'],
				operation: ['create', 'updateInfo', 'setQueue'],
			},
		},
		default: '',
	},

	// ----------------------------------
	//         Recurso: Contato
	// ----------------------------------
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contact'],
			},
		},
		options: [
			{ name: 'Atualizar Informações do Contato', value: 'update', action: 'Atualizar informações do contato' },
			{ name: 'Obter Dados do Contato', value: 'get', action: 'Buscar informações do contato' },
			{ name: 'Criar Novo Contato', value: 'create', action: 'Criar um contato' },
			{ name: 'Definir Data de Follow-up', value: 'setFollowup', action: 'Definir follow-up' },
			{ name: 'Vincular à Carteira CRM', value: 'setCrm', action: 'Definir informações CRM' },
			{ name: 'Gerenciar Tags do Contato', value: 'setTags', action: 'Definir tags' },
			{ name: 'Listar Contatos por Carteira', value: 'listByWallet', action: 'Listar contatos por carteira' },
			{ name: 'Listar Contatos por CRM', value: 'listByCrm', action: 'Listar contatos por CRM' },
			{ name: 'Listar Contatos por Data', value: 'listByFollowup', action: 'Listar contatos por follow-up' },
			{ name: 'Listar Contatos por Tag', value: 'listByTag', action: 'Listar contatos por tag' },
			{ name: 'Validar Número do WhatsApp', value: 'validateNumber', action: 'Validar número do WhatsApp' },
		],
		default: 'create',
	},
	{
		displayName: 'ID do Contato',
		name: 'contactId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['update', 'get', 'setCrm', 'setFollowup', 'setTags'],
			},
		},
		default: '',
	},

	{
		displayName: 'Nome do Contato',
		name: 'contactName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
		default: '',
	},
	{
		displayName: 'E-mail',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
		default: '',
	},
	{
		displayName: 'Observações (Commentary)',
		name: 'commentary',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
		default: '',
	},
	{
		displayName: 'Prazo (Deadline)',
		name: 'deadline',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Data limite para o contato',
	},
	{
		displayName: 'Preço Kanban',
		name: 'kanbanPrice',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
		default: '',
	},
	{
		displayName: 'Desativar BoT',
		name: 'disableBot',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
		default: false,
	},
	{
		displayName: 'Desativar Campanha',
		name: 'disableCampaign',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
		default: false,
	},
	{
		displayName: 'Desativar Kanban',
		name: 'disableKanban',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
		default: false,
	},
	{
		displayName: 'Ignorar Contato',
		name: 'ignore',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
		default: false,
	},
	{
		displayName: 'Informações Extras',
		name: 'extraInfo',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		options: [
			{
				name: 'extraInfoValues',
				displayName: 'Info',
				values: [
					{ displayName: 'Nome do Campo', name: 'name', type: 'string', default: '' },
					{ displayName: 'Valor', name: 'value', type: 'string', default: '' },
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
	},

	// ----------------------------------
	//         Outros: Canal
	// ----------------------------------
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['channel'],
			},
		},
		options: [
			{ name: 'Gerar QR Code (Nova Sessão)', value: 'getQrCode', action: 'Gerar QR Code' },
			{ name: 'Obter Status da Conexão', value: 'getStatus', action: 'Obter status do canal' },
			{ name: 'Desconectar/Logout do Canal', value: 'logout', action: 'Fazer logout do canal' },
			{ name: 'Reiniciar Sessão do Canal', value: 'restart', action: 'Reiniciar canal' },
		],
		default: 'getStatus',
	},
	
	// ----------------------------------
	//         Recurso: Admin
	// ----------------------------------
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['admin'],
			},
		},
		options: [
			{ name: 'Alterar Senha do Usuário da Empresa', value: 'changePassword', action: 'Alterar senha do usuário da empresa' },
			{ name: 'Atualizar Dados da Empresa', value: 'updateTenant', action: 'Atualizar dados da empresa' },
			{ name: 'Criar Nova Empresa', value: 'createTenant', action: 'Criar nova empresa' },
			{ name: 'Listar Todas Empresas', value: 'listTenants', action: 'Listar todas empresas' },
			{ name: 'Obter Dados por ID', value: 'getTenant', action: 'Obter dados por ID' },
			{ name: 'Renovar Assinatura (+1 Mês)', value: 'addMonth', action: 'Renovar assinatura (+1 mês)' },
			{ name: 'Listar Usuários da Empresa', value: 'listUsers', action: 'Listar usuários da empresa' },
		],
		default: 'createTenant',
	},
	{
		displayName: 'ID da Empresa (Tenant)',
		name: 'tenantId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['getTenant', 'updateTenant', 'addMonth', 'listUsers'],
			},
		},
		default: '',
	},
	{
		displayName: 'ID do Usuário',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['changePassword'],
			},
		},
		default: '',
	},
	{
		displayName: 'Senha (Nova)',
		name: 'adminPassword',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['createTenant', 'changePassword'],
			},
		},
		default: '',
	},
	{
		displayName: 'Nome do Administrador',
		name: 'adminUserName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['createTenant'],
			},
		},
		default: '',
	},
	{
		displayName: 'Nome da Empresa',
		name: 'tenantName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['createTenant', 'updateTenant'],
			},
		},
		default: '',
	},
	{
		displayName: 'E-mail de Login',
		name: 'adminEmail',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['createTenant', 'updateTenant'],
			},
		},
		default: '',
	},
	{
		displayName: 'Telefone de Contato',
		name: 'adminPhone',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['createTenant', 'updateTenant'],
			},
		},
		default: '',
	},
	{
		displayName: 'Plano (ID)',
		name: 'planId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['createTenant', 'updateTenant'],
			},
		},
		default: '1',
	},
	{
		displayName: 'Dias de Teste (Trial)',
		name: 'timeTest',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['createTenant'],
			},
		},
		default: '3',
	},
	{
		displayName: 'Data de Vencimento (Due Date)',
		name: 'dueDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['admin'],
				operation: ['updateTenant'],
			},
		},
		default: '',
		description: 'Nova data de vencimento para o tenant (Ex: 2025-07-17T20:58)',
	},
	// ----------------------------------
	//         Campos de Pagamento (PLUS)
	// ----------------------------------
	{
		displayName: 'Valor (Amount)',
		name: 'amount',
		type: 'number',
		typeOptions: {
			numberPrecision: 2,
		},
		displayOptions: {
			show: {
				operation: ['sendRequestPaymentPlus'],
			},
		},
		default: 0,
	},
	{
		displayName: 'Título do Pagamento',
		name: 'paymentTitle',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendRequestPaymentPlus'],
			},
		},
		default: 'Detalhes do pedido',
	},
	{
		displayName: 'Nome do Item',
		name: 'itemName',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendRequestPaymentPlus'],
			},
		},
		default: '',
	},
	{
		displayName: 'Tipo de Pix',
		name: 'pixType',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['sendPixButtonPlus', 'sendRequestPaymentPlus'],
			},
		},
		options: [
			{ name: 'CNPJ', value: 'CNPJ' },
			{ name: 'CPF', value: 'CPF' },
			{ name: 'E-mail', value: 'EMAIL' },
			{ name: 'Telefone', value: 'PHONE' },
			{ name: 'Chave Aleatória (EVP)', value: 'EVP' },
		],
		default: 'CNPJ',
	},
	{
		displayName: 'Chave Pix',
		name: 'pixKey',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendPixButtonPlus', 'sendRequestPaymentPlus'],
			},
		},
		default: '',
	},
	{
		displayName: 'Nome do Beneficiário Pix',
		name: 'pixName',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendPixButtonPlus', 'sendRequestPaymentPlus'],
			},
		},
		default: '',
	},
	{
		displayName: 'Código do Boleto',
		name: 'boletoCode',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['sendRequestPaymentPlus'],
			},
		},
		default: '',
	},
	{
		displayName: 'Créditos & Suporte',
		name: 'authorNotice',
		type: 'notice',
		default: 'Não encontrou o evento certo? Faça uma chamada personalizada da API Whazing.\n\n**Carlos Eduardo @cadu.santos1 instgram**',
	},
];
