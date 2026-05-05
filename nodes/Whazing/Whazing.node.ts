import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
	NodeConnectionTypes,
} from 'n8n-workflow';

import { whazingDescription } from './WhazingDescription';
import { whazingApiRequest, adminApiRequest } from './GenericFunctions';

// ─────────────────────────────────────────────────────────────────────────────
// Função standalone compartilhada por API Oficial e API PLUS.
// Não pode ser método privado da classe porque dentro do execute()
// o `this` é IExecuteFunctions, não a instância Whazing.
// ─────────────────────────────────────────────────────────────────────────────
async function handleApiMessage(
	ctx: IExecuteFunctions,
	opts: {
		i: number;
		number: string;
		ticketId: string;
		path: string;
		operation: string;
		getButtons:            () => IDataObject[];
		getSections:           () => IDataObject[];
		getDynamicButtons:     () => IDataObject[];
		getCarouselItems:      () => IDataObject[];
		getTemplateComponents: () => IDataObject[];
	},
): Promise<unknown> {
	const { i, number, ticketId, path, operation } = opts;

	const typeMap: Record<string, string> = {
		sendButtonOfficial:     'button',
		sendButtonPlus:         'button',
		sendList:               'list',
		sendListPlus:           'list',
		sendLinkCta:            'cta_url',
		sendLinkCtaPlus:        'cta_url',
		sendLinkPlus:           'cta_url',
		requestLocation:        'location_request_message',
		requestLocationPlus:    'location_request_message',
		sendButtonDynamicPlus:  'dinamic_button',
		sendCarouselPlus:       'carousel_button',
		sendPixButtonPlus:      'pixbutton',
		sendRequestPaymentPlus: 'requestpayment',
		sendTemplate:           'template',
		sendTemplateParams:     'template',
	};

	const contentType = typeMap[operation];
	const body: IDataObject = { contents: { type: contentType } as IDataObject };
	const contents = body.contents as IDataObject;

	// Destinatário
	if (ticketId) {
		body.ticketId = ticketId;
	} else if (number && number.length < 10 && !number.includes('@') && !isNaN(Number(number))) {
		body.ticketId = number;
	} else if (number) {
		body.number = number;
	}

	// Estrutura padrão body/header/footer para tipos interativos
	const interactiveTypes = ['button', 'list', 'cta_url', 'location_request_message', 'pixbutton', 'requestpayment'];
	if (interactiveTypes.includes(contentType as string)) {
		contents.body = { text: ctx.getNodeParameter('body', i, '') as string };
		const headerText = ctx.getNodeParameter('headerText', i, '') as string;
		if (headerText) contents.header = { type: 'text', text: headerText };
		const footerText = ctx.getNodeParameter('footer', i, '') as string;
		if (footerText) contents.footer = { text: footerText };
	}

	// Ação específica por operação
	if (operation === 'sendList' || operation === 'sendListPlus') {
		contents.action = {
			button:   ctx.getNodeParameter('buttonText', i, 'Ver opções') as string,
			sections: opts.getSections(),
		};

	} else if (operation === 'sendButtonOfficial' || operation === 'sendButtonPlus') {
		contents.action = { buttons: opts.getButtons() };

	} else if (operation === 'sendLinkPlus') {
		const url = ctx.getNodeParameter('url', i, '') as string;
		if (!url?.trim()) throw new NodeOperationError(ctx.getNode(), 'A URL é obrigatória para enviar links via API Plus.', { itemIndex: i });
		contents.action = {
			name: 'cta_url',
			parameters: { display_text: ctx.getNodeParameter('buttonText', i, 'Ver Link') as string, url },
		};

	} else if (operation === 'sendLinkCta' || operation === 'sendLinkCtaPlus') {
		const url = ctx.getNodeParameter('linkUrl', i, '') as string;
		if (!url?.trim()) throw new NodeOperationError(ctx.getNode(), 'A URL é obrigatória para enviar um CTA de link.', { itemIndex: i });
		contents.action = {
			name: 'cta_url',
			parameters: { display_text: ctx.getNodeParameter('linkDisplayText', i, 'Ver mais') as string, url },
		};

	} else if (contentType === 'location_request_message') {
		const bodyText = ctx.getNodeParameter('body', i, '') as string;
		if (!bodyText?.trim()) throw new NodeOperationError(ctx.getNode(), 'A mensagem é obrigatória para solicitar localização.', { itemIndex: i });
		contents.action = { name: 'send_location' };

	} else if (operation === 'sendButtonDynamicPlus') {
		contents.text = ctx.getNodeParameter('body', i, '') as string;
		const dFooter = ctx.getNodeParameter('footer', i, '') as string;
		if (dFooter) contents.footerText = dFooter;
		contents.choices = opts.getDynamicButtons();

	} else if (operation === 'sendCarouselPlus') {
		contents.text  = ctx.getNodeParameter('body', i, '') as string;
		contents.items = opts.getCarouselItems();

	} else if (operation === 'sendPixButtonPlus') {
		contents.pixKey  = ctx.getNodeParameter('pixKey',  i, '') as string;
		contents.pixName = ctx.getNodeParameter('pixName', i, '') as string;
		contents.pixType = ctx.getNodeParameter('pixType', i, '') as string;

	} else if (operation === 'sendRequestPaymentPlus') {
		const amount  = Number(ctx.getNodeParameter('amount',  i, 0)) || 0;
		const pixKey  = ctx.getNodeParameter('pixKey',  i, '') as string;
		const pixName = ctx.getNodeParameter('pixName', i, '') as string;
		const pixType = ctx.getNodeParameter('pixType', i, '') as string;

		if (amount <= 0)      throw new NodeOperationError(ctx.getNode(), 'O valor do pagamento deve ser maior que zero.', { itemIndex: i });
		if (!pixKey?.trim())  throw new NodeOperationError(ctx.getNode(), 'A chave Pix é obrigatória.', { itemIndex: i });
		if (!pixName?.trim()) throw new NodeOperationError(ctx.getNode(), 'O nome do beneficiário Pix é obrigatório.', { itemIndex: i });
		if (!pixType?.trim()) throw new NodeOperationError(ctx.getNode(), 'O tipo de Pix é obrigatório.', { itemIndex: i });

		contents.amount   = amount;
		contents.text     = ctx.getNodeParameter('body',         i, '') as string;
		contents.pixKey   = pixKey;
		contents.pixName  = pixName;
		contents.pixType  = pixType;
		contents.title    = ctx.getNodeParameter('paymentTitle', i, '') as string;
		contents.itemName = ctx.getNodeParameter('itemName',     i, '') as string;
		const bCode = ctx.getNodeParameter('boletoCode', i, '') as string;
		if (bCode) contents.boletoCode = bCode;
		const footer = ctx.getNodeParameter('footer', i, '') as string;
		if (footer) contents.footer = footer;

	} else if (operation === 'sendTemplate' || operation === 'sendTemplateParams') {
		const components = operation === 'sendTemplate'
			? [{ type: 'body', parameters: [] }]
			: opts.getTemplateComponents();
		body.contents = {
			name:       ctx.getNodeParameter('templateName',  i, '') as string,
			language:   { code: ctx.getNodeParameter('languageCode', i, 'pt_BR') as string },
			components,
		};
	}

	// Limpa header/footer vazios
	if (contents.footer && !(contents.footer as IDataObject).text) delete contents.footer;
	if (contents.header && !(contents.header as IDataObject).text) delete contents.header;

	return whazingApiRequest.call(ctx, 'POST', path, body);
}

// ─────────────────────────────────────────────────────────────────────────────
// Node principal
// ─────────────────────────────────────────────────────────────────────────────
export class Whazing implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Whazing',
		name: 'whazing',
		icon: 'file:whazing.svg',
		group: ['transform'],
		version: 1,
		description:
			'Integração completa com a API Whazing — ' +
			'Envie mensagens, gerencie tickets, automatize pagamentos PIX e muito mais via WhatsApp Business API',
		defaults: { name: 'Whazing' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'whazingApi', required: true }],
		properties: whazingDescription,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i, '') as string;
				const operation = this.getNodeParameter('operation', i, '') as string;

				if (!resource) {
					throw new NodeOperationError(this.getNode(), 'O parâmetro "resource" não foi encontrado. Verifique a configuração do node.', { itemIndex: i });
				}
				if (!operation) {
					throw new NodeOperationError(this.getNode(), `O parâmetro "operation" não foi encontrado para o recurso "${resource}". Verifique se a operação está selecionada corretamente.`, { itemIndex: i });
				}

				let responseData: unknown;

				const number   = this.getNodeParameter('number',   i, '') as string;
				const ticketId = this.getNodeParameter('ticketId', i, '') as string;

				// -----------------------------------------------------------
				// Helpers para montar payloads complexos
				// -----------------------------------------------------------
				const getButtons = () => {
					const col = this.getNodeParameter('buttons', i, { buttonValues: [] }) as IDataObject;
					return ((col.buttonValues as IDataObject[]) || []).map((btn) => ({
						type: 'reply',
						reply: { id: (btn.id as string) || (btn.text as string), title: btn.text as string },
					}));
				};

				const getSections = () => {
					const col = this.getNodeParameter('sections', i, { sectionValues: [] }) as IDataObject;
					return ((col.sectionValues as IDataObject[]) || []).map((section) => ({
						title: section.title as string,
						rows: ((section.rows as IDataObject)?.rowValues as IDataObject[] || []).map((row) => ({
							id: row.id as string, title: row.title as string, description: row.description as string,
						})),
					}));
				};

				const getDynamicButtons = () => {
					const col = this.getNodeParameter('dynamicButtons', i, { buttonValues: [] }) as IDataObject;
					return ((col.buttonValues as IDataObject[]) || []).map((btn) => {
						const mapped: IDataObject = { displayText: btn.displayText as string, id: btn.btnType === 'reply' ? btn.value as string : '', type: btn.btnType as string };
						if (btn.btnType === 'copy') mapped.copyText    = btn.value as string;
						if (btn.btnType === 'call') mapped.phoneNumber = btn.value as string;
						if (btn.btnType === 'url')  mapped.url         = btn.value as string;
						return mapped;
					});
				};

				const getCarouselItems = () => {
					const col = this.getNodeParameter('carouselItems', i, { itemValues: [] }) as IDataObject;
					return ((col.itemValues as IDataObject[]) || []).map((item) => {
						const buttons = ((item.buttons as IDataObject)?.buttonValues as IDataObject[] || []).map((btn) => {
							const b: IDataObject = { displayText: btn.displayText as string, type: btn.itemBtnType as string, id: btn.itemBtnType === 'reply' ? btn.value as string : '' };
							if (btn.itemBtnType === 'url')  b.url         = btn.value as string;
							if (btn.itemBtnType === 'call') b.phoneNumber = btn.value as string;
							return b;
						});
						return { text: item.text as string, image: item.image as string, buttons };
					});
				};

				const getTemplateComponents = () => {
					const raw = this.getNodeParameter('templateComponents', i, { componentValues: [] }) as IDataObject;
					return ((raw.componentValues as IDataObject[]) || []).map((comp) => {
						const component: IDataObject = { type: comp.componentType as string, parameters: [] };
						if (comp.componentType === 'button') {
							component.sub_type = comp.sub_type as string;
							component.index    = String(comp.index);
						}
						const paramsRaw = (comp.parameters as IDataObject) || { parameterValues: [] };
						component.parameters = ((paramsRaw.parameterValues as IDataObject[]) || []).map((param) => {
							if (param.parameterType === 'text')
								return { type: 'text', parameter_name: param.parameter_name as string, text: param.text as string };
							if (param.parameterType === 'image')
								return { type: 'image', image: { link: param.link as string } };
							return param;
						});
						return component;
					});
				};

				// ===========================================================
				// RECURSO: Mensagens
				// ===========================================================
				if (resource === 'msgBaileys') {

					if (operation === 'sendText') {
						const body: IDataObject = {
								number,
								body:        this.getNodeParameter('body',        i, '') as string,
								externalKey: this.getNodeParameter('externalKey', i, '') as string,
							};
							if (ticketId) body.ticketId = ticketId;
							responseData = await whazingApiRequest.call(this, 'POST', '', body);

						} else if (operation === 'sendFile') {
							const sendMethod = this.getNodeParameter('sendMethod', i, 'url') as string;
							const body: IDataObject = {
								number,
								body:        this.getNodeParameter('body',        i, '') as string,
								externalKey: this.getNodeParameter('externalKey', i, '') as string,
							};
							if (ticketId) body.ticketId = ticketId;

							if (sendMethod === 'url') {
								body.mediaUrl = this.getNodeParameter('mediaUrl', i, '') as string;
								responseData = await whazingApiRequest.call(this, 'POST', '', body);
							} else if (sendMethod === 'base64') {
								body.mediaMessage = {
									mediaType: this.getNodeParameter('mediaType',   i, 'image') as string,
									fileName:  this.getNodeParameter('fileName',    i, '') as string,
									media:     this.getNodeParameter('mediaBase64', i, '') as string,
								};
								responseData = await whazingApiRequest.call(this, 'POST', '', body);
							} else {
								// Binary / Form-data
								const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i, 'data') as string;
								const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
								const formData: IDataObject = {
									...body,
									media: {
										value: await this.helpers.getBinaryDataBuffer(i, binaryPropertyName),
										options: { filename: binaryData.fileName, contentType: binaryData.mimeType },
									},
								};
								responseData = await whazingApiRequest.call(this, 'POST', '', {}, {}, undefined, {}, undefined, formData);
							}

						} else if (operation === 'sendLocation') {
							responseData = await whazingApiRequest.call(this, 'POST', '/location', {
								number,
								contents: {
									type:      'location',
									longitude: parseFloat(this.getNodeParameter('longitude',    i, '0') as string),
									latitude:  parseFloat(this.getNodeParameter('latitude',     i, '0') as string),
									name:      this.getNodeParameter('locationName', i, '') as string,
									address:   this.getNodeParameter('address',      i, '') as string,
								},
							});

						} else if (operation === 'sendContact') {
							responseData = await whazingApiRequest.call(this, 'POST', '/sendcontact', {
								number,
								contents: {
									type:        'contact',
									displayName: this.getNodeParameter('contactDisplayName', i, '') as string,
									telephone:   this.getNodeParameter('contactTelephone',  i, '') as string,
								},
							});

						} else if (operation === 'sendButton') {
							const body: IDataObject = {
								number,
								contents: {
									type:   'button',
									body:   { text: this.getNodeParameter('body', i, '') as string },
									action: { buttons: getButtons() },
								},
							};
							const footer = this.getNodeParameter('footer', i, '') as string;
							if (footer) (body.contents as IDataObject).footer = { text: footer };
							const headerText = this.getNodeParameter('headerText', i, '') as string;
							if (headerText) (body.contents as IDataObject).header = { text: headerText };

							if (ticketId) body.ticketId = ticketId;
							responseData = await whazingApiRequest.call(this, 'POST', '/apioficial', body);

						} else if (operation === 'sendSticker') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i, 'data') as string;
							const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
							const formData: IDataObject = {
								number,
								body:        'sticker',
								sticker:     'true',
								externalKey: this.getNodeParameter('externalKey', i, '') as string,
								media: {
									value: await this.helpers.getBinaryDataBuffer(i, binaryPropertyName),
									options: { filename: binaryData.fileName, contentType: binaryData.mimeType },
								},
							};
							responseData = await whazingApiRequest.call(this, 'POST', '', {}, {}, undefined, {}, undefined, formData);

						} else if (operation === 'sendParams' || operation === 'sendParamsGroup') {
							const credentials = await this.getCredentials('whazingApi');
							const qs: IDataObject = {
								body:        this.getNodeParameter('body',        i, '') as string,
								number,
								externalKey: this.getNodeParameter('externalKey', i, '') as string,
								bearertoken: credentials.apiToken || '',
							};
							if (ticketId) qs.ticketId = ticketId;
							responseData = await whazingApiRequest.call(this, 'GET', '/params', {}, qs);
						}

				} else if (resource === 'msgOfficial') {
					responseData = await handleApiMessage(this, {
						i, number, ticketId, path: '/apioficial', operation,
						getButtons, getSections, getTemplateComponents,
						getDynamicButtons: () => [],
						getCarouselItems:  () => [],
					});

				} else if (resource === 'msgPlus') {
					const path = operation === 'sendRequestPaymentPlus' ? '/requestpayment' : '/apiplus';
					responseData = await handleApiMessage(this, {
						i, number, ticketId, path, operation,
						getButtons, getSections, getTemplateComponents,
						getDynamicButtons, getCarouselItems,
					});

				// ===========================================================
				// RECURSO: Contatos
				// ===========================================================
				} else if (resource === 'contact') {

					if (operation === 'create' || operation === 'update') {
						const extraInfoCollection = this.getNodeParameter('extraInfo', i, { extraInfoValues: [] }) as IDataObject;
						const extraInfo = ((extraInfoCollection.extraInfoValues as IDataObject[]) || []).map((info) => ({
							name: info.name as string, value: info.value as string,
						}));
						const body: IDataObject = {
							name:            this.getNodeParameter('contactName',     i, '') as string,
							email:           this.getNodeParameter('email',           i, '') as string,
							commentary:      this.getNodeParameter('commentary',      i, '') as string,
							deadline:        this.getNodeParameter('deadline',        i, '') as string,
							kanbanPrice:     this.getNodeParameter('kanbanPrice',     i, '') as string,
							disableBot:      this.getNodeParameter('disableBot',      i, false) as boolean,
							disableCampaign: this.getNodeParameter('disableCampaign', i, false) as boolean,
							disableKanban:   this.getNodeParameter('disableKanban',   i, false) as boolean,
							ignore:          this.getNodeParameter('ignore',          i, false) as boolean,
							extraInfo,
							wallets: [],
						};
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						if (contactIdInput) body.contactId = contactIdInput;
						if (ticketId)       body.ticketId  = ticketId;
						if (number)         body.number    = number;
						responseData = await whazingApiRequest.call(this, 'POST', operation === 'create' ? '/createcontact' : '/updatecontact', body);

					} else if (operation === 'get') {
						const body: IDataObject = {};
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						if (contactIdInput) body.contactId = Number(contactIdInput);
						else if (ticketId)  body.ticketId  = Number(ticketId);
						else                body.number    = number;
						responseData = await whazingApiRequest.call(this, 'POST', '/contact', body);

					} else if (operation === 'validateNumber') {
						responseData = await whazingApiRequest.call(this, 'POST', '/valid-whatsapp-number', { number });

					} else if (operation === 'setCrm' || operation === 'setFollowup' || operation === 'setTags') {
						const body: IDataObject = {};
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						if (contactIdInput) body.contactId = Number(contactIdInput);
						else if (ticketId)  body.ticketId  = Number(ticketId);
						else                body.number    = number;

						const val = this.getNodeParameter('valueId', i, '');
						if (operation === 'setCrm')      body.crm      = Number(val);
						else if (operation === 'setFollowup') body.followup = Number(val);
						else body.tags = (Array.isArray(val) ? val : [val]).map((t) => Number(t));

						const pathMap: Record<string, string> = {
							setCrm: '/updatecrm', setFollowup: '/updatefollowup', setTags: '/updatetag',
						};
						responseData = await whazingApiRequest.call(this, 'POST', pathMap[operation], body);

					} else if (operation.startsWith('listBy')) {
						const val  = this.getNodeParameter('valueId', i, '') as string;
						const type = operation.replace('listBy', '').toLowerCase();
						responseData = await whazingApiRequest.call(this, 'GET', `/contacts/${type}/${val}`);
					}

				// ===========================================================
				// RECURSO: Tickets
				// ===========================================================
				} else if (resource === 'ticket') {
					const numInt = isNaN(Number(number)) ? number : Number(number);

					if (operation === 'create') {
						const body: IDataObject = { number: numInt, status: this.getNodeParameter('status', i, 'pending') };
						const queueId = this.getNodeParameter('queueId', i, '') as string;
						const userId  = this.getNodeParameter('userId',  i, '') as string;
						if (queueId) body.queueId = Number(queueId);
						if (userId)  body.userId  = Number(userId);
						responseData = await whazingApiRequest.call(this, 'POST', '/createticket', body);

					} else if (operation === 'showTicket') {
						responseData = await whazingApiRequest.call(this, 'POST', '/showticket', { number: numInt });

					} else if (operation === 'showTicketChatBot') {
						responseData = await whazingApiRequest.call(this, 'POST', '/showticketchatbot', { number: numInt });

					} else if (operation === 'getAll') {
						responseData = await whazingApiRequest.call(this, 'POST', '/showallticket', { number: numInt });

					} else if (operation === 'updateInfo') {
						const ticketIdInput = this.getNodeParameter('ticketId', i, '') as string;
						const body: IDataObject = { ticketId: Number(ticketIdInput) };
						const status = this.getNodeParameter('status', i, '') as string;
						if (status) body.status = status;
						const queueId = this.getNodeParameter('queueId', i, '') as string;
						const userId  = this.getNodeParameter('userId',  i, '') as string;
						if (queueId) body.queueId = Number(queueId);
						if (userId)  body.userId  = Number(userId);
						responseData = await whazingApiRequest.call(this, 'POST', '/updateticketinfo', body);

					} else if (operation === 'setQueue') {
						const ticketIdInput = this.getNodeParameter('ticketId', i, '') as string;
						responseData = await whazingApiRequest.call(this, 'POST', '/updatequeue', {
							ticketId: Number(ticketIdInput),
							queueId:  Number(this.getNodeParameter('queueId', i, '')),
						});

					} else if (operation === 'setChatBot') {
						const ticketIdInput = this.getNodeParameter('ticketId', i, '') as string;
						responseData = await whazingApiRequest.call(this, 'POST', '/updatechatbot', {
							ticketId: Number(ticketIdInput),
							chatbot:  this.getNodeParameter('enableChatbot', i, true) as boolean,
						});

					} else if (operation === 'updateChatbot') {
						const ticketIdInput = this.getNodeParameter('ticketId', i, '') as string;
						responseData = await whazingApiRequest.call(this, 'POST', '/updatechatbot', {
							ticketId:  Number(ticketIdInput),
							chatbotId: Number(this.getNodeParameter('chatbotId', i, '')),
						});

					} else if (operation === 'listMessages' || operation === 'get') {
						const ticketIdInput = this.getNodeParameter('ticketId', i, '') as string;
						responseData = await whazingApiRequest.call(this, 'GET', `/ticket/${ticketIdInput}`);
					}

				// ===========================================================
				// RECURSO: Canal
				// ===========================================================
				} else if (resource === 'channel') {

					if (operation === 'getStatus') {
						responseData = await whazingApiRequest.call(this, 'GET', '/statuschannel');
					} else if (operation === 'getQrCode') {
						responseData = await whazingApiRequest.call(this, 'POST', '/qrcode', { number: null });
					} else if (operation === 'logout') {
						responseData = await whazingApiRequest.call(this, 'POST', '/logout', {});
					} else if (operation === 'restart') {
						responseData = await whazingApiRequest.call(this, 'POST', '/restart', {});
					}

				// ===========================================================
				// RECURSO: Kanban Pro
				// ===========================================================
				} else if (resource === 'kanban') {

					if (operation === 'getBoards') {
						responseData = await whazingApiRequest.call(this, 'GET', '/kanbanpro/boards');

					} else if (operation === 'getColumns') {
						const boardId = this.getNodeParameter('boardId', i, '') as string;
						responseData = await whazingApiRequest.call(this, 'GET', `/kanbanpro/boards/${boardId}/columns`);

					} else if (operation === 'getCards') {
						const boardId = this.getNodeParameter('boardId', i, '') as string;
						const qs: IDataObject = {};
						const columnId = this.getNodeParameter('columnId', i, '') as string;
						const priority = this.getNodeParameter('kanbanPriority', i, '') as string;
						const contactId = this.getNodeParameter('contactId', i, '') as string;
						const filters = this.getNodeParameter('kanbanFilters', i, {}) as IDataObject;

						if (columnId) qs.columnId = columnId;
						if (priority && priority !== 'none') qs.priority = priority;
						if (contactId) qs.contactId = contactId;
						if (filters.search) qs.search = filters.search;
						if (filters.includeArchived) qs.includeArchived = 'true';

						responseData = await whazingApiRequest.call(this, 'GET', `/kanbanpro/boards/${boardId}/cards`, {}, qs);

					} else if (operation === 'getCard') {
						const cardId = this.getNodeParameter('cardId', i, '') as string;
						responseData = await whazingApiRequest.call(this, 'GET', `/kanbanpro/cards/${cardId}`);

					} else if (operation === 'getContactCards') {
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						const qs: IDataObject = {};
						const filters = this.getNodeParameter('kanbanFilters', i, {}) as IDataObject;
						if (filters.includeArchived) qs.includeArchived = 'true';

						responseData = await whazingApiRequest.call(this, 'GET', `/kanbanpro/contact/${contactIdInput}/cards`, {}, qs);

					} else if (operation === 'createOrMoveCard') {
						const body: IDataObject = {
							boardId:   Number(this.getNodeParameter('boardId',   i, '')),
							columnId:  Number(this.getNodeParameter('columnId',  i, '')),
							contactId: Number(this.getNodeParameter('contactId', i, '')),
							action:    this.getNodeParameter('kanbanAction', i, 'create_or_move'),
						};
						const title    = this.getNodeParameter('cardTitle',      i, '') as string;
						const priority = this.getNodeParameter('kanbanPriority', i, 'none') as string;
						const note     = this.getNodeParameter('kanbanNote',     i, '') as string;
						const ticketIdInput = this.getNodeParameter('ticketId', i, '') as string;

						if (title)    body.title    = title;
						if (priority && priority !== 'none') body.priority = priority;
						if (note)     body.note     = note;
						if (ticketIdInput) body.ticketId = Number(ticketIdInput);

						responseData = await whazingApiRequest.call(this, 'POST', '/kanbanpro/card', body);

					} else if (operation === 'updateCard') {
						const cardId = this.getNodeParameter('cardId', i, '') as string;
						const body: IDataObject = {};

						const title    = this.getNodeParameter('cardTitle',      i, '') as string;
						const priority = this.getNodeParameter('kanbanPriority', i, 'none') as string;
						const columnId = this.getNodeParameter('columnId',       i, '') as string;
						const note     = this.getNodeParameter('kanbanNote',     i, '') as string;
						const assignee = this.getNodeParameter('assigneeId',     i, '') as string;
						const dueDate  = this.getNodeParameter('kanbanDueDate',  i, '') as string;

						if (title)    body.title    = title;
						if (priority && priority !== 'none') body.priority = priority;
						if (columnId) body.columnId = Number(columnId);
						if (note)     body.note     = note;
						if (assignee) body.assigneeId = Number(assignee);
						if (dueDate)  body.dueDate  = dueDate;

						responseData = await whazingApiRequest.call(this, 'PUT', `/kanbanpro/card/${cardId}`, body);

					} else if (operation === 'deleteCard') {
						const cardId    = this.getNodeParameter('cardId', i, '') as string;
						const permanent = this.getNodeParameter('permanentDelete', i, false) as boolean;
						const qs: IDataObject = {};
						if (permanent) qs.permanent = 'true';

						responseData = await whazingApiRequest.call(this, 'DELETE', `/kanbanpro/card/${cardId}`, {}, qs);
					}

				// ===========================================================
				// RECURSO: Admin
				// ===========================================================
				} else if (resource === 'admin') {

					if (operation === 'listTenants') {
						responseData = await adminApiRequest.call(this, 'GET', '');

					} else if (operation === 'listPlans') {
						responseData = await adminApiRequest.call(this, 'GET', '/plans');

					} else if (operation === 'getTenant') {
						const tenantId = this.getNodeParameter('tenantId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'GET', '', {}, { tenantId });

					} else if (operation === 'createTenant') {
						responseData = await adminApiRequest.call(this, 'POST', '/createtenant', {
							name:       this.getNodeParameter('adminUserName', i, '') as string,
							email:      this.getNodeParameter('adminEmail',    i, '') as string,
							password:   this.getNodeParameter('adminPassword', i, '') as string,
							tenantName: this.getNodeParameter('tenantName',   i, '') as string,
							phone:      this.getNodeParameter('adminPhone',   i, '') as string,
							plano:      this.getNodeParameter('planId',       i, '1') as string,
							timetest:   this.getNodeParameter('timeTest',     i, '3') as string,
							recurrence: this.getNodeParameter('recurrence',   i, 'MENSAL') as string,
						});

					} else if (operation === 'updateTenant') {
						const tenantId = this.getNodeParameter('tenantId', i, '') as string;
						if (tenantId === '1') throw new NodeOperationError(this.getNode(), 'O tenant ID 1 é o administrador global e não pode ser editado.', { itemIndex: i });
						responseData = await adminApiRequest.call(this, 'POST', '/updatetenant', {
							tenantId,
							tenantName: this.getNodeParameter('tenantName', i, '') as string,
							email:      this.getNodeParameter('adminEmail', i, '') as string,
							phone:      this.getNodeParameter('adminPhone', i, '') as string,
							plano:      this.getNodeParameter('planId',     i, '1') as string,
							dueDate:    this.getNodeParameter('dueDate',    i, '') as string,
							recurrence: this.getNodeParameter('recurrence', i, 'MENSAL') as string,
						});

					} else if (operation === 'addMonth') {
						const tenantId = this.getNodeParameter('tenantId', i, '') as string;
						if (tenantId === '1') throw new NodeOperationError(this.getNode(), 'O tenant ID 1 é o administrador global e não pode ser editado.', { itemIndex: i });

						const renewalMode = this.getNodeParameter('renewalMode', i, 'template') as string;

						// Calcula a nova data de vencimento
						let newDueDate: string;
						if (renewalMode === 'manual') {
							newDueDate = this.getNodeParameter('renewalDate', i, '') as string;
							if (!newDueDate) throw new NodeOperationError(this.getNode(), 'Informe a data de vencimento manual.', { itemIndex: i });
						} else {
							const period = this.getNodeParameter('renewalTemplate', i, 'monthly') as string;
							const d = new Date();
							if (period === 'weekly')     d.setDate(d.getDate() + 7);
							if (period === 'monthly')    d.setMonth(d.getMonth() + 1);
							if (period === 'quarterly')  d.setMonth(d.getMonth() + 3);
							if (period === 'semiannual') d.setMonth(d.getMonth() + 6);
							if (period === 'annual')     d.setFullYear(d.getFullYear() + 1);
							newDueDate = d.toISOString();
						}

						// Busca dados atuais do tenant para não sobrescrever campos obrigatórios
						let tenant = await adminApiRequest.call(this, 'GET', '', {}, { tenantId }) as IDataObject;
						if (Array.isArray(tenant)) tenant = (tenant as IDataObject[])[0];
						if (!tenant) throw new NodeOperationError(this.getNode(), 'Tenant não encontrado.', { itemIndex: i });

						responseData = await adminApiRequest.call(this, 'POST', '/updatetenant', {
							tenantId,
							tenantName: tenant.name as string,
							email:      tenant.email as string,
							phone:      tenant.phone as string,
							plano:      String(tenant.planId),
							dueDate:    newDueDate,
							recurrence: (tenant.recurrence as string) || 'MENSAL',
						});

					} else if (operation === 'listUsers') {
						const tenantId = this.getNodeParameter('tenantId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'GET', `/users/${tenantId}`);

					} else if (operation === 'changePassword') {
						const userId = this.getNodeParameter('userId', i, '') as string;
						if (userId === '1') throw new NodeOperationError(this.getNode(), 'O usuário ID 1 é o administrador global e não pode ter a senha alterada.', { itemIndex: i });
						responseData = await adminApiRequest.call(this, 'POST', '/users', {
							userId,
							password: this.getNodeParameter('adminPassword', i, '') as string,
						});
					} else {
						throw new NodeOperationError(this.getNode(), `Operação "${operation}" não reconhecida para o recurso "${resource}".`, { itemIndex: i });
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Recurso "${resource}" não reconhecido.`, { itemIndex: i });
				}

				const executionData = this.helpers
					.returnJsonArray(responseData as IDataObject[])
					.map((json) => ({ json: json as IDataObject, pairedItem: { item: i } }));
				returnData.push(...executionData);

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}