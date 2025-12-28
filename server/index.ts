/**
 * Backend API Server
 *
 * This is the backend server that handles authentication and database operations.
 *
 * ARCHITECTURE:
 * Frontend (React on port 5173)
 *   ↓ HTTP requests
 * Backend Server (Express on port 3001)
 *   ↓ Database queries via Drizzle ORM
 * PostgreSQL Database
 *
 * WHY A SEPARATE SERVER?
 * - React (Vite) runs in the browser and cannot directly connect to PostgreSQL
 * - Databases need server-side connections for security (credentials, connection pooling)
 * - Better-auth requires server-side session management and OAuth callbacks
 *
 * CURRENT ROUTES:
 * - /api/auth/* - All authentication endpoints (login, logout, OAuth, session, etc.)
 *                 Handled by better-auth library
 *
 * DATABASE ACCESS:
 * - Better-auth automatically manages auth tables (user, session, account, verification)
 * - For custom queries, you can import { db } from '../src/db' and use Drizzle ORM
 * - Example: const users = await db.select().from(user)
 *
 * ADDING YOUR OWN API ROUTES:
 * app.get('/api/todos', async (req, res) => {
 *   const todos = await db.select().from(todosTable);
 *   res.json(todos);
 * });
 */

// Load environment variables from .env file
import 'dotenv/config';

import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { auth } from '../src/lib/auth';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS to allow frontend (port 5173) to make requests to this server (port 3001)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies for session management
}));

// Parse JSON request bodies
app.use(express.json());

/**
 * Converts Express Request to Web API Request
 *
 * Better-auth expects Web API Request/Response objects (standard browser API)
 * but Express uses Node.js req/res objects. This function bridges the gap.
 */
function toWebRequest(req: Request): Request {
  const protocol = req.protocol;
  const host = req.get('host');
  const url = new URL(req.url, `${protocol}://${host}`);

  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value[0] : value);
    }
  });

  return new Request(url, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  }) as any;
}

/**
 * Authentication API Routes
 *
 * All routes matching /api/auth/* are handled by better-auth
 * This includes:
 * - POST /api/auth/sign-in/social - OAuth sign in (GitHub, Google, etc.)
 * - POST /api/auth/sign-in/email - Email/password sign in
 * - POST /api/auth/sign-out - Sign out
 * - GET  /api/auth/session - Get current session
 * - GET  /api/auth/callback/github - GitHub OAuth callback
 *
 * Better-auth automatically handles database operations for these routes
 * using the Drizzle adapter configured in src/lib/auth.ts
 */
app.all(/^\/api\/auth\/.*/, async (req: Request, res: Response) => {
  try {
    const webRequest = toWebRequest(req);
    const response = await auth.handler(webRequest);

    // Copy headers from Web Response to Express response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Handle redirects properly
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      if (location) {
        // If the redirect is to a relative path, redirect to frontend
        if (location.startsWith('/')) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          return res.redirect(response.status, `${frontendUrl}${location}`);
        }
        return res.redirect(response.status, location);
      }
    }

    // Set status and send body
    res.status(response.status);
    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('Auth handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Add your custom API routes here
 *
 * Example:
 * import { db } from '../src/db';
 * import { user } from '../src/db/schema';
 *
 * app.get('/api/users', async (req, res) => {
 *   const users = await db.select().from(user);
 *   res.json(users);
 * });
 */

app.listen(port, () => {
  console.log(`Auth server running on http://localhost:${port}`);
});
