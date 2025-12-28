import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

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
  },
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:5173",
  ],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
});
