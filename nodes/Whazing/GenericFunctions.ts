import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import {
	IDataObject,
} from 'n8n-workflow';

export async function whazingApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: string,
	path: string,
	body: any = {},
	qs: IDataObject = {},
	uri?: string,
	option: IDataObject = {},
	formData?: any,
): Promise<any> {
	const credentials = await this.getCredentials('whazingApi');

	// Roteamento Inteligente:
	// A URL base (geralmente .../v1/api) deve ser mantida.
	// Se o path começa com /external/, ele será anexado à URL base completa.
	const finalBaseUrl = (credentials.baseUrl as string || '').trim().replace(/\/+$/, '');

	const options: any = {
		headers: {
			'Content-Type': formData ? 'multipart/form-data' : 'application/json',
		},
		method,
		body,
		qs,
		formData,
		uri: uri || `${finalBaseUrl}${path}`,
		json: true,
	};

	if (Object.keys(option).length !== 0) {
		Object.assign(options, option);
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}
	
	if (!formData) {
		delete options.formData;
	}

	return this.helpers.requestWithAuthentication.call(this, 'whazingApi', options);
}

export async function adminApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: string,
	path: string,
	body: any = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('whazingApi');

	if (!credentials.adminUrl || !credentials.adminApiId) {
		throw new Error('Admin API URL e Admin API ID são necessários para esta operação.');
	}

	// Sanitização: Evita duplicidade se adminUrl já tiver /external e o path também
	let baseAdminUrl = (credentials.adminUrl as string || '').trim().replace(/\/+$/, '');
	if (path.startsWith('/external')) {
		if (baseAdminUrl.includes('/external')) {
			baseAdminUrl = baseAdminUrl.split('/external')[0];
		}
	}

	const finalUri = path.startsWith('/external') 
		? `${baseAdminUrl}${path}`
		: `${baseAdminUrl}/${credentials.adminApiId}${path}`;

	const options: any = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${credentials.adminToken}`,
		},
		method,
		body,
		qs,
		uri: finalUri,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	return this.helpers.request.call(this, options);
}
