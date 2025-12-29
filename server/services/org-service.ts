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
