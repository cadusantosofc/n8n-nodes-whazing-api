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
 * Faz requisições para a API principal do Whazing (por canal).
 * Autenticação via Bearer Token injetado automaticamente pelo n8n.
 */
/**
 * Formata o numero de telefone para garantir que tenha o prefixo 55 se for brasileiro
 * e remove caracteres nao numericos.
 */
export function formatPhoneNumber(number: string): string {
	let cleaned = number.replace(/\D/g, '');

	if (cleaned.length === 0) return '';

	// Se o numero tem 10 ou 11 digitos (DDD + Numero), assume-se Brasil e adiciona 55
	if (cleaned.length === 10 || cleaned.length === 11) {
		cleaned = '55' + cleaned;
	}

	return cleaned;
}

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
		headers: headers,
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

	return this.helpers.httpRequestWithAuthentication.call(this, 'whazingApi', options);
}

/**
 * Faz requisições para a API de Administração do Whazing (multi-tenant).
 * Usa adminToken diretamente — não passa pelo httpRequestWithAuthentication.
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

	return this.helpers.httpRequest.call(this, options);
}