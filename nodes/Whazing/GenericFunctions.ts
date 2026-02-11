import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
} from 'n8n-workflow';

export async function whazingApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: string,
	path: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	uri?: string,
	option: IDataObject = {},
	formData?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('whazingApi');

	// Roteamento Inteligente:
	// A URL base (geralmente .../v1/api) deve ser mantida.
	// Se o path começa com /external/, ele será anexado à URL base completa.
	const finalBaseUrl = (credentials.baseUrl as string || '').trim().replace(/\/+$/, '');

	const options: {
		headers: { 'Content-Type': string };
		method: string;
		body?: IDataObject;
		qs: IDataObject;
		formData?: IDataObject;
		url: string;
		json: boolean;
	} = {
		headers: {
			'Content-Type': formData ? 'multipart/form-data' : 'application/json',
		},
		method,
		body,
		qs,
		formData,
		url: uri || `${finalBaseUrl}${path}`,
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

	return this.helpers.httpRequestWithAuthentication.call(this, 'whazingApi', options as any);
}

export async function adminApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: string,
	path: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
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

	const options: IDataObject = {
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

	return this.helpers.httpRequest.call(this, options as any);
}
