import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WhazingApi implements ICredentialType {
	name = 'whazingApi';
	displayName = 'Whazing API';
	documentationUrl = 'https://docs.whazing.com';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.galaxychat.com.br/v1/api',
			required: true,
			description: 'A URL base para a API Whazing',
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'O token da API para autenticação',
		},
		{
			displayName: 'Admin API URL',
			name: 'adminUrl',
			type: 'string',
			default: 'https://api.galaxychat.com.br/v1/api/admin',
			required: false,
			description: 'URL da API Admin (opcional, para gerenciamento de tenants)',
		},
		{
			displayName: 'Admin API ID',
			name: 'adminApiId',
			type: 'string',
			default: '',
			required: false,
			description: 'ID da API Admin (opcional, para gerenciamento de tenants)',
		},
		{
			displayName: 'Admin Token',
			name: 'adminToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: false,
			description: 'Token Admin (opcional, para gerenciamento de tenants)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/statuschannel',
			method: 'GET',
		},
	};
}
