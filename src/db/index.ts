import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as authSchema from './auth-schema';
import * as appSchema from './schema';

// Combine all schemas
const schema = {
  ...authSchema,
  ...appSchema,
};

// Ensure DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection
// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  // Debug connection issues (remove in production)
  onnotice: () => {}, // Ignore notices
});

export const db = drizzle(client, { schema });

// Re-export all schemas for easy imports
export * from './auth-schema';
export * from './schema';
