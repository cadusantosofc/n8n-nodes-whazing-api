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

	// Destinatário obrigatório (number ou ticketId)
	if (!body.ticketId && !body.number) {
		throw new NodeOperationError(
			ctx.getNode(),
			'Informe o Número do WhatsApp ou o ID do Ticket como destinatário da mensagem.',
			{ itemIndex: i },
		);
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

/** Converte string de ID para number quando numérico. */
function parseOptionalId(value: string): string | number | undefined {
	if (!value?.trim()) return undefined;
	return isNaN(Number(value)) ? value : Number(value);
}

/** Parseia lista de IDs (vírgula, JSON array ou array nativo do n8n). */
function parseIdList(input: string | string[] | number[] | undefined): Array<string | number> | undefined {
	if (input === undefined) return undefined;
	if (Array.isArray(input)) return input;
	const trimmed = String(input).trim();
	if (trimmed === '') return [];
	if (trimmed.startsWith('[')) {
		try {
			const parsed = JSON.parse(trimmed);
			if (Array.isArray(parsed)) return parsed;
		} catch { /* usa fallback por vírgula */ }
	}
	return trimmed.split(',').map((t) => {
		const tr = t.trim();
		return isNaN(Number(tr)) ? tr : Number(tr);
	});
}

/** Normaliza campos de data para YYYY-MM-DD (formato esperado pela API). */
function formatDateParam(value: string): string {
	return value.includes('T') ? value.split('T')[0] : value;
}

/** Aplica lista de IDs de etiquetas (labelIds) no body do Kanban. */
function applyKanbanLabelIds(
	body: IDataObject,
	tagsInput: string | string[] | number[] | undefined,
): void {
	if (tagsInput === undefined) return;
	const labelIds = parseIdList(tagsInput);
	if (labelIds !== undefined) body.labelIds = labelIds;
}

/** Mescla campos avançados opcionais no body de PUT /kanban/card/{id}. */
function applyKanbanAdvancedFields(body: IDataObject, advanced: IDataObject): void {
	if (advanced.description) body.description = advanced.description;

	const teamId = parseOptionalId(advanced.teamId as string);
	if (teamId !== undefined) body.teamId = teamId;

	const contactId = parseOptionalId(advanced.contactId as string);
	if (contactId !== undefined) body.contactId = contactId;

	const ticketId = parseOptionalId(advanced.ticketId as string);
	if (ticketId !== undefined) body.ticketId = ticketId;

	if (advanced.dealValue) body.dealValue = advanced.dealValue;
	if (advanced.startDate) body.startDate = formatDateParam(String(advanced.startDate));
	if (advanced.estimatedHours !== undefined && advanced.estimatedHours !== '') {
		body.estimatedHours = Number(advanced.estimatedHours);
	}
	if (advanced.loggedHours !== undefined && advanced.loggedHours !== '') {
		body.loggedHours = Number(advanced.loggedHours);
	}
	if (advanced.coverColor) body.coverColor = advanced.coverColor;
	if (advanced.coverImage !== undefined && advanced.coverImage !== '') {
		body.coverImage = advanced.coverImage;
	}

	const labelIds = parseIdList(advanced.labelIds as string);
	if (labelIds !== undefined && labelIds.length > 0) body.labelIds = labelIds;

	if (advanced.customFieldsJson && typeof advanced.customFieldsJson === 'object') {
		body.customFields = advanced.customFieldsJson;
	}
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
						// Postman: ticketId e number são mutuamente exclusivos — não enviar os dois
						const body: IDataObject = {
							body:        this.getNodeParameter('body',        i, '') as string,
							externalKey: this.getNodeParameter('externalKey', i, '') as string,
						};
						if (ticketId) {
							body.ticketId = ticketId;
						} else if (number) {
							body.number = number;
						} else {
							throw new NodeOperationError(
								this.getNode(),
								'Informe o Número do WhatsApp ou o ID do Ticket para enviar a mensagem.',
								{ itemIndex: i },
							);
						}
						responseData = await whazingApiRequest.call(this, 'POST', '', body);

					} else if (operation === 'sendFile') {
						const sendMethod = this.getNodeParameter('sendMethod', i, 'url') as string;
						const externalKey = this.getNodeParameter('externalKey', i, '') as string;
						const commonBody: IDataObject = {
							body:        this.getNodeParameter('body', i, '') as string,
							externalKey: externalKey?.trim() ? externalKey : `n8n-${Date.now()}`,
						};
						if (ticketId) {
							commonBody.ticketId = ticketId;
						} else if (number) {
							commonBody.number = number;
						} else {
							throw new NodeOperationError(
								this.getNode(),
								'Informe o Número do WhatsApp ou o ID do Ticket para enviar o arquivo.',
								{ itemIndex: i },
							);
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
						const contactPhone = formatPhoneNumber(
							this.getNodeParameter('contactTelephone', i, '') as string,
						);
						const contactBody: IDataObject = {
							contents: {
								type:        'contact',
								displayName: this.getNodeParameter('contactDisplayName', i, '') as string,
								telephone:   contactPhone,
							},
						};
						if (ticketId) {
							contactBody.ticketId = ticketId;
						} else if (number) {
							contactBody.number = number;
						} else {
							throw new NodeOperationError(
								this.getNode(),
								'Informe o Número do WhatsApp ou o ID do Ticket para enviar o contato.',
								{ itemIndex: i },
							);
						}
						responseData = await whazingApiRequest.call(this, 'POST', '/sendcontact', contactBody);

					} else if (operation === 'sendButton') {
						// Postman: ticketId e number são mutuamente exclusivos
						const btnContents: IDataObject = {
							type:   'button',
							body:   { text: this.getNodeParameter('body', i, '') as string },
							action: { buttons: getButtons() },
						};
						const footer = this.getNodeParameter('footer', i, '') as string;
						if (footer) btnContents.footer = { text: footer };
						const headerText = this.getNodeParameter('headerText', i, '') as string;
						if (headerText) btnContents.header = { type: 'text', text: headerText };

						const body: IDataObject = { contents: btnContents };
						if (ticketId) {
							body.ticketId = ticketId;
						} else if (number) {
							body.number = number;
						} else {
							throw new NodeOperationError(
								this.getNode(),
								'Informe o Número do WhatsApp ou o ID do Ticket para enviar o botão.',
								{ itemIndex: i },
							);
						}
						responseData = await whazingApiRequest.call(this, 'POST', '/apioficial', body);

					} else if (operation === 'sendSticker') {
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i, 'data') as string;
						const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
						// Postman: ticketId e number são mutuamente exclusivos também no form-data
						const formData: IDataObject = {
							body:        'sticker',
							sticker:     'true',
							externalKey: this.getNodeParameter('externalKey', i, '') as string,
							media: {
								value: await this.helpers.getBinaryDataBuffer(i, binaryPropertyName),
								options: { filename: binaryData.fileName, contentType: binaryData.mimeType },
							},
						};
						if (ticketId) {
							formData.ticketId = ticketId;
						} else if (number) {
							formData.number = number;
						} else {
							throw new NodeOperationError(
								this.getNode(),
								'Informe o Número do WhatsApp ou o ID do Ticket para enviar o sticker.',
								{ itemIndex: i },
							);
						}
						responseData = await whazingApiRequest.call(this, 'POST', '', {}, {}, undefined, {}, undefined, formData);

					} else if (operation === 'sendLocation') {
						// Postman: ticketId e number são mutuamente exclusivos
						const locationBody: IDataObject = {
							contents: {
								type:      'location',
								latitude:  Number(this.getNodeParameter('latitude',     i, 0)),
								longitude: Number(this.getNodeParameter('longitude',    i, 0)),
								name:      this.getNodeParameter('locationName', i, '') as string,
								address:   this.getNodeParameter('address',      i, '') as string,
							},
						};
						if (ticketId) {
							locationBody.ticketId = ticketId;
						} else if (number) {
							locationBody.number = number;
						}
						responseData = await whazingApiRequest.call(this, 'POST', '/location', locationBody);

					} else if (operation === 'sendParams' || operation === 'sendParamsGroup') {
						const credentials = await this.getCredentials('whazingApi');
						// Postman: ticketId e number são mutuamente exclusivos nos query params
						const qs: IDataObject = {
							body:        this.getNodeParameter('body',        i, '') as string,
							externalKey: this.getNodeParameter('externalKey', i, '') as string,
							bearertoken: credentials.apiToken || '',
						};
						if (ticketId) {
							qs.ticketId = ticketId;
						} else if (number) {
							qs.number = number;
						} else {
							throw new NodeOperationError(
								this.getNode(),
								'Informe o Número do WhatsApp ou o ID do Ticket para enviar via parâmetros.',
								{ itemIndex: i },
							);
						}
						responseData = await whazingApiRequest.call(this, 'GET', '/params', {}, qs);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operação "${operation}" não reconhecida para o recurso "${resource}".`,
							{ itemIndex: i },
						);
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
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						if (!contactIdInput && !number) {
							throw new NodeOperationError(this.getNode(), 'Informe o ID do Contato ou o Número do WhatsApp para consultar o contato.', { itemIndex: i });
						}
						const body: IDataObject = {};
						if (contactIdInput) body.contactId = contactIdInput;
						else               body.number    = number;
						responseData = await whazingApiRequest.call(this, 'POST', '/contact', body);

					} else if (operation === 'getLastTicket') {
						// Código de compatibilidade — operação removida da UI mas mantida por segurança
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

					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operação "${operation}" não reconhecida para o recurso "${resource}".`,
							{ itemIndex: i },
						);
					}

				// ===========================================================
				// RECURSO: Tickets
				// ===========================================================
				} else if (resource === 'ticket') {
					// Operações que consultam por número exigem que ele seja informado
					const numberRequiredOps = ['create', 'showTicket', 'showTicketChatBot', 'getAll'];
					if (numberRequiredOps.includes(operation) && !number) {
						throw new NodeOperationError(this.getNode(), 'O número do WhatsApp é obrigatório para esta operação. Preencha o campo "Número Do WhatsApp".', { itemIndex: i });
					}
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
						const enableChatbot = this.getNodeParameter('enableChatbot', i, true) as boolean;
						const body: IDataObject = { ticketId: Number(ticketIdInput) };
						if (enableChatbot) {
							const chatbotId = this.getNodeParameter('chatbotId', i, '') as string;
							if (!chatbotId?.trim()) {
								throw new NodeOperationError(
									this.getNode(),
									'Informe o ID do ChatBot para ativar o chatbot neste ticket.',
									{ itemIndex: i },
								);
							}
							body.chatbotId = Number(chatbotId);
						} else {
							body.chatbotId = null;
						}
						responseData = await whazingApiRequest.call(this, 'POST', '/updatechatbot', body);

					} else if (operation === 'updateChatbot') {
						const ticketIdInput = this.getNodeParameter('ticketId', i, '') as string;
						responseData = await whazingApiRequest.call(this, 'POST', '/updatechatbot', {
							ticketId:  Number(ticketIdInput),
							chatbotId: Number(this.getNodeParameter('chatbotId', i, '')),
						});

					} else if (operation === 'listMessages' || operation === 'get') {
						const ticketIdInput = this.getNodeParameter('ticketId', i, '') as string;
						responseData = await whazingApiRequest.call(this, 'GET', `/ticket/${ticketIdInput}`);

					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operação "${operation}" não reconhecida para o recurso "${resource}".`,
							{ itemIndex: i },
						);
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

					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operação "${operation}" não reconhecida para o recurso "${resource}".`,
							{ itemIndex: i },
						);
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
						const ticketIdInput = this.getNodeParameter('ticketId', i, '') as string;

						if (!contactIdVal && !ticketIdInput) {
							throw new NodeOperationError(
								this.getNode(),
								'Informe o ID do Contato ou o ID do Ticket para criar/mover o card.',
								{ itemIndex: i },
							);
						}

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
						const tagsInput = this.getNodeParameter('tags', i, '') as string | string[] | number[];

						if (title)    body.title    = title;
						if (priority && priority !== 'none') body.priority = priority;
						if (note)     body.note     = note;
						if (ticketIdInput) body.ticketId = isNaN(Number(ticketIdInput)) ? ticketIdInput : Number(ticketIdInput);
						applyKanbanLabelIds(body, tagsInput);

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
						const advanced  = this.getNodeParameter('kanbanAdvancedUpdate', i, {}) as IDataObject;

						if (title)    body.title    = title;
						if (priority && priority !== 'none') body.priority = priority;
						if (columnId) body.columnId = isNaN(Number(columnId)) ? columnId : Number(columnId);
						if (note)     body.note     = note;
						if (assignee) body.assigneeId = isNaN(Number(assignee)) ? assignee : Number(assignee);
						if (dueDate)  body.dueDate  = formatDateParam(dueDate);
						applyKanbanLabelIds(body, tagsInput);
						applyKanbanAdvancedFields(body, advanced);

						if (Object.keys(body).length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'Informe ao menos um campo para atualizar o card.',
								{ itemIndex: i },
							);
						}

						responseData = await kanbanApiRequest(this, 'PUT', `/kanban/card/${cardId}`, body);

					} else if (operation === 'getChecklists') {
						const cardId = this.getNodeParameter('cardId', i, '') as string;
						responseData = await kanbanApiRequest(this, 'GET', `/kanban/cards/${cardId}/checklists`);

					} else if (operation === 'createChecklistItem') {
						const cardId = this.getNodeParameter('cardId', i, '') as string;
						const text   = this.getNodeParameter('checklistText', i, '') as string;
						if (!text?.trim()) {
							throw new NodeOperationError(this.getNode(), 'O texto do item de checklist é obrigatório.', { itemIndex: i });
						}
						const body: IDataObject = { text };
						const assigneeId = this.getNodeParameter('checklistAssigneeId', i, '') as string;
						const dueDate    = this.getNodeParameter('checklistDueDate',    i, '') as string;
						const parsedAssignee = parseOptionalId(assigneeId);
						if (parsedAssignee !== undefined) body.assigneeId = parsedAssignee;
						if (dueDate) body.dueDate = formatDateParam(dueDate);
						responseData = await kanbanApiRequest(this, 'POST', `/kanban/cards/${cardId}/checklists`, body);

					} else if (operation === 'updateChecklistItem') {
						const itemId = this.getNodeParameter('checklistItemId', i, '') as string;
						const body: IDataObject = {};
						const text = this.getNodeParameter('checklistText', i, '') as string;
						if (text?.trim()) body.text = text;

						const doneAction = this.getNodeParameter('checklistDoneAction', i, 'noChange') as string;
						if (doneAction === 'done') body.done = true;
						else if (doneAction === 'pending') body.done = false;

						const assigneeId = this.getNodeParameter('checklistAssigneeId', i, '') as string;
						const dueDate    = this.getNodeParameter('checklistDueDate',    i, '') as string;
						if (assigneeId !== '') {
							body.assigneeId = assigneeId.trim() ? parseOptionalId(assigneeId) : null;
						}
						if (dueDate) body.dueDate = formatDateParam(dueDate);

						if (Object.keys(body).length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'Informe ao menos um campo para atualizar o item de checklist.',
								{ itemIndex: i },
							);
						}

						responseData = await kanbanApiRequest(this, 'PUT', `/kanban/checklists/${itemId}`, body);

					} else if (operation === 'deleteChecklistItem') {
						const itemId = this.getNodeParameter('checklistItemId', i, '') as string;
						responseData = await kanbanApiRequest(this, 'DELETE', `/kanban/checklists/${itemId}`);

					} else if (operation === 'reorderChecklist') {
						const cardId = this.getNodeParameter('cardId', i, '') as string;
						const itemIdsInput = this.getNodeParameter('checklistItemIds', i, '') as string;
						const itemIds = parseIdList(itemIdsInput);
						if (!itemIds || itemIds.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'Informe os IDs dos itens na ordem desejada (ex: 14,12,10).',
								{ itemIndex: i },
							);
						}
						responseData = await kanbanApiRequest(
							this,
							'POST',
							`/kanban/cards/${cardId}/checklists/reorder`,
							{ itemIds },
						);

					} else if (operation === 'deleteCard') {
						const cardId    = this.getNodeParameter('cardId', i, '') as string;
						const permanent = this.getNodeParameter('permanentDelete', i, false) as boolean;
						const qs: IDataObject = {};
						if (permanent) qs.permanent = 'true';

						responseData = await kanbanApiRequest(this, 'DELETE', `/kanban/card/${cardId}`, {}, qs);

					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Operação "${operation}" não reconhecida para o recurso "${resource}".`,
							{ itemIndex: i },
						);
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
						const body: IDataObject = {
							tenantId,
							tenantName: this.getNodeParameter('tenantName',   i, '') as string,
							email:      this.getNodeParameter('adminEmail',   i, '') as string,
							phone:      this.getNodeParameter('adminPhone',   i, '') as string,
							plano:      this.getNodeParameter('planId',       i, '1') as string,
							recurrence: this.getNodeParameter('recurrence',   i, 'MENSAL') as string,
							status:     this.getNodeParameter('tenantStatus', i, 'active') as string,
							trial:      this.getNodeParameter('tenantTrial',  i, false) as boolean,
						};
						const dueDateVal = this.getNodeParameter('dueDate', i, '') as string;
						if (dueDateVal) body.dueDate = dueDateVal.includes('T') ? dueDateVal : formatDateParam(dueDateVal);
						responseData = await adminApiRequest.call(this, 'POST', '/updatetenant', body);

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
							dueDate: formatDateParam(this.getNodeParameter('invoiceDueDate', i, '') as string),
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
						if (dueDate) body.dueDate = formatDateParam(dueDate);
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
				} else if (resource === 'nfse') {

					// ===========================================================
					// RECURSO: NFS-e (Nota Fiscal de Serviço Eletrônica)
					// Todos os endpoints NFS-e são sob a API Admin.
					// ===========================================================

					if (operation === 'getFiscalData') {
						const tenantId = this.getNodeParameter('tenantId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'GET', `/nfse/fiscal/${tenantId}`);

					} else if (operation === 'updateFiscalData') {
						const tenantId  = this.getNodeParameter('tenantId',   i, '') as string;
						const fiscalData = this.getNodeParameter('fiscalData', i, {}) as IDataObject;
						const body: IDataObject = {};
						if (fiscalData.tenantFiscalName)              body.tenantFiscalName       = fiscalData.tenantFiscalName;
						if (fiscalData.cpfCnpj)                       body.cpfCnpj                = fiscalData.cpfCnpj;
						if (fiscalData.fiscalEmail)                   body.fiscalEmail             = fiscalData.fiscalEmail;
						if (fiscalData.fiscalMobilePhone)             body.fiscalMobilePhone       = fiscalData.fiscalMobilePhone;
						if (fiscalData.address)                       body.address                 = fiscalData.address;
						if (fiscalData.addressNumber)                 body.addressNumber            = fiscalData.addressNumber;
						if (fiscalData.complement)                    body.complement              = fiscalData.complement;
						if (fiscalData.province)                      body.province                = fiscalData.province;
						if (fiscalData.city)                          body.city                    = fiscalData.city;
						if (fiscalData.state)                         body.state                   = fiscalData.state;
						if (fiscalData.postalCode)                    body.postalCode              = fiscalData.postalCode;
						if (fiscalData.invoiceEmissionEnabled !== undefined) body.invoiceEmissionEnabled = fiscalData.invoiceEmissionEnabled;
						responseData = await adminApiRequest.call(this, 'PUT', `/nfse/fiscal/${tenantId}`, body);

					} else if (operation === 'listNfse') {
						const filters = this.getNodeParameter('nfseFilters', i, {}) as IDataObject;
						const qs: IDataObject = {};
						if (filters.tenantId)   qs.tenantId   = filters.tenantId;
						if (filters.status)     qs.status     = filters.status;
						if (filters.invoiceId)  qs.invoiceId  = filters.invoiceId;
						if (filters.startDate)  qs.startDate  = formatDateParam(filters.startDate as string);
						if (filters.endDate)    qs.endDate    = formatDateParam(filters.endDate as string);
						if (filters.pageNumber) qs.pageNumber = filters.pageNumber;
						if (filters.pageSize)   qs.pageSize   = filters.pageSize;
						responseData = await adminApiRequest.call(this, 'GET', '/nfse', {}, qs);

					} else if (operation === 'getNfse') {
						const nfseId = this.getNodeParameter('nfseId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'GET', `/nfse/${nfseId}`);

					} else if (operation === 'getNfseByInvoice') {
						const invoiceId = this.getNodeParameter('invoiceId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'GET', `/nfse/invoices/${invoiceId}`);

					} else if (operation === 'scheduleNfse') {
						const invoiceId     = this.getNodeParameter('invoiceId',        i, '') as string;
						const effectiveDate = this.getNodeParameter('nfseEffectiveDate', i, '') as string;
						const body: IDataObject = {};
						if (effectiveDate) body.effectiveDate = formatDateParam(effectiveDate as string);
						responseData = await adminApiRequest.call(this, 'POST', `/nfse/invoices/${invoiceId}/schedule`, body);

					} else if (operation === 'authorizeNfse') {
						const nfseId = this.getNodeParameter('nfseId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'POST', `/nfse/${nfseId}/authorize`);

					} else if (operation === 'cancelNfse') {
						const nfseId = this.getNodeParameter('nfseId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'POST', `/nfse/${nfseId}/cancel`);

					} else if (operation === 'syncNfse') {
						const nfseId = this.getNodeParameter('nfseId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'POST', `/nfse/${nfseId}/sync`);

					} else if (operation === 'downloadNfsePdf') {
						const nfseId = this.getNodeParameter('nfseId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'GET', `/nfse/${nfseId}/download/pdf`);

					} else if (operation === 'downloadNfseXml') {
						const nfseId = this.getNodeParameter('nfseId', i, '') as string;
						responseData = await adminApiRequest.call(this, 'GET', `/nfse/${nfseId}/download/xml`);

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
				let finalError = error as Error;

				// Credencial ausente ou excluída → instrução clara ao usuário
				if (finalError.message?.includes('does not exist for type') &&
						finalError.message?.includes('whazingApi')) {
					finalError = Object.assign(
						new Error(
							'Credencial Whazing não encontrada ou excluída. ' +
							'Abra as configurações deste node, clique em "Credential to connect with" ' +
							'e selecione ou crie uma credencial válida do tipo "Whazing API".',
						),
						{ cause: error },
					);
				}

				if (this.continueOnFail()) {
					returnData.push({ json: { error: finalError.message }, pairedItem: i });
					continue;
				}
				throw new NodeOperationError(this.getNode(), finalError, { itemIndex: i });
			}
		}

		return [returnData];
	}
}