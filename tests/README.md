# API Testing with Hurl

Tests for the ConnectRPC organization service.

## Setup

1. **Copy environment template**
   ```bash
   cp tests/.env.example tests/.env
   ```

2. **Update `tests/.env` with your credentials**
   - Test user is already created: `test@example.com` / `test123456`
   - User ID is in the `.env.example` file

## Running Tests

```bash
# Start server first
pnpm dev:server

# Run tests
pnpm test:api
```

## What's Tested

**Organization CRUD** (`tests/api/orgs.hurl`)
- Authentication
- List/Create/Get/Update/Delete operations

## Troubleshooting

- **"Properties file does not exist"**: Copy `tests/.env.example` to `tests/.env`
- **404 errors**: Make sure server is running on port 3001
- **Auth failed**: Verify credentials in `tests/.env` match database
