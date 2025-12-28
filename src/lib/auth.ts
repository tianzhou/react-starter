import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, org, orgMember, project } from "@/db";

/**
 * Creates a personal org and default project for a new user
 */
async function createPersonalOrg(userId: string, userName: string) {
  try {
    // Generate a unique slug from the user's name
    const baseSlug = userName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Add timestamp suffix to ensure uniqueness
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create the org
    const [newOrg] = await db
      .insert(org)
      .values({
        name: `${userName}'s Org`,
        slug: slug,
      })
      .returning();

    // Add the user as the owner
    await db.insert(orgMember).values({
      orgId: newOrg.id,
      userId: userId,
      role: "owner",
    });

    // Create a default project
    await db.insert(project).values({
      orgId: newOrg.id,
      name: "Default Project",
      slug: "default",
      description: "Your first project",
    });

    console.log(`Created personal org and default project for user ${userId}: ${newOrg.id}`);
  } catch (error) {
    console.error("Failed to create personal org:", error);
    // Don't throw - we don't want to block user signup if org creation fails
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    password: {
      validate: (password: string) => {
        // Must have at least 8 characters
        if (password.length < 8) {
          return {
            valid: false,
            message: "Password must be at least 8 characters",
          };
        }
        // Must have a number
        if (!/\d/.test(password)) {
          return {
            valid: false,
            message: "Password must contain a number (0-9)",
          };
        }
        return { valid: true };
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:5173",
  ],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create a personal org for the new user
          await createPersonalOrg(user.id, user.name);
        },
      },
    },
  },
});
