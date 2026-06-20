import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';

// IHttpRequestOptions não tem formData — extendemos localmente
type IHttpRequestOptionsWithFormData = IHttpRequestOptions & {
	formData?: IDataObject;
};

/**
 * Formata o numero de telefone removendo caracteres não numéricos e,
 * quando necessário, adiciona o prefixo brasileiro 55.
 *
 * Regras (em ordem de prioridade):
 *  1. Se o número original começa com '+', é explicitamente internacional —
 *     remove os caracteres não numéricos mas NÃO adiciona 55.
 *  2. Se o número limpo tem 12+ dígitos, o código de país já está presente —
 *     mantém como está.
 *  3. Se o número limpo tem 10 ou 11 dígitos sem '+', assume-se Brasil e
 *     adiciona o prefixo 55.
 *
 * Exemplos:
 *  '+1 (347) 878-5374'   → '13478785374'     (EUA — não adiciona 55)
 *  '+55 11 9 9999-9999'  → '5511999999999'   (BR com código — mantém)
 *  '11 9 9999-9999'      → '5511999999999'   (BR sem código — adiciona 55)
 *  '(11) 9999-9999'      → '551199999999'    (BR sem código — adiciona 55)
 *  '5511999999999'       → '5511999999999'   (BR já formatado — mantém)
 *  '+243 82 123 4567'    → '243821234567'    (DRC — não adiciona 55)
 */
export function formatPhoneNumber(number: string): string {
	if (!number) return '';

	// Guarda se o número original era explicitamente internacional ('+...')
	const isExplicitlyInternational = number.trimStart().startsWith('+');

	const cleaned = number.replace(/\D/g, '');

	if (cleaned.length === 0) return '';

	// 12+ dígitos → código de país já presente, não modifica
	if (cleaned.length >= 12) return cleaned;

	// Veio com '+' → é internacional, não adiciona 55
	if (isExplicitlyInternational) return cleaned;

	// 10 ou 11 dígitos sem '+' → assume Brasil
	if (cleaned.length === 10 || cleaned.length === 11) {
		return '55' + cleaned;
	}

	return cleaned;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tradução de erros HTTP para português
// ─────────────────────────────────────────────────────────────────────────────

/** Extrai código HTTP de mensagens no formato "status code 500". */
function extractStatusFromMessage(message: string): number | undefined {
	const match = message.match(/status\s+code\s+(\d{3})/i) || message.match(/\b([45]\d{2})\b/);
	const code = match ? parseInt(match[1], 10) : undefined;
	return code && code >= 400 && code < 600 ? code : undefined;
}

/** Extrai o corpo da resposta HTTP de diversas estruturas de erro do n8n. */
function extractResponseBody(err: any): IDataObject | undefined {
	const raw =
		err?.response?.data         ||
		err?.response?.body         ||
		err?.cause?.response?.data  ||
		err?.cause?.response?.body  ||
		err?.data;
	if (!raw) return undefined;
	try {
		return typeof raw === 'string' ? (JSON.parse(raw) as IDataObject) : (raw as IDataObject);
	} catch {
		return undefined;
	}
}

/** Extrai o código de status HTTP de diversas estruturas de erro do n8n. */
function extractStatusCode(err: any): number | undefined {
	const code =
		err?.statusCode              ||
		err?.response?.statusCode    ||
		err?.response?.status        ||
		err?.cause?.statusCode       ||
		err?.cause?.response?.status ||
		err?.httpCode;
	if (Number(code) >= 400) return Number(code);
	return extractStatusFromMessage(String(err?.message || ''));
}

/** Mapa de status HTTP → mensagem amigável em português. */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
	400: 'Requisição inválida (400) — verifique os parâmetros enviados',
	401: 'Não autorizado (401) — token de autenticação inválido ou ausente',
	403: 'Acesso negado (403) — token sem permissão para esta operação',
	404: 'Recurso não encontrado (404) — verifique os IDs informados',
	408: 'Tempo limite de requisição (408) — servidor não respondeu a tempo',
	409: 'Conflito (409) — recurso já existe ou está em estado conflitante',
	422: 'Dados inválidos (422) — verifique os valores dos campos enviados',
	429: 'Limite de requisições atingido (429) — aguarde antes de tentar novamente',
	500: 'Erro interno no servidor Whazing (500) — tente novamente em instantes',
	502: 'Gateway inválido (502) — servidor Whazing pode estar reiniciando',
	503: 'Serviço indisponível (503) — servidor Whazing fora do ar',
	504: 'Timeout de gateway (504) — servidor demorou para responder',
};

/**
 * Tabela de tradução: substring da mensagem da API → mensagem em português.
 * As entradas são verificadas em ordem; a comparação ignora maiúsculas/minúsculas.
 */
const API_MESSAGE_TRANSLATIONS: Array<[string, string]> = [
	['session not found',       'Sessão do WhatsApp não encontrada — reconecte o canal no painel do Whazing'],
	['whatsapp session',        'Sessão do WhatsApp com problema — reconecte o canal no painel do Whazing'],
	['channel not connected',   'Canal não conectado — verifique a conexão WhatsApp no painel do Whazing'],
	['number not on whatsapp',  'Este número não está registrado no WhatsApp'],
	['invalid number',          'Número de telefone inválido — verifique o formato (ex: 5511999999999)'],
	['contact not found',       'Contato não encontrado — verifique o número ou o ID do contato'],
	['ticket not found',        'Ticket não encontrado — verifique o ID do ticket informado'],
	['message not sent',        'Mensagem não enviada — verifique se o número está ativo no WhatsApp'],
	['invalid token',           'Token inválido — verifique as credenciais do canal no Whazing'],
	['expired token',           'Token expirado — gere um novo token nas configurações do canal'],
	['internal server error',   'Erro interno no servidor Whazing — tente novamente em instantes'],
	['unauthorized',            'Não autorizado — verifique o token de autenticação'],
	['forbidden',               'Acesso negado — o token não tem permissão para esta operação'],
	['not found',               'Recurso não encontrado (404)'],
	['bad request',             'Requisição inválida — verifique os parâmetros enviados'],
	['too many requests',       'Muitas requisições — aguarde antes de tentar novamente (rate limit)'],
	['service unavailable',     'Serviço indisponível — o servidor Whazing pode estar fora do ar'],
	['gateway timeout',         'Tempo limite de resposta excedido — o servidor está demorando'],
	['item de checklist',       'Item de checklist não encontrado — verifique o ID informado'],
	['campo text é obrigatório', 'O texto do item de checklist é obrigatório'],
	['itemids deve ser',        'itemIds deve ser um array não vazio com os IDs na ordem desejada'],
];

/**
 * Traduz um erro de API HTTP para uma mensagem amigável em português.
 * Tenta extrair o código de status e o body da resposta antes de
 * recorrer à mensagem original do erro.
 *
 * Exportada para que possa ser usada em testes unitários e em Whazing_node.ts.
 */
export function translateApiError(error: unknown): string {
	const err        = error as any;
	const statusCode = extractStatusCode(err);
	const body       = extractResponseBody(err);

	// Mensagem retornada pela API no body da resposta (error pode ser boolean)
	const apiRawMessage: string | undefined = (() => {
		if (!body) return undefined;
		for (const key of ['message', 'msg', 'detail', 'error']) {
			const val = body[key];
			if (typeof val === 'string' && val.trim()) return val;
		}
		return undefined;
	})();

	// 1ª tentativa: tradução pela mensagem do body da API
	if (apiRawMessage) {
		const lower = apiRawMessage.toLowerCase();
		for (const [key, translation] of API_MESSAGE_TRANSLATIONS) {
			if (lower.includes(key)) return translation;
		}
		// Nenhuma tradução exata — combina status + mensagem original
		const statusLabel = statusCode
			? (HTTP_STATUS_MESSAGES[statusCode] ? `[${statusCode}] ` : `[HTTP ${statusCode}] `)
			: '';
		return `${statusLabel}Whazing API: ${apiRawMessage}`;
	}

	// 2ª tentativa: tradução pelo status HTTP
	if (statusCode && HTTP_STATUS_MESSAGES[statusCode]) {
		return HTTP_STATUS_MESSAGES[statusCode];
	}

	// 3ª tentativa: tradução pela mensagem de erro original
	const originalMessage = String(err?.message || 'Erro desconhecido');
	const lowerOriginal   = originalMessage.toLowerCase();
	for (const [key, translation] of API_MESSAGE_TRANSLATIONS) {
		if (lowerOriginal.includes(key)) return translation;
	}

	// Fallback: retorna mensagem original sem alteração
	return originalMessage;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de requisição HTTP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Faz requisições para a API principal do Whazing (por canal).
 * Autenticação via Bearer Token injetado automaticamente pelo n8n.
 * Erros HTTP são traduzidos para português e relançados preservando
 * o objeto `response` original (necessário para isNotFound() funcionar).
 */
export async function whazingApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: string,
	path: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	_uri?: string,
	option: IDataObject = {},
	_unused?: unknown,
	formData?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('whazingApi');
	const finalBaseUrl = (credentials.baseUrl as string || '').trim().replace(/\/+$/, '');

	const headers: IDataObject = formData ? {} : { 'Content-Type': 'application/json' };
	const options: IHttpRequestOptionsWithFormData = {
		headers,
		method: method as IHttpRequestMethods,
		url: `${finalBaseUrl}${path}`,
		json: true,
	};

	if (Object.keys(body).length > 0)  options.body     = body;
	if (Object.keys(qs).length > 0)    options.qs       = qs;
	if (formData) {
		options.formData = formData;
		options.json = false;
	}
	if (Object.keys(option).length > 0) Object.assign(options, option);

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'whazingApi', options);
	} catch (error) {
		const orig: any = error;
		// Cria novo erro com mensagem traduzida, mas preserva response/statusCode
		// para que isNotFound() em Whazing_node.ts continue funcionando corretamente.
		const enriched: any = new Error(translateApiError(orig));
		if (orig?.response)   enriched.response   = orig.response;
		if (orig?.statusCode) enriched.statusCode = orig.statusCode;
		if (orig?.httpCode)   enriched.httpCode   = orig.httpCode;
		throw enriched;
	}
}

/**
 * Faz requisições para a API de Administração do Whazing (multi-tenant).
 * Usa adminToken diretamente — não passa pelo httpRequestWithAuthentication.
 * Erros HTTP são traduzidos para português antes de serem relançados.
 */
export async function adminApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: string,
	path: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('whazingApi');

	if (!credentials.adminUrl || !credentials.adminApiId) {
		throw new Error(
			'Admin API URL e Admin API ID são necessários. Configure nas credenciais.',
		);
	}

	let baseAdminUrl = (credentials.adminUrl as string || '').trim().replace(/\/+$/, '');
	if (path.startsWith('/external') && baseAdminUrl.includes('/external')) {
		baseAdminUrl = baseAdminUrl.split('/external')[0];
	}

	const finalUrl = path.startsWith('/external')
		? `${baseAdminUrl}${path}`
		: `${baseAdminUrl}/${credentials.adminApiId}${path}`;

	const options: IHttpRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${credentials.adminToken}`,
		},
		method: method as IHttpRequestMethods,
		url: finalUrl,
		json: true,
	};

	if (Object.keys(body).length > 0) options.body = body;
	if (Object.keys(qs).length > 0)   options.qs   = qs;

	try {
		return await this.helpers.httpRequest.call(this, options);
	} catch (error) {
		const orig: any = error;
		const enriched: any = new Error(translateApiError(orig));
		if (orig?.response)   enriched.response   = orig.response;
		if (orig?.statusCode) enriched.statusCode = orig.statusCode;
		if (orig?.httpCode)   enriched.httpCode   = orig.httpCode;
		throw enriched;
	}
}