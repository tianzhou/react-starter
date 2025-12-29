# ConnectRPC API Layer Design

**Date:** 2025-12-29
**Status:** Approved
**Scope:** Organization CRUD operations (proof of concept)

## Overview

Replace the existing REST API with ConnectRPC to provide both HTTP and gRPC support with spec-based definitions. This is a clean slate implementation - all existing REST endpoints will be removed.

## Architecture

```
Frontend (React + Vite, port 5173)
  ↓ Connect Protocol (HTTP/1.1 + JSON)
ConnectRPC Server (Node.js, port 3001)
  ↓ Drizzle ORM
PostgreSQL Database

Separate: Better-auth on Express (same port 3001)
  - Handles /api/auth/* routes
  - Session management remains unchanged
```

### Key Design Decisions

1. **Hybrid Server**: Single Express app serves both better-auth (unchanged) and ConnectRPC handlers
2. **Shared Codegen**: One generation step produces code used by both frontend and backend
3. **Connect Protocol**: HTTP/1.1 with JSON - no special proxies, works with existing CORS setup
4. **Direct DB Access**: Services call Drizzle directly - no intermediate layers
5. **React Query Integration**: Frontend uses TanStack Query for caching and state management

## Project Structure

```
react-starter/
├── proto/                          # Protocol Buffer definitions
│   ├── org.proto                   # Organization service + messages
│   └── buf.gen.yaml                # Code generation config
├── src/
│   ├── gen/                        # Generated TypeScript (shared)
│   │   ├── org_connect.ts          # Client & server interfaces
│   │   └── org_pb.ts               # Message types
│   ├── lib/
│   │   └── api-client.ts           # Configured Connect client instance
│   └── hooks/
│       └── use-orgs.ts             # React Query hooks
├── server/
│   ├── index.ts                    # Express app with both auth + Connect
│   ├── connect.ts                  # ConnectRPC route handlers
│   └── services/
│       └── org-service.ts          # Organization RPC implementations
```

## Protocol Definitions

### Organization Service (`proto/org.proto`)

```protobuf
syntax = "proto3";

package org.v1;

// Organization Service - handles org and membership operations
service OrgService {
  rpc ListOrgs(ListOrgsRequest) returns (ListOrgsResponse);
  rpc GetOrg(GetOrgRequest) returns (GetOrgResponse);
  rpc CreateOrg(CreateOrgRequest) returns (CreateOrgResponse);
  rpc UpdateOrg(UpdateOrgRequest) returns (UpdateOrgResponse);
  rpc DeleteOrg(DeleteOrgRequest) returns (DeleteOrgResponse);

  rpc ListMembers(ListMembersRequest) returns (ListMembersResponse);
  rpc AddMember(AddMemberRequest) returns (AddMemberResponse);
  rpc UpdateMemberRole(UpdateMemberRoleRequest) returns (UpdateMemberRoleResponse);
  rpc RemoveMember(RemoveMemberRequest) returns (RemoveMemberResponse);
}

// Core Types
message Org {
  string id = 1;
  string name = 2;
  string slug = 3;
  int64 created_at = 4;  // Unix timestamp
}

message OrgMember {
  string org_id = 1;
  string user_id = 2;
  string role = 3;  // "owner" | "admin" | "member"
  int64 joined_at = 4;
}

// Request/Response Messages
message ListOrgsRequest {}

message ListOrgsResponse {
  repeated Org orgs = 1;
}

message GetOrgRequest {
  string id = 1;
}

message GetOrgResponse {
  Org org = 1;
}

message CreateOrgRequest {
  string name = 1;
}

message CreateOrgResponse {
  Org org = 1;
}

message UpdateOrgRequest {
  string id = 1;
  string name = 2;
}

message UpdateOrgResponse {
  Org org = 1;
}

message DeleteOrgRequest {
  string id = 1;
}

message DeleteOrgResponse {}

message ListMembersRequest {
  string org_id = 1;
}

message ListMembersResponse {
  repeated OrgMember members = 1;
}

message AddMemberRequest {
  string org_id = 1;
  string user_id = 2;
  string role = 3;
}

message AddMemberResponse {
  OrgMember member = 1;
}

message UpdateMemberRoleRequest {
  string org_id = 1;
  string user_id = 2;
  string role = 3;
}

message UpdateMemberRoleResponse {
  OrgMember member = 1;
}

message RemoveMemberRequest {
  string org_id = 1;
  string user_id = 2;
}

message RemoveMemberResponse {}
```

### Code Generation (`proto/buf.gen.yaml`)

```yaml
version: v1
plugins:
  - plugin: es
    out: ../src/gen
    opt: target=ts
  - plugin: connect-es
    out: ../src/gen
    opt: target=ts
```

## Server Implementation

### Express Integration (`server/index.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import { auth } from '../src/lib/auth';
import { connectRouter } from './connect';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Better-auth routes (unchanged)
app.all(/^\/api\/auth\/.*/, async (req, res) => {
  // ... existing better-auth handler
});

// ConnectRPC routes
app.use('/api', connectRouter);

app.listen(3001);
```

### Connect Router (`server/connect.ts`)

```typescript
import { expressConnectMiddleware } from "@connectrpc/connect-express";
import { OrgService } from "./services/org-service";
import { orgServiceHandlers } from "./services/org-service";

export const connectRouter = expressConnectMiddleware({
  routes: (router) => {
    router.service(OrgService, orgServiceHandlers);
  },
});
```

### Service Implementation (`server/services/org-service.ts`)

```typescript
import { ConnectError, Code } from "@connectrpc/connect";
import type { ServiceImpl } from "@connectrpc/connect";
import { OrgService } from "../../src/gen/org_connect";
import { db, org, orgMember } from "../../src/db";
import { auth } from "../../src/lib/auth";
import { eq } from "drizzle-orm";

// Authentication helper
async function getUserFromContext(context): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: context.requestHeader
  });
  return session?.user?.id || null;
}

export const orgServiceHandlers: ServiceImpl<typeof OrgService> = {
  async listOrgs(req, context) {
    const userId = await getUserFromContext(context);
    if (!userId) throw new ConnectError("Unauthorized", Code.Unauthenticated);

    const userOrgs = await db
      .select({
        id: org.id,
        name: org.name,
        slug: org.slug,
        createdAt: org.createdAt,
      })
      .from(org)
      .innerJoin(orgMember, eq(org.id, orgMember.orgId))
      .where(eq(orgMember.userId, userId))
      .orderBy(org.name);

    return { orgs: userOrgs };
  },

  async getOrg(req, context) {
    const userId = await getUserFromContext(context);
    if (!userId) throw new ConnectError("Unauthorized", Code.Unauthenticated);

    if (!req.id) {
      throw new ConnectError("Organization ID required", Code.InvalidArgument);
    }

    const [result] = await db
      .select()
      .from(org)
      .where(eq(org.id, req.id));

    if (!result) {
      throw new ConnectError("Organization not found", Code.NotFound);
    }

    return { org: result };
  },

  async createOrg(req, context) {
    const userId = await getUserFromContext(context);
    if (!userId) throw new ConnectError("Unauthorized", Code.Unauthenticated);

    if (!req.name?.trim()) {
      throw new ConnectError("Name is required", Code.InvalidArgument);
    }

    // Generate slug
    const baseSlug = req.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create org
    const [newOrg] = await db
      .insert(org)
      .values({ name: req.name.trim(), slug })
      .returning();

    // Add user as owner
    await db.insert(orgMember).values({
      orgId: newOrg.id,
      userId: userId,
      role: 'owner',
    });

    return { org: newOrg };
  },

  async updateOrg(req, context) {
    const userId = await getUserFromContext(context);
    if (!userId) throw new ConnectError("Unauthorized", Code.Unauthenticated);

    if (!req.id) {
      throw new ConnectError("Organization ID required", Code.InvalidArgument);
    }
    if (!req.name?.trim()) {
      throw new ConnectError("Name is required", Code.InvalidArgument);
    }

    // Check membership and role
    const [member] = await db
      .select()
      .from(orgMember)
      .where(eq(orgMember.orgId, req.id))
      .where(eq(orgMember.userId, userId));

    if (!member) {
      throw new ConnectError("Organization not found", Code.NotFound);
    }
    if (member.role !== 'owner' && member.role !== 'admin') {
      throw new ConnectError("Permission denied", Code.PermissionDenied);
    }

    const [updated] = await db
      .update(org)
      .set({ name: req.name.trim() })
      .where(eq(org.id, req.id))
      .returning();

    return { org: updated };
  },

  async deleteOrg(req, context) {
    const userId = await getUserFromContext(context);
    if (!userId) throw new ConnectError("Unauthorized", Code.Unauthenticated);

    if (!req.id) {
      throw new ConnectError("Organization ID required", Code.InvalidArgument);
    }

    // Check ownership
    const [member] = await db
      .select()
      .from(orgMember)
      .where(eq(orgMember.orgId, req.id))
      .where(eq(orgMember.userId, userId));

    if (!member) {
      throw new ConnectError("Organization not found", Code.NotFound);
    }
    if (member.role !== 'owner') {
      throw new ConnectError("Only owners can delete organizations", Code.PermissionDenied);
    }

    // Delete members first (foreign key)
    await db.delete(orgMember).where(eq(orgMember.orgId, req.id));
    await db.delete(org).where(eq(org.id, req.id));

    return {};
  },

  // Member management methods would follow similar patterns
  async listMembers(req, context) { /* ... */ },
  async addMember(req, context) { /* ... */ },
  async updateMemberRole(req, context) { /* ... */ },
  async removeMember(req, context) { /* ... */ },
};
```

## Frontend Implementation

### API Client (`src/lib/api-client.ts`)

```typescript
import { createConnectTransport } from "@connectrpc/connect-web";
import { createPromiseClient } from "@connectrpc/connect";
import { OrgService } from "../gen/org_connect";

const transport = createConnectTransport({
  baseUrl: "http://localhost:3001/api",
  credentials: "include", // Send cookies for auth
});

export const orgClient = createPromiseClient(OrgService, transport);
```

### React Query Hooks (`src/hooks/use-orgs.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orgClient } from "../lib/api-client";

export function useOrgs() {
  return useQuery({
    queryKey: ["orgs"],
    queryFn: () => orgClient.listOrgs({}),
  });
}

export function useOrg(id: string) {
  return useQuery({
    queryKey: ["orgs", id],
    queryFn: () => orgClient.getOrg({ id }),
    enabled: !!id,
  });
}

export function useCreateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => orgClient.createOrg({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });
}

export function useUpdateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      orgClient.updateOrg({ id, name }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      queryClient.invalidateQueries({ queryKey: ["orgs", data.org.id] });
    },
  });
}

export function useDeleteOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orgClient.deleteOrg({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });
}
```

### React Query Provider (`src/main.tsx`)

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

### Component Usage Example

```typescript
import { useOrgs, useCreateOrg } from "../hooks/use-orgs";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Alert } from "./ui/alert";

function OrgList() {
  const { data, isLoading, error } = useOrgs();
  const createOrg = useCreateOrg();

  if (isLoading) return <Spinner />;
  if (error) return <Alert variant="error">{error.message}</Alert>;

  return (
    <div>
      {data.orgs.map(org => (
        <div key={org.id}>{org.name}</div>
      ))}
      <Button
        onClick={() => createOrg.mutate("New Organization")}
        disabled={createOrg.isPending}
      >
        Create Organization
      </Button>
    </div>
  );
}
```

## Error Handling

### Server Side

ConnectRPC uses standard error codes:

```typescript
import { ConnectError, Code } from "@connectrpc/connect";

// Authentication
throw new ConnectError("Unauthorized", Code.Unauthenticated);

// Authorization
throw new ConnectError("Permission denied", Code.PermissionDenied);

// Validation
throw new ConnectError("Name is required", Code.InvalidArgument);

// Not found
throw new ConnectError("Organization not found", Code.NotFound);

// Unexpected errors
throw new ConnectError("Internal error", Code.Internal);
```

### Frontend Side

React Query exposes errors automatically:

```typescript
const { data, error } = useOrgs();

if (error) {
  // ConnectError has .message and .code
  if (error.code === Code.Unauthenticated) {
    // Redirect to login
  }
  return <Alert>{error.message}</Alert>;
}
```

## Dependencies

### New Dependencies Required

**Protocol Buffers & Code Generation:**
```json
{
  "devDependencies": {
    "@bufbuild/buf": "^1.28.1",
    "@bufbuild/protoc-gen-es": "^1.6.0",
    "@connectrpc/protoc-gen-connect-es": "^1.2.0"
  }
}
```

**Server:**
```json
{
  "dependencies": {
    "@connectrpc/connect": "^1.2.0",
    "@connectrpc/connect-express": "^1.2.0"
  }
}
```

**Frontend:**
```json
{
  "dependencies": {
    "@connectrpc/connect-web": "^1.2.0",
    "@tanstack/react-query": "^5.17.0"
  }
}
```

### Build Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "gen": "buf generate proto",
    "dev": "pnpm gen && concurrently \"pnpm dev:vite\" \"pnpm dev:server\"",
    "build": "pnpm gen && tsc -b && vite build"
  }
}
```

## Migration Plan

### Phase 1: Setup (Clean Slate)

1. Install all dependencies
2. Create `proto/` directory structure
3. Write `org.proto` and `buf.gen.yaml`
4. Run `pnpm gen` and verify `src/gen/` output
5. Update `.gitignore` to track generated code

### Phase 2: Server Implementation

1. Create `server/services/org-service.ts` with all handlers
2. Create `server/connect.ts` router
3. Update `server/index.ts` to integrate Connect router
4. **Remove old REST endpoints** (`/api/orgs` GET and POST routes)
5. Keep better-auth routes unchanged

### Phase 3: Frontend Implementation

1. Setup React Query provider in `src/main.tsx`
2. Create `src/lib/api-client.ts`
3. Create all hooks in `src/hooks/use-orgs.ts`
4. Update components to use new hooks
5. Remove old fetch/axios org API calls

### Phase 4: Verification

1. Test org list, create, update, delete flows
2. Verify authentication still works (session cookies)
3. Verify CORS configuration works with Connect
4. Check error handling end-to-end

## What Gets Removed

- Old `/api/orgs` REST routes from `server/index.ts` (lines 145-212)
- Any existing fetch/axios org API calls in components
- Manual state management for org data (replaced by React Query)

## What Stays Unchanged

- Better-auth setup and all `/api/auth/*` routes
- Database schema (Drizzle ORM tables)
- Frontend routing and UI components
- Authentication flow and session management
- CORS and Express middleware configuration

## Development Workflow

1. Define/update `.proto` file
2. Run `pnpm gen` to regenerate TypeScript types
3. Implement service handler on server
4. Create/update React Query hook on frontend
5. Use hook in components
6. TypeScript ensures type safety across the stack

## Future Considerations

- Add more services (users, projects, etc.) following the same pattern
- Consider adding gRPC-Web transport for binary protobuf if performance needed
- Add request/response logging middleware
- Implement rate limiting on Connect routes
- Add integration tests when ready
