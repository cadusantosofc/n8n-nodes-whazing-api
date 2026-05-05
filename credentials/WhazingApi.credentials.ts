import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class WhazingApi implements ICredentialType {
	name = 'whazingApi';
	displayName = 'Whazing API';
	icon: Icon = 'file:whazing.svg';
	documentationUrl = 'https://docs.whazing.com';

	properties: INodeProperties[] = [

		// ------------------------------------------------
		//  API do Canal (obrigatório)
		// ------------------------------------------------
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.galaxychat.com.br/v1/api',
			required: true,
			placeholder: 'https://api.galaxychat.com.br/v1/api',
			description: 'URL base da API do canal. Inclui o endereço até /v1/api sem barra no final.',
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Token de autenticação do canal. Encontrado nas configurações da instância no Whazing.',
		},

		// ------------------------------------------------
		//  API Admin (opcional — só para recurso Admin)
		// ------------------------------------------------
		{
			displayName: 'Admin URL',
			name: 'adminUrl',
			type: 'string',
			default: 'https://api.galaxychat.com.br/v1/api/admin',
			required: false,
			placeholder: 'https://api.galaxychat.com.br/v1/api/admin',
			description: 'URL da API de administração. Necessário apenas para o recurso Admin (gestão de empresas/usuários).',
		},
		{
			displayName: 'Admin API ID',
			name: 'adminApiId',
			type: 'string',
			default: '',
			required: false,
			placeholder: 'CSKQA9dMMaqgmsquZywQBkkHMSEE6V',
			description: 'ID da API Admin. Aparece na URL após /admin/ nas chamadas de gerenciamento.',
		},
		{
			displayName: 'Admin Token',
			name: 'adminToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			description: 'Token Bearer para autenticação na API Admin. Diferente do token do canal.',
		},
	];

	// Bearer Token injetado automaticamente pelo n8n em todas as
	// chamadas feitas via httpRequestWithAuthentication (API do canal).
	// A API Admin usa adminToken diretamente no GenericFunctions.ts.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiToken}}',
			},
		},
	};

	// Testa conectividade usando o endpoint de status do canal
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/statuschannel',
			method: 'GET',
		},
	};
}