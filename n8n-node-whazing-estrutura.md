# Whazing Community Node for n8n - Complete Technical Specification

> **Document Purpose**: Complete technical specification for developing a Whazing community node for n8n.  
> **Target**: Cursor IDE automatic code generation  
> **API**: Whazing WhatsApp Integration Platform

---

## 1. API Overview

### Description
Whazing is a comprehensive WhatsApp Business API integration platform providing:
- Multi-channel messaging (WhatsApp, Instagram, Facebook)
- Interactive message capabilities (buttons, lists, templates)
- Contact and ticket management system
- CRM and Follow-up integration
- Payment processing (PIX and Boleto)
- Channel management and QR code generation

### Base Configuration
```
Base URL: https://api.galaxychat.com.br/v1/api
Admin URL: https://api.galaxychat.com.br/v1/api/admin
Authentication: Bearer Token
Protocol: HTTPS only
```

### Authentication Method
```http
Authorization: Bearer {api_token}
Content-Type: application/json
```

---

## 2. Project Structure

### Complete Directory Tree
```
n8n-nodes-whazing/
├── credentials/
│   └── WhazingApi.credentials.ts
├── nodes/
│   └── Whazing/
│       ├── Whazing.node.ts
│       ├── Whazing.node.json
│       └── whazing.svg
├── package.json
├── tsconfig.json
├── .gitignore
├── .npmignore
├── .eslintrc.js
├── gulpfile.js
└── README.md
```

---

## 3. Configuration Files

### package.json
```json
{
  "name": "n8n-nodes-whazing",
  "version": "1.0.0",
  "description": "n8n community node for Whazing WhatsApp API",
  "keywords": [
    "n8n-community-node-package",
    "n8n",
    "whazing",
    "whatsapp",
    "messaging",
    "api"
  ],
  "license": "MIT",
  "homepage": "",
  "author": {
    "name": "",
    "email": ""
  },
  "repository": {
    "type": "git",
    "url": ""
  },
  "main": "index.js",
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "format": "prettier nodes credentials --write",
    "lint": "eslint nodes credentials",
    "lintfix": "eslint nodes credentials --fix",
    "prepublishOnly": "npm run build"
  },
  "files": [
    "dist"
  ],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/WhazingApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/Whazing/Whazing.node.js"
    ]
  },
  "devDependencies": {
    "@types/node": "^18.16.0",
    "@typescript-eslint/parser": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-n8n-nodes-base": "^1.11.0",
    "gulp": "^4.0.2",
    "n8n-workflow": "*",
    "prettier": "^2.7.1",
    "typescript": "^4.9.0"
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "lib": ["ES2019"],
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["credentials/**/*", "nodes/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 4. Logo SVG (60x60px)

Save as: `nodes/Whazing/whazing.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60">
  <rect width="60" height="60" rx="8" fill="#25D366"/>
  <path d="M30 12C20.059 12 12 20.059 12 30c0 3.145.813 6.103 2.238 8.669L12.5 47.5l9.169-1.676A17.91 17.91 0 0030 48c9.941 0 18-8.059 18-18S39.941 12 30 12zm0 3c8.284 0 15 6.716 15 15s-6.716 15-15 15a14.91 14.91 0 01-7.613-2.063l-.544-.319-5.638 1.031 1.075-5.456-.351-.571A14.91 14.91 0 0115 30c0-8.284 6.716-15 15-15z" fill="#fff"/>
  <path d="M23.5 21.5c-.3 0-.894.131-1.356.656-.462.525-1.644 1.606-1.644 3.919s1.681 4.544 1.919 4.856c.237.312 3.306 5.244 8.156 7.125 4.031 1.563 4.85 1.25 5.719 1.175.869-.075 2.806-1.15 3.2-2.256.394-1.106.394-2.056.275-2.256-.119-.2-.444-.319-.931-.556-.488-.237-2.887-1.425-3.331-1.594-.444-.169-.769-.237-1.094.238-.325.475-1.256 1.594-1.538 1.919-.281.325-.562.363-1.05.125-.487-.238-2.056-.757-3.919-2.419-1.45-1.293-2.431-2.894-2.713-3.381-.281-.488-.03-.75.206-.994.213-.219.488-.562.731-.843.244-.282.325-.469.488-.782.162-.312.081-.581-.038-.818-.119-.238-1.069-2.644-1.481-3.619-.394-.931-.8-.806-1.094-.819-.281-.012-.6-.012-.925-.012z" fill="#fff"/>
</svg>
```

---

## 5. API Endpoints - Complete Reference

### 5.1 MESSAGES

#### Send Text Message
```typescript
// Endpoint
POST {base_url}

// Request by Phone Number
{
  "body": "Message text content",
  "number": "5511999999999",
  "externalKey": "optional_unique_id"
}

// Request by Ticket ID
{
  "body": "Message text content",
  "ticketId": "1234",
  "externalKey": "optional_unique_id"
}

// Response
{
  "id": 12345,
  "messageId": "msg_abc123",
  "status": "sent"
}
```

#### Send File (3 Methods)

**Method 1: multipart/form-data**
```typescript
POST {base_url}
Content-Type: multipart/form-data

FormData:
  - media: [binary file]
  - body: "File caption"
  - number: "5511999999999"
  - externalKey: "unique_id"
```

**Method 2: Base64**
```typescript
POST {base_url}

{
  "body": "File caption",
  "number": "5511999999999",
  "externalKey": "unique_id",
  "mediaMessage": {
    "mediaType": "image/jpeg",
    "fileName": "photo.jpg",
    "media": "[base64_string]"
  }
}
```

**Method 3: URL**
```typescript
POST {base_url}

{
  "body": "File caption",
  "number": "5511999999999",
  "externalKey": "unique_id",
  "mediaUrl": "https://example.com/file.jpg"
}
```

**Supported Media Types**:
- Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Audio: `audio/mpeg`, `audio/ogg`, `audio/wav`
- Video: `video/mp4`, `video/3gpp`
- Documents: `application/pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `text/plain`

#### Send Sticker
```typescript
POST {base_url}
Content-Type: multipart/form-data

FormData:
  - media: [PNG with transparent background]
  - body: "sticker"
  - number: "5511999999999"
  - sticker: "true"
```

#### Send Location
```typescript
POST {base_url}/location

{
  "number": "5511999999999",
  "contents": {
    "type": "location",
    "longitude": -27.2842864,
    "latitude": -48.9243959,
    "name": "Location Name",
    "address": "Complete address"
  }
}
```

#### Interactive Button Message
```typescript
POST {base_url}/apioficial  // or /apiplus

{
  "number": "5511999999999",
  "contents": {
    "type": "button",
    "body": {
      "text": "Choose an option:"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "1",
            "title": "Option 1"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "2",
            "title": "Option 2"
          }
        }
      ]
    }
  }
}
```

#### Interactive List Message
```typescript
POST {base_url}/apioficial  // or /apiplus

{
  "number": "5511999999999",
  "contents": {
    "type": "list",
    "header": {
      "type": "text",
      "text": "Menu"
    },
    "body": {
      "text": "Select an item"
    },
    "action": {
      "sections": [
        {
          "title": "Section 1",
          "rows": [
            {
              "id": "1",
              "title": "Item 1",
              "description": "Description"
            }
          ]
        }
      ],
      "button": "Click here"
    }
  }
}
```

#### WhatsApp Template Message
```typescript
POST {base_url}/apioficial

// Without parameters
{
  "number": "5511999999999",
  "contents": {
    "name": "template_name",
    "components": [{
      "type": "body",
      "parameters": []
    }],
    "language": {
      "code": "pt_BR"
    }
  }
}

// With parameters
{
  "number": "5511999999999",
  "contents": {
    "name": "template_name",
    "components": [
      {
        "type": "header",
        "parameters": [{
          "type": "image",
          "image": {
            "link": "https://example.com/image.jpg"
          }
        }]
      },
      {
        "type": "body",
        "parameters": [{
          "type": "text",
          "text": "parameter_value"
        }]
      }
    ],
    "language": {
      "code": "pt_BR"
    }
  }
}
```

#### PIX Button
```typescript
POST {base_url}/pixbutton

{
  "number": "5511999999999",
  "contents": {
    "type": "pixbutton",
    "pixKey": "11071697000108",
    "pixName": "Company Name",
    "pixType": "CNPJ"  // CPF, CNPJ, PHONE, EMAIL, EVP
  }
}
```

#### Request Payment
```typescript
POST {base_url}/requestpayment

{
  "number": "5511999999999",
  "contents": {
    "type": "requestpayment",
    "amount": 199.99,
    "text": "Order #123 payment",
    "pixKey": "11071697000108",
    "pixName": "Company Name",
    "pixType": "CNPJ",
    "title": "Order details",
    "footer": "Store Name",
    "itemName": "Product/Service",
    "boletoCode": "34191.79001 01043.510047 91020.150008 5 91070026000"
  }
}
```

### 5.2 TICKETS

#### Create Ticket
```typescript
POST {base_url}/createticket

{
  "number": "5511999999999",
  "status": "pending",  // open, pending, closed
  "queueId": 15,
  "userId": null
}
```

#### Get Ticket Info
```typescript
POST {base_url}/showticket

{
  "number": "5511999999999"
}

// Response
{
  "id": 1234,
  "status": "open",
  "contactId": 5678,
  "userId": 1,
  "queueId": 2,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T15:30:00.000Z"
}
```

#### Get All Tickets
```typescript
POST {base_url}/showallticket

{
  "number": "5511999999999"
}
```

#### Update Ticket Info
```typescript
POST {base_url}/updateticketinfo

{
  "ticketId": 1003,
  "status": "open",
  "userId": 1,
  "queueId": null
}
```

#### Set Queue
```typescript
POST {base_url}/updatequeue

{
  "ticketId": 4,
  "queueId": 1
}
```

#### Set ChatBot
```typescript
POST {base_url}/updatechatbot

{
  "ticketId": 6934,
  "chatbotId": 62
}
```

#### List Ticket Messages
```typescript
GET {base_url}/ticket/{ticketId}
```

### 5.3 CONTACTS

#### Create Contact
```typescript
POST {base_url}/createcontact

{
  "name": "João Silva",
  "number": "5511999999999",
  "email": "joao@example.com",
  "extraInfo": [
    {
      "name": "Company",
      "value": "Example Ltd"
    }
  ],
  "wallets": [],
  "disableBot": false,
  "disableCampaign": false,
  "commentary": "VIP client",
  "deadline": "2024-12-31T23:59:59Z",
  "disableKanban": false,
  "kanbanPrice": "1500",
  "ignore": false
}
```

#### Update Contact (by Number or ID)
```typescript
POST {base_url}/updatecontact

// By Number
{
  "number": "5511999999999",
  "name": "Updated Name",
  "email": "new@example.com"
}

// By Contact ID
{
  "contactId": "5219",
  "name": "Updated Name"
}
```

#### Get Contact Info
```typescript
POST {base_url}/contact

// By Number
{
  "number": "5511999999999"
}

// By Contact ID
{
  "contactId": 3397
}
```

#### Validate WhatsApp Number
```typescript
POST {base_url}/valid-whatsapp-number

{
  "number": "5511999999999"
}

// Response
{
  "exists": true,
  "jid": "5511999999999@s.whatsapp.net"
}
```

#### Set CRM
```typescript
POST {base_url}/updatecrm

// By Number
{
  "number": "5511999999999",
  "crm": 8
}

// By Contact ID
{
  "contactId": 3397,
  "crm": 8
}

// By Ticket ID
{
  "ticketId": 2881,
  "crm": 19
}
```

#### Set Follow-up
```typescript
POST {base_url}/updatefollowup

{
  "number": "5511999999999",
  "followup": 8
}
```

#### Set Tags
```typescript
POST {base_url}/updatetag

{
  "number": "5511999999999",
  "tags": [25, 26, 27]
}
```

#### List Contacts by Tag
```typescript
GET {base_url}/contacts/tag/{tagId}
```

#### List Contacts by CRM
```typescript
GET {base_url}/contacts/crm/{crmId}
```

#### List Contacts by Follow-up
```typescript
GET {base_url}/contacts/followup/{followupId}
```

#### List Contacts by Wallet
```typescript
GET {base_url}/contacts/wallet/{walletId}
```

### 5.4 CHANNEL

#### Get Channel Status
```typescript
GET {base_url}/statuschannel

// Response
{
  "status": "connected",  // connected, disconnected, connecting
  "qrcode": null
}
```

#### Get QR Code
```typescript
POST {base_url}/qrcode

{
  "number": null
}

// Response
{
  "qrcode": "data:image/png;base64,..."
}
```

### 5.5 ADMIN (Multi-tenant Management)

#### Create Tenant
```typescript
POST {admin_url}/{api_id}/createtenant

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "tenantName": "Company Name",
  "phone": "55555555555",
  "plano": "1",
  "timetest": "3"
}

// Response
{
  "tenant": {
    "id": 38,
    "name": "Company Name",
    "status": "active",
    "planId": 1,
    "dueDate": "2025-08-23T22:47:20.000Z"
  },
  "user": {
    "id": 42,
    "name": "User Name",
    "email": "user@example.com",
    "profile": "admin"
  }
}
```

#### List All Tenants
```typescript
GET {admin_url}/{api_id}
```

#### Update Tenant
```typescript
POST {admin_url}/{api_id}/updatetenant

{
  "tenantId": "37",
  "email": "new@example.com",
  "tenantName": "Updated Name",
  "phone": "55555555555",
  "plano": "1",
  "dueDate": "2025-07-17T20:58"
}
```

#### Add Month to Subscription
```typescript
POST {admin_url}/{api_id}/addMonth

{
  "tenantId": "37"
}
```

---

## 6. Credentials File (WhazingApi.credentials.ts)

```typescript
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
			description: 'The base URL for the Whazing API',
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
			description: 'The API token for authentication',
		},
		{
			displayName: 'Admin API URL',
			name: 'adminUrl',
			type: 'string',
			default: 'https://api.galaxychat.com.br/v1/api/admin',
			required: false,
			description: 'Admin API URL (optional, for tenant management)',
		},
		{
			displayName: 'Admin API ID',
			name: 'adminApiId',
			type: 'string',
			default: '',
			required: false,
			description: 'Admin API ID (optional, for tenant management)',
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
			description: 'Admin token (optional, for tenant management)',
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
```

---

## 7. Main Node Implementation Structure

The main node file (`Whazing.node.ts`) should implement:

### Resources and Operations

**Resources**:
1. `message` - Messaging operations
2. `contact` - Contact management
3. `ticket` - Ticket management
4. `channel` - Channel operations
5. `admin` - Tenant administration

**Message Operations**:
- `sendText` - Send text message
- `sendFile` - Send file (image, document, audio, video)
- `sendLocation` - Send location
- `sendButton` - Send interactive button message
- `sendList` - Send interactive list message
- `sendTemplate` - Send WhatsApp template
- `sendSticker` - Send sticker
- `sendPixButton` - Send PIX payment button
- `requestPayment` - Request payment

**Contact Operations**:
- `create` - Create contact
- `update` - Update contact
- `get` - Get contact info
- `validateNumber` - Validate WhatsApp number
- `setCrm` - Set CRM field
- `setFollowup` - Set follow-up field
- `setTags` - Set tags
- `listByTag` - List contacts by tag
- `listByCrm` - List contacts by CRM
- `listByFollowup` - List contacts by follow-up
- `listByWallet` - List contacts by wallet

**Ticket Operations**:
- `create` - Create ticket
- `get` - Get ticket info
- `getAll` - Get all tickets for contact
- `updateInfo` - Update ticket information
- `setQueue` - Set ticket queue
- `setChatBot` - Set ticket chatbot
- `listMessages` - List ticket messages

**Channel Operations**:
- `getStatus` - Get channel status
- `getQrCode` - Get QR code for connection

**Admin Operations**:
- `createTenant` - Create new tenant
- `listTenants` - List all tenants
- `updateTenant` - Update tenant
- `addMonth` - Add month to subscription

### Key Implementation Points

1. **Use `requestWithAuthentication`** for all API calls
2. **Handle binary data** properly for file uploads
3. **Support multiple lookup methods** (number, contactId, ticketId)
4. **Implement proper error handling** with meaningful messages
5. **Use TypeScript interfaces** for type safety
6. **Follow n8n node conventions** strictly

---

## 8. Build and Publish Commands

### Development
```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Lint
npm run lint

# Format code
npm run format
```

### Publishing to npm
```bash
# Login to npm
npm login

# Publish
npm publish --access public
```

### Installation in n8n
```bash
# Via npm
npm install n8n-nodes-whazing

# Via n8n UI
Community Nodes > Install > n8n-nodes-whazing
```

---

## 9. Node Capabilities Summary

### Messaging Features
✅ Text messages  
✅ Media files (images, audio, video, documents)  
✅ Stickers  
✅ Location sharing  
✅ Interactive buttons (up to 3)  
✅ Interactive lists  
✅ WhatsApp Official templates  
✅ Link buttons  
✅ PIX payment buttons  
✅ Payment requests  

### Contact Management
✅ Create/update contacts  
✅ Get contact information  
✅ Validate WhatsApp numbers  
✅ CRM integration  
✅ Follow-up tracking  
✅ Tag management  
✅ Wallet assignment  
✅ Custom fields (extraInfo)  

### Ticket Management
✅ Create/update tickets  
✅ Assign to queues  
✅ Assign to users  
✅ ChatBot integration  
✅ Status management  
✅ Message history  

### Admin Features
✅ Multi-tenant management  
✅ Create tenants  
✅ Update subscriptions  
✅ Plan management  

---

## 10. Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Detailed error description"
}
```

### Implementation Example
```typescript
try {
  const response = await this.helpers.requestWithAuthentication.call(
    this,
    'whazingApi',
    options,
  );
  return response;
} catch (error) {
  if (error.statusCode === 401) {
    throw new NodeOperationError(
      this.getNode(),
      'Authentication failed. Please check your API token.',
    );
  }
  throw new NodeOperationError(
    this.getNode(),
    `Whazing API error: ${error.message}`,
  );
}
```

---

## Document End

**This specification is complete and ready for Cursor IDE to generate the full n8n community node implementation.**

All endpoints, parameters, and implementation patterns are documented with working TypeScript examples using real property names (not placeholders like 'exampleNode').