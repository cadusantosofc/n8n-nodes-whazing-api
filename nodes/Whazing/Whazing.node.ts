import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { whazingDescription } from './WhazingDescription';
import { whazingApiRequest, adminApiRequest } from './GenericFunctions';

export class Whazing implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Whazing',
		name: 'whazing',
		icon: 'file:whazing.svg',
		group: ['transform'],
		version: 1,
		description: 'Interaja com a API Whazing - By Carlos Eduardo @cadu.santos1',
		defaults: {
			name: 'Whazing',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'whazingApi',
				required: true,
			},
		],
		properties: whazingDescription,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		let responseData: any;

		for (let i = 0; i < items.length; i++) {
			try {
				const number = this.getNodeParameter('number', i, '') as string;
				const ticketId = this.getNodeParameter('ticketId', i, '') as string;

				// Lógica para obter botões simples
				const getButtons = () => {
					const buttonsCollection = this.getNodeParameter('buttons', i, { buttonValues: [] }) as any;
					return (buttonsCollection.buttonValues || []).map((btn: any) => ({
						type: 'reply',
						reply: { id: btn.id || btn.text, title: btn.text },
					}));
				};

				// Lógica para obter seções de lista
				const getSections = () => {
					const sectionsCollection = this.getNodeParameter('sections', i, { sectionValues: [] }) as any;
					return (sectionsCollection.sectionValues || []).map((section: any) => ({
						title: section.title,
						rows: (section.rows?.rowValues || []).map((row: any) => ({
							id: row.id,
							title: row.title,
							description: row.description,
						})),
					}));
				};

				// Lógica para botões dinâmicos (PLUS)
				const getDynamicButtons = () => {
					const dynamicButtonsCollection = this.getNodeParameter('dynamicButtons', i, { buttonValues: [] }) as any;
					return (dynamicButtonsCollection.buttonValues || []).map((btn: any) => {
						const mapped: any = {
							displayText: btn.displayText,
							id: btn.btnType === 'reply' ? btn.value : '',
							type: btn.btnType,
						};
						if (btn.btnType === 'copy') mapped.copyText = btn.value;
						if (btn.btnType === 'call') mapped.phoneNumber = btn.value;
						if (btn.btnType === 'url') mapped.url = btn.value;
						return mapped;
					});
				};

				// Lógica para carrossel (PLUS)
				const getCarouselItems = () => {
					const carouselCollection = this.getNodeParameter('carouselItems', i, { itemValues: [] }) as any;
					return (carouselCollection.itemValues || []).map((item: any) => {
						const buttons = (item.buttons?.buttonValues || []).map((btn: any) => {
							const b: any = { displayText: btn.displayText, type: btn.itemBtnType, id: btn.itemBtnType === 'reply' ? btn.value : '' };
							if (btn.itemBtnType === 'url') b.url = btn.value;
							if (btn.itemBtnType === 'call') b.phoneNumber = btn.value;
							return b;
						});
						return {
							text: item.text,
							image: item.image,
							buttons,
						};
					});
				};

				// Lógica para componentes de template (Oficial)
				const getTemplateComponents = () => {
					const componentsRaw = this.getNodeParameter('templateComponents', i, { componentValues: [] }) as any;
					return (componentsRaw.componentValues || []).map((comp: any) => {
						const component: any = {
							type: comp.componentType,
							parameters: [],
						};

						if (comp.componentType === 'button') {
							component.sub_type = comp.sub_type;
							component.index = String(comp.index);
						}

						const paramsRaw = comp.parameters || { parameterValues: [] };
						component.parameters = (paramsRaw.parameterValues || []).map((param: any) => {
							if (param.parameterType === 'text') {
								return {
									type: 'text',
									parameter_name: param.parameter_name,
									text: param.text,
								};
							} else if (param.parameterType === 'image') {
								return {
									type: 'image',
									image: {
										link: param.link,
									},
								};
							}
							return param;
						});

						return component;
					});
				};

				if (resource === 'message') {
					// API BAILEYS
					if (operation === 'sendText') {
						const body: any = { 
							number, 
							body: this.getNodeParameter('body', i) as string,
							externalKey: this.getNodeParameter('externalKey', i, '') as string,
						};
						if (ticketId) body.ticketId = ticketId;
						responseData = await whazingApiRequest.call(this, 'POST', '', body);
					} else if (operation === 'sendFile') {
						const sendMethod = this.getNodeParameter('sendMethod', i) as string;
						const body: any = { 
							number, 
							body: this.getNodeParameter('body', i) as string,
							externalKey: this.getNodeParameter('externalKey', i, '') as string,
						};
						if (ticketId) body.ticketId = ticketId;
						if (sendMethod === 'url') body.mediaUrl = this.getNodeParameter('mediaUrl', i) as string;
						else {
							body.mediaMessage = {
								mediaType: this.getNodeParameter('mediaType', i) as string,
								fileName: this.getNodeParameter('fileName', i) as string,
								media: this.getNodeParameter('mediaBase64', i) as string,
							};
						}
						responseData = await whazingApiRequest.call(this, 'POST', '', body);
					} else if (operation === 'sendLocation') {
						const body = {
							number,
							contents: {
								type: 'location',
								longitude: parseFloat(this.getNodeParameter('longitude', i) as string),
								latitude: parseFloat(this.getNodeParameter('latitude', i) as string),
								name: this.getNodeParameter('locationName', i) as string,
								address: this.getNodeParameter('address', i) as string,
							},
						};
						responseData = await whazingApiRequest.call(this, 'POST', '/location', body);
					} else if (operation === 'sendButton') {
						const body = {
							number,
							contents: {
								type: 'button',
								body: { text: this.getNodeParameter('body', i) as string },
								footer: { text: this.getNodeParameter('footer', i, '') as string },
								header: { text: this.getNodeParameter('headerText', i, '') as string },
								action: { buttons: getButtons() },
							},
						};
						responseData = await whazingApiRequest.call(this, 'POST', '/apioficial', body);
					} else if (operation === 'sendSticker') {
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
						const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
						
						const formData: any = {
							number,
							body: 'sticker',
							sticker: 'true',
							externalKey: this.getNodeParameter('externalKey', i, '') as string,
							media: {
								value: await this.helpers.getBinaryDataBuffer(i, binaryPropertyName),
								options: {
									filename: binaryData.fileName,
									contentType: binaryData.mimeType,
								},
							},
						};

						responseData = await whazingApiRequest.call(this, 'POST', '', {}, {}, undefined, undefined, formData);
					} else if (operation === 'sendParams') {
						const credentials = await this.getCredentials('whazingApi');
						const token = credentials.apiToken || '';
						
						const qs: any = {
							body: this.getNodeParameter('body', i) as string,
							number,
							externalKey: this.getNodeParameter('externalKey', i, '') as string,
							bearertoken: token,
						};
						if (ticketId) qs.ticketId = ticketId;

						responseData = await whazingApiRequest.call(this, 'GET', '/params', {}, qs);
					}
				} else if (resource === 'messageOfficial' || resource === 'messagePlus') {
					const isPlus = resource === 'messagePlus';
					const path = isPlus ? '/apiplus' : '/apioficial';

					const typeMap: any = {
						sendButtonOfficial: 'button',
						sendButtonPlus: 'button',
						sendList: 'list',
						sendListPlus: 'list',
						sendLinkCta: 'cta_url',
						sendLinkCtaPlus: 'cta_url',
						sendLinkPlus: 'cta_url',
						requestLocation: 'location_request_message',
						requestLocationPlus: 'location_request_message',
						sendButtonDynamicPlus: 'dinamic_button',
						sendCarouselPlus: 'carousel_button',
						sendPixButtonPlus: 'pixbutton',
						sendRequestPaymentPlus: 'requestpayment',
					};

					const body: any = {
						contents: {
							type: typeMap[operation],
						},
					};

					// Suporte a ticketId para canais como Instagram (detecta IDs curtos numéricos)
					if (number.length < 10 && !number.includes('@') && !isNaN(Number(number))) {
						body.ticketId = number;
					} else {
						body.number = number;
					}

					const externalKey = this.getNodeParameter('externalKey', i, '') as string;
					if (externalKey) body.externalKey = externalKey;
					if (ticketId) body.ticketId = ticketId; // Prioriza ticketId explícito se houver

					const contentType = typeMap[operation];

					// 1. Configuração de Body/Header/Footer para tipos interativos
					if (['button', 'list', 'cta_url', 'location_request_message', 'pixbutton', 'requestpayment'].includes(contentType)) {
						body.contents.body = { text: this.getNodeParameter('body', i, '') as string };
						const headerText = this.getNodeParameter('headerText', i, '') as string;
						if (headerText) body.contents.header = { type: 'text', text: headerText };
						const footerText = this.getNodeParameter('footer', i, '') as string;
						if (footerText) body.contents.footer = { text: footerText };
					}

					// 2. Configuração de Ação específica por operação
					if (operation.includes('List')) {
						body.contents.action = {
							button: this.getNodeParameter('buttonText', i, 'Ver Lista') as string,
							sections: getSections(),
						};
					} else if (operation.includes('Button') && !['sendButtonDynamicPlus', 'sendPixButtonPlus'].includes(operation)) {
						body.contents.action = { buttons: getButtons() };
					} else if (operation === 'sendLinkPlus' || operation.includes('LinkCta')) {
						const btnText = operation === 'sendLinkPlus' ? this.getNodeParameter('buttonText', i, 'Ver Link') : this.getNodeParameter('linkDisplayText', i, 'Ver Link');
						const url = operation === 'sendLinkPlus' ? this.getNodeParameter('url', i, '') : this.getNodeParameter('linkUrl', i, '');
						body.contents.action = {
							name: 'cta_url',
							parameters: { display_text: btnText, url },
						};
					} else if (contentType === 'location_request_message') {
						body.contents.action = { name: 'send_location' };
					} else if (operation === 'sendButtonDynamicPlus') {
						body.contents.text = this.getNodeParameter('body', i) as string;
						const dFooter = this.getNodeParameter('footer', i, '') as string;
						if (dFooter) body.contents.footerText = dFooter;
						body.contents.choices = getDynamicButtons();
					} else if (operation === 'sendCarouselPlus') {
						body.contents.text = this.getNodeParameter('body', i) as string;
						body.contents.items = getCarouselItems();
					} else if (operation === 'sendPixButtonPlus') {
						body.contents.pixKey = this.getNodeParameter('pixKey', i, '') as string;
						body.contents.pixName = this.getNodeParameter('pixName', i, '') as string;
						body.contents.pixType = this.getNodeParameter('pixType', i, '') as string;
					} else if (operation === 'sendRequestPaymentPlus') {
						body.contents.amount = Number(this.getNodeParameter('amount', i, 0));
						body.contents.pixKey = this.getNodeParameter('pixKey', i, '') as string;
						body.contents.pixName = this.getNodeParameter('pixName', i, '') as string;
						body.contents.pixType = this.getNodeParameter('pixType', i, '') as string;
						body.contents.title = this.getNodeParameter('paymentTitle', i, '') as string;
						body.contents.itemName = this.getNodeParameter('itemName', i, '') as string;
						const bCode = this.getNodeParameter('boletoCode', i, '') as string;
						if (bCode) body.contents.boletoCode = bCode;
					} else if (operation === 'sendTemplate' || operation === 'sendTemplateParams') {
						const components = operation === 'sendTemplate' 
							? [{ type: 'body', parameters: [] }] 
							: getTemplateComponents();

						body.contents = {
							name: this.getNodeParameter('templateName', i) as string,
							language: { code: this.getNodeParameter('languageCode', i, 'pt_BR') as string },
							components,
						};
					}

					// Limpeza final: remove campos vazios que podem confundir a API
					if (body.contents.footer && !body.contents.footer.text) delete body.contents.footer;
					if (body.contents.header && !body.contents.header.text) delete body.contents.header;

					responseData = await whazingApiRequest.call(this, 'POST', path, body);

				} else if (resource === 'contact') {
				} else if (resource === 'contact') {
					if (operation === 'create' || operation === 'update') {
						const extraInfoCollection = this.getNodeParameter('extraInfo', i, { extraInfoValues: [] }) as any;
						const extraInfo = (extraInfoCollection.extraInfoValues || []).map((info: any) => ({
							name: info.name,
							value: info.value,
						}));

						const body: any = {
							name: this.getNodeParameter('contactName', i) as string,
							email: this.getNodeParameter('email', i, '') as string,
							commentary: this.getNodeParameter('commentary', i, '') as string,
							deadline: this.getNodeParameter('deadline', i, '') as string,
							kanbanPrice: this.getNodeParameter('kanbanPrice', i, '') as string,
							disableBot: this.getNodeParameter('disableBot', i, false) as boolean,
							disableCampaign: this.getNodeParameter('disableCampaign', i, false) as boolean,
							disableKanban: this.getNodeParameter('disableKanban', i, false) as boolean,
							ignore: this.getNodeParameter('ignore', i, false) as boolean,
							extraInfo,
							wallets: [],
						};

						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						if (contactIdInput) body.contactId = contactIdInput;
						if (ticketId) body.ticketId = ticketId;
						if (number) body.number = number;

						const path = operation === 'create' ? '/createcontact' : '/updatecontact';
						responseData = await whazingApiRequest.call(this, 'POST', path, body);
					} else if (operation === 'get') {
						const body: any = {};
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						if (contactIdInput) body.contactId = Number(contactIdInput);
						else if (ticketId) body.ticketId = Number(ticketId);
						else body.number = number;
						responseData = await whazingApiRequest.call(this, 'POST', '/contact', body);
					} else if (operation === 'validateNumber') {
						responseData = await whazingApiRequest.call(this, 'POST', '/valid-whatsapp-number', { number });
					} else if (operation === 'setCrm' || operation === 'setFollowup' || operation === 'setTags') {
						const body: any = {};
						const contactIdInput = this.getNodeParameter('contactId', i, '') as string;
						if (contactIdInput) body.contactId = Number(contactIdInput);
						else if (ticketId) body.ticketId = Number(ticketId);
						else body.number = number;
						
						const val = this.getNodeParameter('valueId', i);
						if (operation === 'setCrm') body.crm = Number(val);
						else if (operation === 'setFollowup') body.followup = Number(val);
						else if (operation === 'setTags') {
							const tags = Array.isArray(val) ? val : [val];
							body.tags = tags.map(t => Number(t));
						}
						
						const path = operation === 'setCrm' ? '/updatecrm' : (operation === 'setFollowup' ? '/updatefollowup' : '/updatetag');
						responseData = await whazingApiRequest.call(this, 'POST', path, body);
					} else if (operation.startsWith('listBy')) {
						const val = this.getNodeParameter('valueId', i) as string;
						const type = operation.replace('listBy', '').toLowerCase();
						responseData = await whazingApiRequest.call(this, 'GET', `/contacts/${type}/${val}`);
					}
				} else if (resource === 'ticket') {
					const numInt = isNaN(Number(number)) ? number : Number(number);

					if (operation === 'create') {
						const body = {
							number: numInt,
							status: this.getNodeParameter('status', i, 'pending'),
							queueId: this.getNodeParameter('queueId', i) ? Number(this.getNodeParameter('queueId', i)) : null,
							userId: this.getNodeParameter('userId', i) ? Number(this.getNodeParameter('userId', i)) : null,
						};
						responseData = await whazingApiRequest.call(this, 'POST', '/createticket', body);
					} else if (operation === 'showTicket') {
						responseData = await whazingApiRequest.call(this, 'POST', '/showticket', { number: numInt });
					} else if (operation === 'showTicketChatBot') {
						responseData = await whazingApiRequest.call(this, 'POST', '/showticketchatbot', { number: numInt });
					} else if (operation === 'getAll') {
						responseData = await whazingApiRequest.call(this, 'POST', '/showallticket', { number: numInt });
					} else if (operation === 'updateInfo' || operation === 'setQueue' || operation === 'setChatBot' || operation === 'updateChatbot') {
						const ticketIdInput = this.getNodeParameter('ticketId', i) as string;
						const body: any = { ticketId: Number(ticketIdInput) };
						let path = '';

						if (operation === 'updateInfo') {
							body.status = this.getNodeParameter('status', i);
							body.queueId = this.getNodeParameter('queueId', i) ? Number(this.getNodeParameter('queueId', i)) : null;
							body.userId = this.getNodeParameter('userId', i) ? Number(this.getNodeParameter('userId', i)) : null;
							path = '/updateticketinfo';
						} else if (operation === 'setQueue') {
							body.queueId = Number(this.getNodeParameter('queueId', i));
							path = '/updatequeue';
						} else if (operation === 'setChatBot') {
							body.chatbot = this.getNodeParameter('enableChatbot', i, true) as boolean;
							path = '/setchatbot';
						} else if (operation === 'updateChatbot') {
							body.chatbotId = Number(this.getNodeParameter('chatbotId', i));
							path = '/updatechatbot';
						}
						
						responseData = await whazingApiRequest.call(this, 'POST', path, body);
					} else if (operation === 'listMessages' || operation === 'get') {
						const ticketIdInput = this.getNodeParameter('ticketId', i) as string;
						responseData = await whazingApiRequest.call(this, 'GET', `/ticket/${ticketIdInput}`);
					}
				} else if (resource === 'admin') {
					if (operation === 'listTenants') {
						responseData = await adminApiRequest.call(this, 'GET', '');
					} else if (operation === 'getTenant') {
						const tenantId = this.getNodeParameter('tenantId', i) as string;
						responseData = await adminApiRequest.call(this, 'GET', '', { tenantId });
					} else if (operation === 'createTenant') {
						const body = {
							name: this.getNodeParameter('adminUserName', i) as string,
							email: this.getNodeParameter('adminEmail', i) as string,
							password: this.getNodeParameter('adminPassword', i) as string,
							tenantName: this.getNodeParameter('tenantName', i) as string,
							phone: this.getNodeParameter('adminPhone', i) as string,
							plano: this.getNodeParameter('planId', i) as string,
							timetest: this.getNodeParameter('timeTest', i) as string,
						};
						responseData = await adminApiRequest.call(this, 'POST', '/createtenant', body);
					} else if (operation === 'updateTenant') {
						const body = {
							tenantId: this.getNodeParameter('tenantId', i) as string,
							tenantName: this.getNodeParameter('tenantName', i) as string,
							email: this.getNodeParameter('adminEmail', i) as string,
							phone: this.getNodeParameter('adminPhone', i) as string,
							plano: this.getNodeParameter('planId', i) as string,
							dueDate: this.getNodeParameter('dueDate', i) as string,
						};
						responseData = await adminApiRequest.call(this, 'POST', '/updatetenant', body);
					} else if (operation === 'addMonth') {
						const tenantId = this.getNodeParameter('tenantId', i) as string;
						responseData = await adminApiRequest.call(this, 'POST', '/addMonth', { tenantId });
					} else if (operation === 'listUsers') {
						const tenantId = this.getNodeParameter('tenantId', i) as string;
						responseData = await adminApiRequest.call(this, 'GET', `/users/${tenantId}`);
					} else if (operation === 'changePassword') {
						const body = { userId: this.getNodeParameter('userId', i) as string, password: this.getNodeParameter('adminPassword', i) as string };
						responseData = await adminApiRequest.call(this, 'POST', '/users', body);
					}
				} else if (resource === 'channel') {
					if (operation === 'getStatus') {
						responseData = await whazingApiRequest.call(this, 'GET', '/statuschannel');
					}
 else if (operation === 'getQrCode') {
						responseData = await whazingApiRequest.call(this, 'POST', '/qrcode', { number: null });
					} else if (operation === 'logout') {
						responseData = await whazingApiRequest.call(this, 'POST', '/logout', {});
					} else if (operation === 'restart') {
						responseData = await whazingApiRequest.call(this, 'POST', '/restart', {});
					}
				}

				const executionData = this.helpers.returnJsonArray(responseData).map(json => ({
					json,
					pairedItem: { item: i },
				}));
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: i });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
