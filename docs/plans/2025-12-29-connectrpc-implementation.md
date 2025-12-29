# ConnectRPC API Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement ConnectRPC API layer replacing REST endpoints with spec-based gRPC/HTTP services for organization CRUD operations.

**Architecture:** Hybrid Express server serving both better-auth (unchanged) and ConnectRPC handlers. Protocol buffers define services, shared TypeScript codegen for frontend/backend. React Query for client-side caching.

**Tech Stack:** ConnectRPC, Buf CLI, Protocol Buffers, @connectrpc/connect-express, @connectrpc/connect-web, TanStack React Query

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install ConnectRPC and Buf dependencies**

Run:
```bash
pnpm add @connectrpc/connect @connectrpc/connect-express @connectrpc/connect-web @tanstack/react-query
```

Expected: Dependencies added to `package.json` and installed

**Step 2: Install Buf and codegen tools as dev dependencies**

Run:
```bash
pnpm add -D @bufbuild/buf @bufbuild/protoc-gen-es @connectrpc/protoc-gen-connect-es
```

Expected: Dev dependencies added and installed

**Step 3: Verify installations**

Run:
```bash
pnpm list @connectrpc/connect @tanstack/react-query @bufbuild/buf
```

Expected: All packages listed with versions

**Step 4: Commit dependency changes**

Run:
```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add ConnectRPC and React Query dependencies

Add @connectrpc packages for server/client RPC implementation
Add @tanstack/react-query for client-side data fetching
Add Buf CLI and codegen tools for Protocol Buffer compilation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit with dependency changes

---

## Task 2: Setup Protocol Buffer Structure

**Files:**
- Create: `proto/org.proto`
- Create: `proto/buf.gen.yaml`
- Create: `proto/buf.yaml`
- Modify: `.gitignore`

**Step 1: Create proto directory**

Run:
```bash
mkdir -p proto
```

Expected: `proto/` directory created

**Step 2: Write org.proto**

Create `proto/org.proto`:

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
  string created_at = 4;  // ISO 8601 timestamp string
}

message OrgMember {
  string org_id = 1;
  string user_id = 2;
  string role = 3;  // "owner" | "admin" | "developer"
  string joined_at = 4;  // ISO 8601 timestamp string
}

// List Orgs
message ListOrgsRequest {}

message ListOrgsResponse {
  repeated Org orgs = 1;
}

// Get Org
message GetOrgRequest {
  string id = 1;
}

message GetOrgResponse {
  Org org = 1;
}

// Create Org
message CreateOrgRequest {
  string name = 1;
}

message CreateOrgResponse {
  Org org = 1;
}

// Update Org
message UpdateOrgRequest {
  string id = 1;
  string name = 2;
}

message UpdateOrgResponse {
  Org org = 1;
}

// Delete Org
message DeleteOrgRequest {
  string id = 1;
}

message DeleteOrgResponse {}

// List Members
message ListMembersRequest {
  string org_id = 1;
}

message ListMembersResponse {
  repeated OrgMember members = 1;
}

// Add Member
message AddMemberRequest {
  string org_id = 1;
  string user_id = 2;
  string role = 3;
}

message AddMemberResponse {
  OrgMember member = 1;
}

// Update Member Role
message UpdateMemberRoleRequest {
  string org_id = 1;
  string user_id = 2;
  string role = 3;
}

message UpdateMemberRoleResponse {
  OrgMember member = 1;
}

// Remove Member
message RemoveMemberRequest {
  string org_id = 1;
  string user_id = 2;
}

message RemoveMemberResponse {}
```

**Step 3: Write buf.gen.yaml**

Create `proto/buf.gen.yaml`:

```yaml
version: v2
plugins:
  - remote: buf.build/bufbuild/es
    out: ../src/gen
    opt: target=ts
  - remote: buf.build/connectrpc/es
    out: ../src/gen
    opt: target=ts
```

**Step 4: Write buf.yaml**

Create `proto/buf.yaml`:

```yaml
version: v2
modules:
  - path: .
lint:
  use:
    - STANDARD
breaking:
  use:
    - FILE
```

**Step 5: Add src/gen to .gitignore**

Append to `.gitignore`:

```
# Generated code
src/gen/
```

**Step 6: Commit proto setup**

Run:
```bash
git add proto/ .gitignore
git commit -m "feat: add Protocol Buffer definitions for OrgService

Define OrgService with 9 RPCs for org and member management
Configure Buf for TypeScript code generation to src/gen/

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit with proto files

---

## Task 3: Generate TypeScript Code

**Files:**
- Modify: `package.json` (add scripts)
- Create: `src/gen/*` (generated)

**Step 1: Add gen script to package.json**

Update `package.json` scripts section:

```json
{
  "scripts": {
    "gen": "buf generate proto",
    "dev": "pnpm gen && concurrently \"pnpm dev:vite\" \"pnpm dev:server\"",
    "dev:vite": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "pnpm gen && tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Step 2: Run code generation**

Run:
```bash
pnpm gen
```

Expected: Files created in `src/gen/`:
- `org_pb.ts` (message types)
- `org_connect.ts` (service interfaces)

**Step 3: Verify generated code**

Run:
```bash
ls -la src/gen/
```

Expected: Two TypeScript files present

**Step 4: Commit script changes**

Run:
```bash
git add package.json
git commit -m "build: add code generation scripts

Add 'gen' script to run Buf codegen
Update 'dev' and 'build' to run codegen first

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 4: Implement Server - Authentication Helper

**Files:**
- Create: `server/services/org-service.ts`

**Step 1: Create services directory**

Run:
```bash
mkdir -p server/services
```

Expected: Directory created

**Step 2: Write auth helper in org-service.ts**

Create `server/services/org-service.ts`:

```typescript
import { ConnectError, Code } from "@connectrpc/connect";
import type { ServiceImpl } from "@connectrpc/connect";
import type { HandlerContext } from "@connectrpc/connect";
import { OrgService } from "../../src/gen/org_connect";
import { db, org, orgMember } from "../../src/db";
import { auth } from "../../src/lib/auth";
import { eq, and } from "drizzle-orm";

/**
 * Extract authenticated user ID from request context
 * Uses better-auth session cookies via headers
 */
async function getUserFromContext(context: HandlerContext): Promise<string | null> {
  try {
    const session = await auth.api.getSession({
      headers: context.requestHeader as any,
    });
    return session?.user?.id || null;
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

// Placeholder handlers - will implement in next tasks
export const orgServiceHandlers: ServiceImpl<typeof OrgService> = {
  async listOrgs(req, context) {
    throw new ConnectError("Not implemented", Code.Unimplemented);
  },
  async getOrg(req, context) {
    throw new ConnectError("Not implemented", Code.Unimplemented);
  },
  async createOrg(req, context) {
    throw new ConnectError("Not implemented", Code.Unimplemented);
  },
  async updateOrg(req, context) {
    throw new ConnectError("Not implemented", Code.Unimplemented);
  },
  async deleteOrg(req, context) {
    throw new ConnectError("Not implemented", Code.Unimplemented);
  },
  async listMembers(req, context) {
    throw new ConnectError("Not implemented", Code.Unimplemented);
  },
  async addMember(req, context) {
    throw new ConnectError("Not implemented", Code.Unimplemented);
  },
  async updateMemberRole(req, context) {
    throw new ConnectError("Not implemented", Code.Unimplemented);
  },
  async removeMember(req, context) {
    throw new ConnectError("Not implemented", Code.Unimplemented);
  },
};
```

**Step 3: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No TypeScript errors

**Step 4: Commit auth helper**

Run:
```bash
git add server/services/org-service.ts
git commit -m "feat(server): add auth helper and service skeleton

Add getUserFromContext to extract session from request headers
Create placeholder handlers for all 9 OrgService RPCs

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 5: Implement Server - ListOrgs RPC

**Files:**
- Modify: `server/services/org-service.ts:24-26`

**Step 1: Implement listOrgs handler**

Replace the listOrgs handler in `server/services/org-service.ts`:

```typescript
async listOrgs(req, context) {
  const userId = await getUserFromContext(context);
  if (!userId) {
    throw new ConnectError("Unauthorized", Code.Unauthenticated);
  }

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

  return {
    orgs: userOrgs.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      createdAt: o.createdAt.toISOString(),
    })),
  };
},
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit listOrgs implementation**

Run:
```bash
git add server/services/org-service.ts
git commit -m "feat(server): implement ListOrgs RPC

Query orgs user is member of, return with ISO timestamp

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 6: Implement Server - CreateOrg RPC

**Files:**
- Modify: `server/services/org-service.ts:35-37`

**Step 1: Implement createOrg handler**

Replace the createOrg handler:

```typescript
async createOrg(req, context) {
  const userId = await getUserFromContext(context);
  if (!userId) {
    throw new ConnectError("Unauthorized", Code.Unauthenticated);
  }

  if (!req.name?.trim()) {
    throw new ConnectError("Name is required", Code.InvalidArgument);
  }

  // Generate slug from name
  const baseSlug = req.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
    role: "owner",
  });

  return {
    org: {
      id: newOrg.id,
      name: newOrg.name,
      slug: newOrg.slug,
      createdAt: newOrg.createdAt.toISOString(),
    },
  };
},
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit createOrg implementation**

Run:
```bash
git add server/services/org-service.ts
git commit -m "feat(server): implement CreateOrg RPC

Validate name, generate unique slug, create org and owner membership

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 7: Implement Server - GetOrg RPC

**Files:**
- Modify: `server/services/org-service.ts:28-30`

**Step 1: Implement getOrg handler**

Replace the getOrg handler:

```typescript
async getOrg(req, context) {
  const userId = await getUserFromContext(context);
  if (!userId) {
    throw new ConnectError("Unauthorized", Code.Unauthenticated);
  }

  if (!req.id) {
    throw new ConnectError("Organization ID required", Code.InvalidArgument);
  }

  // Verify user is member of org
  const [member] = await db
    .select()
    .from(orgMember)
    .where(and(eq(orgMember.orgId, req.id), eq(orgMember.userId, userId)));

  if (!member) {
    throw new ConnectError("Organization not found", Code.NotFound);
  }

  const [result] = await db.select().from(org).where(eq(org.id, req.id));

  if (!result) {
    throw new ConnectError("Organization not found", Code.NotFound);
  }

  return {
    org: {
      id: result.id,
      name: result.name,
      slug: result.slug,
      createdAt: result.createdAt.toISOString(),
    },
  };
},
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit getOrg implementation**

Run:
```bash
git add server/services/org-service.ts
git commit -m "feat(server): implement GetOrg RPC

Verify membership before returning org details

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 8: Implement Server - UpdateOrg RPC

**Files:**
- Modify: `server/services/org-service.ts:39-41`

**Step 1: Implement updateOrg handler**

Replace the updateOrg handler:

```typescript
async updateOrg(req, context) {
  const userId = await getUserFromContext(context);
  if (!userId) {
    throw new ConnectError("Unauthorized", Code.Unauthenticated);
  }

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
    .where(and(eq(orgMember.orgId, req.id), eq(orgMember.userId, userId)));

  if (!member) {
    throw new ConnectError("Organization not found", Code.NotFound);
  }
  if (member.role !== "owner" && member.role !== "admin") {
    throw new ConnectError("Permission denied", Code.PermissionDenied);
  }

  const [updated] = await db
    .update(org)
    .set({ name: req.name.trim() })
    .where(eq(org.id, req.id))
    .returning();

  return {
    org: {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      createdAt: updated.createdAt.toISOString(),
    },
  };
},
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit updateOrg implementation**

Run:
```bash
git add server/services/org-service.ts
git commit -m "feat(server): implement UpdateOrg RPC

Verify owner/admin role before allowing name updates

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 9: Implement Server - DeleteOrg RPC

**Files:**
- Modify: `server/services/org-service.ts:43-45`

**Step 1: Implement deleteOrg handler**

Replace the deleteOrg handler:

```typescript
async deleteOrg(req, context) {
  const userId = await getUserFromContext(context);
  if (!userId) {
    throw new ConnectError("Unauthorized", Code.Unauthenticated);
  }

  if (!req.id) {
    throw new ConnectError("Organization ID required", Code.InvalidArgument);
  }

  // Check ownership
  const [member] = await db
    .select()
    .from(orgMember)
    .where(and(eq(orgMember.orgId, req.id), eq(orgMember.userId, userId)));

  if (!member) {
    throw new ConnectError("Organization not found", Code.NotFound);
  }
  if (member.role !== "owner") {
    throw new ConnectError(
      "Only owners can delete organizations",
      Code.PermissionDenied
    );
  }

  // Delete members first (foreign key constraint)
  await db.delete(orgMember).where(eq(orgMember.orgId, req.id));
  await db.delete(org).where(eq(org.id, req.id));

  return {};
},
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit deleteOrg implementation**

Run:
```bash
git add server/services/org-service.ts
git commit -m "feat(server): implement DeleteOrg RPC

Verify owner role, delete members then org (cascade)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 10: Implement Server - Member RPCs (Stubs)

**Files:**
- Modify: `server/services/org-service.ts:47-58`

**Step 1: Implement member management stubs**

Replace the four member handlers with basic implementations:

```typescript
async listMembers(req, context) {
  const userId = await getUserFromContext(context);
  if (!userId) {
    throw new ConnectError("Unauthorized", Code.Unauthenticated);
  }

  if (!req.orgId) {
    throw new ConnectError("Organization ID required", Code.InvalidArgument);
  }

  // Verify user is member
  const [member] = await db
    .select()
    .from(orgMember)
    .where(and(eq(orgMember.orgId, req.orgId), eq(orgMember.userId, userId)));

  if (!member) {
    throw new ConnectError("Organization not found", Code.NotFound);
  }

  const members = await db
    .select()
    .from(orgMember)
    .where(eq(orgMember.orgId, req.orgId));

  return {
    members: members.map((m) => ({
      orgId: m.orgId,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    })),
  };
},

async addMember(req, context) {
  throw new ConnectError("Not implemented yet", Code.Unimplemented);
},

async updateMemberRole(req, context) {
  throw new ConnectError("Not implemented yet", Code.Unimplemented);
},

async removeMember(req, context) {
  throw new ConnectError("Not implemented yet", Code.Unimplemented);
},
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit member RPC stubs**

Run:
```bash
git add server/services/org-service.ts
git commit -m "feat(server): implement ListMembers, stub other member RPCs

ListMembers verifies membership and returns org members
Other member RPCs stubbed for future implementation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 11: Create Connect Router

**Files:**
- Create: `server/connect.ts`

**Step 1: Write connect router**

Create `server/connect.ts`:

```typescript
import { expressConnectMiddleware } from "@connectrpc/connect-express";
import { OrgService } from "../src/gen/org_connect";
import { orgServiceHandlers } from "./services/org-service";

/**
 * ConnectRPC router - registers all RPC services
 * Integrated into Express via middleware
 */
export const connectRouter = expressConnectMiddleware({
  routes: (router) => {
    router.service(OrgService, orgServiceHandlers);
  },
});
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit connect router**

Run:
```bash
git add server/connect.ts
git commit -m "feat(server): create ConnectRPC router

Register OrgService handlers with expressConnectMiddleware

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 12: Integrate Connect Router into Express

**Files:**
- Modify: `server/index.ts:40,125-212`

**Step 1: Import connect router**

Add import at top of `server/index.ts`:

```typescript
import { connectRouter } from './connect';
```

**Step 2: Add Connect middleware**

Add after the auth handler (around line 125), before `app.listen`:

```typescript
/**
 * ConnectRPC Routes
 *
 * All routes matching /api/* (except /api/auth/*) are handled by ConnectRPC
 * This provides both HTTP and gRPC support with type-safe Protocol Buffer definitions
 */
app.use('/api', connectRouter);
```

**Step 3: Remove old REST endpoints**

Delete lines 145-212 (the `/api/orgs` GET and POST handlers and helper function)

**Step 4: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 5: Test server starts**

Run:
```bash
pnpm dev:server
```

Expected: Server starts without errors on port 3001

Press Ctrl+C to stop

**Step 6: Commit Express integration**

Run:
```bash
git add server/index.ts
git commit -m "feat(server): integrate ConnectRPC router, remove REST endpoints

Add Connect middleware at /api route
Remove old /api/orgs REST handlers
Keep better-auth routes unchanged

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 13: Create Frontend API Client

**Files:**
- Create: `src/lib/api-client.ts`

**Step 1: Write API client**

Create `src/lib/api-client.ts`:

```typescript
import { createConnectTransport } from "@connectrpc/connect-web";
import { createPromiseClient } from "@connectrpc/connect";
import { OrgService } from "../gen/org_connect";

/**
 * ConnectRPC transport configuration
 * Uses Connect protocol (HTTP/1.1 + JSON) with credentials for auth cookies
 */
const transport = createConnectTransport({
  baseUrl: import.meta.env.VITE_SERVER_URL + "/api",
  credentials: "include", // Send session cookies
});

/**
 * Typed client for OrgService RPCs
 * All methods return Promises with type-safe request/response objects
 */
export const orgClient = createPromiseClient(OrgService, transport);
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit API client**

Run:
```bash
git add src/lib/api-client.ts
git commit -m "feat(client): create ConnectRPC API client

Configure transport with VITE_SERVER_URL and credentials
Export typed orgClient for OrgService RPCs

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 14: Setup React Query Provider

**Files:**
- Modify: `src/main.tsx`

**Step 1: Update main.tsx with React Query**

Replace contents of `src/main.tsx`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

/**
 * React Query client configuration
 * Manages server state caching and synchronization
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: true, // Refetch on tab focus
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit React Query setup**

Run:
```bash
git add src/main.tsx
git commit -m "feat(client): setup React Query provider

Configure QueryClient with 1min stale time and refetch on focus
Wrap App with QueryClientProvider

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 15: Create React Query Hooks

**Files:**
- Create: `src/hooks/use-orgs.ts`

**Step 1: Create hooks directory**

Run:
```bash
mkdir -p src/hooks
```

Expected: Directory created

**Step 2: Write use-orgs.ts**

Create `src/hooks/use-orgs.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orgClient } from "../lib/api-client";

/**
 * Query hook for listing all orgs the current user is a member of
 */
export function useOrgs() {
  return useQuery({
    queryKey: ["orgs"],
    queryFn: () => orgClient.listOrgs({}),
  });
}

/**
 * Query hook for getting a single org by ID
 */
export function useOrg(id: string) {
  return useQuery({
    queryKey: ["orgs", id],
    queryFn: () => orgClient.getOrg({ id }),
    enabled: !!id, // Only run if ID is provided
  });
}

/**
 * Mutation hook for creating a new org
 * Invalidates orgs list on success
 */
export function useCreateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => orgClient.createOrg({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });
}

/**
 * Mutation hook for updating an org
 * Invalidates both list and individual org queries on success
 */
export function useUpdateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      orgClient.updateOrg({ id, name }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      if (data.org) {
        queryClient.invalidateQueries({ queryKey: ["orgs", data.org.id] });
      }
    },
  });
}

/**
 * Mutation hook for deleting an org
 * Invalidates orgs list on success
 */
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

**Step 3: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 4: Commit React Query hooks**

Run:
```bash
git add src/hooks/use-orgs.ts
git commit -m "feat(client): create React Query hooks for org operations

Add useOrgs, useOrg, useCreateOrg, useUpdateOrg, useDeleteOrg
All hooks auto-invalidate queries on mutations

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 16: Update OrgSwitcher Component

**Files:**
- Modify: `src/components/OrgSwitcher.tsx`

**Step 1: Replace OrgSwitcher with React Query version**

Replace entire contents of `src/components/OrgSwitcher.tsx`:

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Plus } from 'lucide-react'
import { Menu, MenuTrigger, MenuPopup, MenuItem, MenuSeparator } from './ui/menu'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useOrgs, useCreateOrg } from '../hooks/use-orgs'

interface OrgSwitcherProps {
  currentOrgSlug: string
  onOrgChange: (slug: string) => void
}

export default function OrgSwitcher({ currentOrgSlug, onOrgChange }: OrgSwitcherProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const navigate = useNavigate()

  // Use React Query hooks
  const { data, isLoading } = useOrgs()
  const createOrg = useCreateOrg()

  const orgs = data?.orgs || []
  const currentOrg = orgs.find((org) => org.slug === currentOrgSlug)

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!newOrgName.trim() || createOrg.isPending) return

    try {
      const result = await createOrg.mutateAsync(newOrgName.trim())
      setCreateDialogOpen(false)
      setNewOrgName('')
      // Navigate to new org
      if (result.org) {
        navigate(`/org/${result.org.slug}`)
      }
    } catch (error) {
      console.error('Failed to create org:', error)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => {
          if (currentOrgSlug) {
            navigate(`/org/${currentOrgSlug}`)
          }
        }}
        className="text-sm font-medium hover:text-gray-600 transition-colors"
      >
        {isLoading ? '...' : currentOrg?.name || currentOrgSlug}
      </button>

      <Menu>
        <MenuTrigger>
          <Button variant="ghost" size="icon-sm" aria-label="Switch organization" className="hover:bg-gray-200">
            <ChevronDown size={14} />
          </Button>
        </MenuTrigger>
        <MenuPopup>
          {orgs.map((org) => (
            <MenuItem
              key={org.id}
              onSelect={() => onOrgChange(org.slug)}
              className={currentOrgSlug === org.slug ? 'bg-gray-100' : ''}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{org.name}</span>
              </div>
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem
            onSelect={(e) => {
              e.preventDefault()
              setCreateDialogOpen(true)
            }}
          >
            <Plus size={16} className="mr-2" />
            Create new organization
          </MenuItem>
        </MenuPopup>
      </Menu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Acme Inc"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newOrgName.trim() || createOrg.isPending}>
                {createOrg.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: No errors

**Step 3: Commit OrgSwitcher update**

Run:
```bash
git add src/components/OrgSwitcher.tsx
git commit -m "refactor(client): migrate OrgSwitcher to React Query

Replace manual fetch calls with useOrgs and useCreateOrg hooks
Remove local state management, use React Query cache
Remove role display (not in ConnectRPC response yet)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 17: Test End-to-End Flow

**Files:**
- None (manual testing)

**Step 1: Start development servers**

Run:
```bash
pnpm dev
```

Expected:
- Code generation runs successfully
- Vite dev server starts on port 5173
- Express server starts on port 3001

**Step 2: Open browser and test**

1. Navigate to `http://localhost:5173`
2. Sign in with existing account
3. Verify org list loads in OrgSwitcher
4. Click "+ Create new organization"
5. Enter name and submit
6. Verify new org appears in list
7. Switch between orgs

Expected: All operations work without errors

**Step 3: Check browser console**

Expected: No errors (ConnectRPC requests to `/api/org.v1.OrgService/*`)

**Step 4: Check server console**

Expected: No errors, requests logged

**Step 5: Stop servers**

Press Ctrl+C

---

## Task 18: Update .gitignore for Generated Code

**Files:**
- Modify: `.gitignore`

**Step 1: Verify src/gen is ignored**

Run:
```bash
grep "src/gen" .gitignore
```

Expected: Line present from Task 2

**Step 2: Add buf cache to .gitignore**

Append to `.gitignore`:

```
# Buf cache
.buf/
```

**Step 3: Commit .gitignore update**

Run:
```bash
git add .gitignore
git commit -m "chore: ignore Buf cache directory

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 19: Final Verification and Cleanup

**Files:**
- None (verification only)

**Step 1: Verify all code compiles**

Run:
```bash
pnpm build
```

Expected: Build succeeds with no errors

**Step 2: Verify no old REST code remains**

Run:
```bash
grep -r "fetch.*\/api\/orgs" src/
```

Expected: Only OrgSwitcher.tsx references removed (now using hooks)

**Step 3: Check git status**

Run:
```bash
git status
```

Expected: Working directory clean (all changes committed)

**Step 4: Review commit history**

Run:
```bash
git log --oneline -20
```

Expected: ~18 commits for ConnectRPC implementation

---

## Summary

**What was implemented:**
- Protocol Buffer definitions for OrgService (9 RPCs)
- TypeScript code generation with Buf CLI
- Server-side ConnectRPC handlers for org CRUD operations
- Express integration with Connect middleware
- Frontend Connect client with React Query integration
- Migration from REST to ConnectRPC for all org operations

**What works:**
- List, create, get, update, delete organizations
- Authentication via better-auth session cookies
- Type-safe API calls with protobuf-generated types
- Automatic caching and invalidation with React Query

**What's stubbed (for future work):**
- AddMember, UpdateMemberRole, RemoveMember RPCs (return Unimplemented)

**What was removed:**
- Old REST endpoints: GET/POST `/api/orgs`
- Manual fetch calls in components
- Local state management for org data

**What stayed unchanged:**
- Better-auth routes and session management
- Database schema and Drizzle ORM
- Frontend routing and UI components
- CORS configuration
