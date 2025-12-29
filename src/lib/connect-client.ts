import { createConnectTransport } from '@connectrpc/connect-web';
import { createPromiseClient } from '@connectrpc/connect';
import { OrgService } from '../gen/org_connect';

// Create transport for browser
const transport = createConnectTransport({
  baseUrl: 'http://localhost:3001',
  credentials: 'include', // Important: include cookies for auth
});

// Create typed client
export const orgClient = createPromiseClient(OrgService, transport);
