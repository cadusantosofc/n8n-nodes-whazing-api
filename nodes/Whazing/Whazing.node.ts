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
import {
	adminApiRequest,
	formatPhoneNumber,
	whazingApiRequest,
} from './GenericFunctions';

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
		sendButtonOfficial:          'button',
		sendButtonImageOfficial:     'button',
		sendButtonPlus:              'button',
		sendList:                    'list',
		sendListPlus:                'list',
		sendLinkCta:                 'cta_url',
		sendLinkCtaPlus:             'cta_url',
		sendLinkImageOfficial:       'cta_url',
		sendLinkPlus:                'cta_url',
		requestLocation:             'location_request_message',
		requestLocationPlus:         'location_request_message',
		sendButtonDynamicPlus:       'dinamic_button',
		sendButtonDynamicImagePlus:  'dinamic_button',
		sendCarouselPlus:            'carousel_button',
		sendPixButtonPlus:           'pixbutton',
		sendRequestPaymentPlus:      'requestpayment',
		sendCarouselOfficial:        'carousel_button',
		sendTemplate:                'template',
		sendTemplateParams:          'template',
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
	// Operações que usam mídia no header (não têm campo headerText no UI)
	const mediaHeaderOps = [
		'sendButtonImageOfficial', 'sendButtonDynamicImagePlus',
		'sendLinkImageOfficial', 'sendLinkPlus', 'sendLinkCtaPlus', 'sendLinkCta', 'sendButtonPlus',
	];
	if (interactiveTypes.includes(contentType as string)) {
		contents.body = { text: ctx.getNodeParameter('body', i, '') as string };
		if (!mediaHeaderOps.includes(operation)) {
			const headerText = ctx.getNodeParameter('headerText', i, '') as string;
			if (headerText) contents.header = { type: 'text', text: headerText };
		}
		const footerText = ctx.getNodeParameter('footer', i, '') as string;
		if (footerText) contents.footer = { text: footerText };
	}

	// Header multimídia para button/cta_url (API Oficial e PLUS com header estruturado)
	const headerStructuredOps = [
		'sendButtonOfficial', 'sendButtonImageOfficial', 'sendButtonPlus', 'sendLinkImageOfficial',
		'sendLinkPlus', 'sendLinkCtaPlus', 'sendLinkCta',
	];
	if (headerStructuredOps.includes(operation)) {
		const mediaType = ctx.getNodeParameter('headerMediaType', i, 'image') as string;
		const mediaUrl  = ctx.getNodeParameter('headerMediaUrl',  i, '') as string;
		if (mediaUrl) {
			if (mediaType === 'video')         contents.header = { type: 'video',    video:    { link: mediaUrl } };
			else if (mediaType === 'document') contents.header = { type: 'document', document: { link: mediaUrl } };
			else                               contents.header = { type: 'image',    image:    { link: mediaUrl } };
		}
	}

	// Ação específica por operação
	if (operation === 'sendList' || operation === 'sendListPlus') {
		contents.action = {
			button:   ctx.getNodeParameter('buttonText', i, 'Ver opções') as string,
			sections: opts.getSections(),
		};

	} else if (operation === 'sendButtonOfficial' || operation === 'sendButtonPlus' || operation === 'sendButtonImageOfficial') {
		contents.action = { buttons: opts.getButtons() };

	} else if (operation === 'sendLinkPlus') {
		const url = ctx.getNodeParameter('url', i, '') as string;
		if (!url?.trim()) throw new NodeOperationError(ctx.getNode(), 'A URL é obrigatória para enviar links via API Plus.', { itemIndex: i });
		contents.action = {
			name: 'cta_url',
			parameters: { display_text: ctx.getNodeParameter('buttonText', i, 'Ver Link') as string, url },
		};

	} else if (operation === 'sendLinkCta' || operation === 'sendLinkCtaPlus' || operation === 'sendLinkImageOfficial') {
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

	} else if (operation === 'sendButtonDynamicPlus' || operation === 'sendButtonDynamicImagePlus') {
		contents.text = ctx.getNodeParameter('body', i, '') as string;
		const dFooter = ctx.getNodeParameter('footer', i, '') as string;
		if (dFooter) contents.footerText = dFooter;
		contents.choices = opts.getDynamicButtons();

		// dinamic_button: imagem vai em contents.imageUrl (não em header)
		if (operation === 'sendButtonDynamicImagePlus') {
			const mediaUrl = ctx.getNodeParameter('headerMediaUrl', i, '') as string;
			if (mediaUrl) contents.imageUrl = mediaUrl;
		}

	} else if (operation === 'sendCarouselPlus' || operation === 'sendCarouselOfficial') {
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

	// Limpa footer vazio e header texto vazio
	if (contents.footer && !(contents.footer as IDataObject).text) delete contents.footer;
	if (contents.header) {
		const header = contents.header as IDataObject;
		if (header.type === 'text' && !header.text) delete contents.header;
	}

	return whazingApiRequest.call(ctx, 'POST', path, body);
}

/**
 * Detecta erro 404 de forma robusta.
 * O n8n encapsula erros HTTP num NodeOperationError antes de chegar aqui,
 * então error.statusCode e error.response ficam undefined.
 * Por isso checamos também o texto da mensagem.
 */
function isNotFound(error: any): boolean {
	const status =
		error?.response?.status    ||
		error?.response?.statusCode ||
		error?.statusCode           ||
		error?.cause?.response?.status ||
		error?.cause?.statusCode    ||
		error?.httpCode;
	if (Number(status) === 404) return true;

	const msg = String(error?.message || '').toLowerCase();
	return (
		msg.includes('404')                      ||
		msg.includes('not found')                ||
		msg.includes('could not be found')       ||
		msg.includes('resource you are requesting')
	);
}

/**
 * Executa chamadas para os endpoints do Kanban Pro (/kanbanpro/*).
 *
 * Mapeamento de endpoints confirmado pelo Postman (API_WHAZING_NOVA):
 *   GET    /kanbanpro/boards
 *   GET    /kanbanpro/boards/{id}/columns
 *   GET    /kanbanpro/boards/{id}/cards        ?columnId=&priority=&search=&includeArchived=
 *   GET    /kanbanpro/cards/{id}               (plural: cards)
 *   GET    /kanbanpro/contact/{id}/cards
 *   POST   /kanbanpro/card                     (singular: card) — action: create_or_move | create_or_update | create_only
 *   PUT    /kanbanpro/card/{id}
 *   DELETE /kanbanpro/card/{id}                ?permanent=true
 *
 * O node internamente usa /kanban/* (prefixo legado) e esta função
 * converte automaticamente para /kanbanpro/* antes de chamar a API.
 * Se /kanbanpro retornar 404, faz fallback para /kanban (instalações legadas).
 */
async function kanbanApiRequest(
	ctx: IExecuteFunctions,
	method: string,
	path: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	// Converte /kanban/* → /kanbanpro/* (mantém /kanbanpro/* intacto se já vier assim)
	const pathKanbanPro = (path.startsWith('/kanban') && !path.startsWith('/kanbanpro'))
		? path.replace(/^\/kanban/, '/kanbanpro')
		: path;
	const pathKanbanLegacy = pathKanbanPro.replace(/^\/kanbanpro/, '/kanban');

	// 1ª tentativa: /kanbanpro (endpoint atual, confirmado em produção)
	let notFoundError: any;
	try {
		return await whazingApiRequest.call(ctx, method, pathKanbanPro, body, qs);
	} catch (err: any) {
		if (!isNotFound(err)) throw err;
		notFoundError = err;
	}

	// 2ª tentativa: /kanban (fallback para instalações legadas)
	try {
		return await whazingApiRequest.call(ctx, method, pathKanbanLegacy, body, qs);
	} catch (err: any) {
		// Se o fallback também falhou com 404, relança o erro do /kanbanpro (mais informativo)
		if (isNotFound(err)) throw notFoundError;
		throw err;
	}
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

				let number = this.getNodeParameter('number', i, '') as string;
				number = formatPhoneNumber(number);

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
							const externalKey = this.getNodeParameter('externalKey', i, '') as string;
							const commonBody: IDataObject = {
							body: this.getNodeParameter('body', i, '') as string,
							externalKey: externalKey?.trim() ? externalKey : `n8n-${Date.now()}`,
							};
							if (ticketId) {
								commonBody.ticketId = ticketId;
							} else if (number) {
								commonBody.number = number;
							}

							if (sendMethod === 'url') {
								commonBody.mediaUrl = this.getNodeParameter('mediaUrl', i, '') as string;
								if (!commonBody.mediaUrl?.trim()) {
									throw new NodeOperationError(this.getNode(), 'A URL do arquivo é obrigatória.', { itemIndex: i });
								}
								responseData = await whazingApiRequest.call(this, 'POST', '', commonBody);
							} else if (sendMethod === 'base64') {
								const mediaBase64 = this.getNodeParameter('mediaBase64', i, '') as string;
								const fileName = this.getNodeParameter('fileName', i, '') as string;
								if (!mediaBase64?.trim() || !fileName?.trim()) {
									throw new NodeOperationError(this.getNode(), 'Base64 e Nome do Arquivo são obrigatórios.', { itemIndex: i });
								}
								commonBody.mediaMessage = {
									mediaType: this.getNodeParameter('mediaType', i, 'image') as string,
									fileName,
									media: mediaBase64,
								};
								responseData = await whazingApiRequest.call(this, 'POST', '', commonBody);
							} else {
								const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i, 'data') as string;
								const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
								const formData: IDataObject = {
									...commonBody,
									media: {
										value: await this.helpers.getBinaryDataBuffer(i, binaryPropertyName),
										options: {
											filename: binaryData.fileName || 'arquivo.pdf',
											contentType: binaryData.mimeType || 'application/octet-stream',
										},
									},
								};
								responseData = await whazingApiRequest.call(
									this,
									'POST',
									'',
									{},
									{},
									undefined,
									undefined,
									undefined,
									formData,
								);
							}

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
							if (headerText) (body.contents as IDataObject).header = { type: 'text', text: headerText };

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
						getDynamicButtons, getCarouselItems,
					});

				} else if (resource === 'msgPlus') {
					const plusPathMap: Record<string, string> = {
						sendRequestPaymentPlus: '/requestpayment',
						sendPixButtonPlus:      '/pixbutton',
					};
					const path = plusPathMap[operation] ?? '/apiplus';
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
							disableBot:      this.getNodeParameter('disableBot',      i, false) as boolean,
							disableCampaign: this.getNodeParameter('disableCampaign', i, false) as boolean,
							disableKanban:   this.getNodeParameter('disableKanban',   i, false) as boolean,
							ignore:          this.getNodeParameter('ignore',          i, false) as boolean,
							extraInfo,
							wallets: [],
						};
						// Only include optional string fields when non-empty — the API returns 500 for empty strings on these fields
						const email       = this.getNodeParameter('email',       i, '') as string;
						const commentary  = this.getNodeParameter('commentary',  i, '') as string;
						const deadline    = this.getNodeParameter('deadline',    i, '') as string;
						const kanbanPrice = this.getNodeParameter('kanbanPrice', i, '') as string;
						if (email)       body.email       = email;
						if (commentary)  body.commentary  = commentary;
						if (deadline)    body.deadline    = deadline;
						if (kanbanPrice) body.kanbanPrice = kanbanPrice;
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						if (contactIdInput) body.contactId = contactIdInput;
						if (ticketId)       body.ticketId  = ticketId;
						if (number)         body.number    = number;
						responseData = await whazingApiRequest.call(this, 'POST', operation === 'create' ? '/createcontact' : '/updatecontact', body);

					} else if (operation === 'get') {
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						const body: IDataObject = {};
						if (contactIdInput) body.contactId = contactIdInput;
						else               body.number    = number;
						responseData = await whazingApiRequest.call(this, 'POST', '/contact', body);

					} else if (operation === 'getLastTicket') {
						const numInt = isNaN(Number(number)) ? number : Number(number);
						responseData = await whazingApiRequest.call(this, 'POST', '/showticket', { number: numInt });

					} else if (operation === 'validateNumber') {
						responseData = await whazingApiRequest.call(this, 'POST', '/valid-whatsapp-number', { number });

					} else if (operation === 'setCrm' || operation === 'setFollowup' || operation === 'setTags') {
						const body: IDataObject = {};
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						if (contactIdInput) body.contactId = isNaN(Number(contactIdInput)) ? contactIdInput : Number(contactIdInput);
						else if (ticketId)  body.ticketId  = isNaN(Number(ticketId)) ? ticketId : Number(ticketId);
						else                body.number    = number;

						const val = this.getNodeParameter('valueId', i, '');
						if (operation === 'setCrm')      body.crm      = Number(val);
						else if (operation === 'setFollowup') body.followup = Number(val);
						else {
							if (Array.isArray(val)) {
								body.tags = val.map((t) => (isNaN(Number(t)) ? t : Number(t)));
							} else if (typeof val === 'string') {
								const trimmed = val.trim();
								if (trimmed === '') {
									body.tags = [];
								} else {
									body.tags = trimmed.split(',').map((t) => {
										const tr = t.trim();
										return isNaN(Number(tr)) ? tr : Number(tr);
									});
								}
							} else if (val !== undefined && val !== null) {
								body.tags = isNaN(Number(val)) ? val : Number(val);
							}
						}

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
						responseData = await kanbanApiRequest(this, 'GET', '/kanban/boards');

					} else if (operation === 'getColumns') {
						const boardId = this.getNodeParameter('boardId', i, '') as string;
						responseData = await kanbanApiRequest(this, 'GET', `/kanban/boards/${boardId}/columns`);

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

						responseData = await kanbanApiRequest(this, 'GET', `/kanban/boards/${boardId}/cards`, {}, qs);

					} else if (operation === 'getCard') {
						const cardId = this.getNodeParameter('cardId', i, '') as string;
						responseData = await kanbanApiRequest(this, 'GET', `/kanban/cards/${cardId}`);

					} else if (operation === 'getContactCards') {
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						const qs: IDataObject = {};
						const filters = this.getNodeParameter('kanbanFilters', i, {}) as IDataObject;
						if (filters.includeArchived) qs.includeArchived = 'true';

						responseData = await kanbanApiRequest(this, 'GET', `/kanban/contact/${contactIdInput}/cards`, {}, qs);

					} else if (operation === 'createOrMoveCard') {
						const boardIdVal = this.getNodeParameter('boardId', i, '');
						const columnIdVal = this.getNodeParameter('columnId', i, '');
						const contactIdVal = this.getNodeParameter('contactId', i, '');

						const body: IDataObject = {
							boardId:   isNaN(Number(boardIdVal)) ? boardIdVal : Number(boardIdVal),
							columnId:  isNaN(Number(columnIdVal)) ? columnIdVal : Number(columnIdVal),
							action:    this.getNodeParameter('kanbanAction', i, 'create_or_move'),
						};

						if (contactIdVal) {
							body.contactId = isNaN(Number(contactIdVal)) ? contactIdVal : Number(contactIdVal);
						}

						const title    = this.getNodeParameter('cardTitle',      i, '') as string;
						const priority = this.getNodeParameter('kanbanPriority', i, 'none') as string;
						const note     = this.getNodeParameter('kanbanNote',     i, '') as string;
						const ticketIdInput = this.getNodeParameter('ticketId', i, '') as string;
						const tagsInput = this.getNodeParameter('tags', i, '') as string | string[] | number[];

						if (title)    body.title    = title;
						if (priority && priority !== 'none') body.priority = priority;
						if (note)     body.note     = note;
						if (ticketIdInput) body.ticketId = isNaN(Number(ticketIdInput)) ? ticketIdInput : Number(ticketIdInput);
						if (tagsInput !== undefined) {
							if (Array.isArray(tagsInput)) {
								body.tags = tagsInput;
							} else if (typeof tagsInput === 'string') {
								const trimmed = tagsInput.trim();
								if (trimmed === '') {
									body.tags = [];
								} else {
									body.tags = trimmed.split(',').map(t => {
										const tr = t.trim();
										return isNaN(Number(tr)) ? tr : Number(tr);
									});
								}
							}
						}

						responseData = await kanbanApiRequest(this, 'POST', '/kanban/card', body);

					} else if (operation === 'updateCard') {
						const cardId = this.getNodeParameter('cardId', i, '') as string;
						const body: IDataObject = {};

						const title    = this.getNodeParameter('cardTitle',      i, '') as string;
						const priority = this.getNodeParameter('kanbanPriority', i, 'none') as string;
						const columnId = this.getNodeParameter('columnId',       i, '') as string;
						const note     = this.getNodeParameter('kanbanNote',     i, '') as string;
						const assignee = this.getNodeParameter('assigneeId',     i, '') as string;
						const dueDate  = this.getNodeParameter('kanbanDueDate',  i, '') as string;
						const tagsInput = this.getNodeParameter('tags', i, '') as string | string[] | number[];

						if (title)    body.title    = title;
						if (priority && priority !== 'none') body.priority = priority;
						if (columnId) body.columnId = isNaN(Number(columnId)) ? columnId : Number(columnId);
						if (note)     body.note     = note;
						if (assignee) body.assigneeId = isNaN(Number(assignee)) ? assignee : Number(assignee);
						if (dueDate)  body.dueDate  = dueDate;
						if (tagsInput !== undefined) {
							if (Array.isArray(tagsInput)) {
								body.tags = tagsInput;
							} else if (typeof tagsInput === 'string') {
								const trimmed = tagsInput.trim();
								if (trimmed === '') {
									body.tags = [];
								} else {
									body.tags = trimmed.split(',').map(t => {
										const tr = t.trim();
										return isNaN(Number(tr)) ? tr : Number(tr);
									});
								}
							}
						}

						responseData = await kanbanApiRequest(this, 'PUT', `/kanban/card/${cardId}`, body);

					} else if (operation === 'deleteCard') {
						const cardId    = this.getNodeParameter('cardId', i, '') as string;
						const permanent = this.getNodeParameter('permanentDelete', i, false) as boolean;
						const qs: IDataObject = {};
						if (permanent) qs.permanent = 'true';

						responseData = await kanbanApiRequest(this, 'DELETE', `/kanban/card/${cardId}`, {}, qs);
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
						responseData = await adminApiRequest.call(this, 'GET', '', { tenantId });

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
							status:     this.getNodeParameter('tenantStatus', i, 'active') as string,
							trial:      this.getNodeParameter('tenantTrial',  i, false) as boolean,
							affiliate:  this.getNodeParameter('tenantAffiliate', i, false) as boolean,
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
							status:     this.getNodeParameter('tenantStatus', i, 'active') as string,
						});

					} else if (operation === 'addMonth') {
						const tenantId = this.getNodeParameter('tenantId', i, '') as string;
						if (tenantId === '1') throw new NodeOperationError(this.getNode(), 'O tenant ID 1 é o administrador global e não pode ser editado.', { itemIndex: i });
						responseData = await adminApiRequest.call(this, 'POST', '/addMonth', { tenantId });

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
				} else if (resource === 'invoice') {

					if (operation === 'getInvoices') {
						const tenantId = this.getNodeParameter('tenantId', i, '') as string;
						const status = this.getNodeParameter('invoiceStatusFilter', i, 'all') as string;
						const qs: IDataObject = {};
						if (status && status !== 'all') {
							qs.status = status;
						}
						responseData = await adminApiRequest.call(this, 'GET', `/invoices/${tenantId}`, {}, qs);

					} else if (operation === 'getInvoicesOpen') {
						const tenantId = this.getNodeParameter('tenantId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'GET', `/invoices/${tenantId}/open`);

					} else if (operation === 'generatePaymentPix') {
						const invoiceId = this.getNodeParameter('invoiceId', i, '') as string;
						const price = this.getNodeParameter('invoicePrice', i, 0) as number;
						const body: IDataObject = {};
						if (price > 0) {
							body.price = price;
						}
						responseData = await adminApiRequest.call(this, 'POST', `/invoices/${invoiceId}/payment`, body);

					} else if (operation === 'markPaidManual') {
						const invoiceId = this.getNodeParameter('invoiceId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'POST', `/invoices/${invoiceId}/paid`);

					} else if (operation === 'createInvoiceAvulsa') {
						const body: IDataObject = {
							tenantId: this.getNodeParameter('tenantId', i, '') as string,
							value: this.getNodeParameter('invoiceValue', i, 0) as number,
							dueDate: this.getNodeParameter('invoiceDueDate', i, '') as string,
						};
						const detail = this.getNodeParameter('invoiceDetail', i, '') as string;
						if (detail) body.detail = detail;
						const recurrence = this.getNodeParameter('invoiceRecurrence', i, '') as string;
						if (recurrence) body.recurrence = recurrence;
						responseData = await adminApiRequest.call(this, 'POST', '/invoices/create', body);

					} else if (operation === 'updateInvoice') {
						const invoiceId = this.getNodeParameter('invoiceId', i, '') as string;
						const body: IDataObject = {};
						const detail = this.getNodeParameter('invoiceDetail', i, '') as string;
						if (detail) body.detail = detail;
						const value = this.getNodeParameter('invoiceValueOptional', i, 0) as number;
						if (value > 0) body.value = value;
						const dueDate = this.getNodeParameter('invoiceDueDateOptional', i, '') as string;
						if (dueDate) body.dueDate = dueDate;
						const status = this.getNodeParameter('invoiceStatus', i, '') as string;
						if (status) body.status = status;
						responseData = await adminApiRequest.call(this, 'PUT', `/invoices/${invoiceId}`, body);

					} else if (operation === 'deleteInvoice') {
						const invoiceId = this.getNodeParameter('invoiceId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'DELETE', `/invoices/${invoiceId}`);

					} else if (operation === 'recreateInvoices') {
						const tenantId = this.getNodeParameter('tenantId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'POST', `/invoices/${tenantId}/recreate`);

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
				const err = error as any;
				const statusCode: number | undefined =
					err?.response?.status    ||
					err?.response?.statusCode ||
					err?.statusCode           ||
					err?.cause?.response?.status ||
					err?.cause?.statusCode    ||
					err?.httpCode;
				const responseBody: unknown =
					err?.response?.data   ||
					err?.response?.body   ||
					err?.cause?.response?.data ||
					err?.description;

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error:        (err as Error).message,
							statusCode:   statusCode ?? null,
							resource,
							operation,
							itemIndex:    i,
							responseData: responseBody ?? null,
						},
						pairedItem: i,
					});
					continue;
				}

				const description = [
					`Resource: ${resource}, Operation: ${operation}, Item: ${i}`,
					statusCode  ? `HTTP ${statusCode}` : null,
					responseBody ? `Response: ${JSON.stringify(responseBody)}` : null,
				].filter(Boolean).join(' | ');

				throw new NodeOperationError(this.getNode(), err as Error, { itemIndex: i, description });
			}
		}

		return [returnData];
	}
}