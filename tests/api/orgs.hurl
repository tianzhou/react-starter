# Organization API Tests
# Tests for org.v1.OrgService CRUD operations

# Load environment variables
# Create tests/.env with TEST_EMAIL, TEST_PASSWORD, TEST_USER_ID

# ============================================================
# 1. AUTHENTICATE
# ============================================================
POST http://localhost:3001/api/auth/sign-in/email
Content-Type: application/json
{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

HTTP 200
[Captures]
session_cookie: header "set-cookie" regex "better-auth\\.session_token=([^;]+)"

# ============================================================
# 2. LIST ORGANIZATIONS (before creating)
# ============================================================
POST http://localhost:3001/org.v1.OrgService/ListOrgs
Content-Type: application/json
Cookie: better_auth.session_token={{session_cookie}}
{}

HTTP 200
[Asserts]
jsonpath "$.orgs" exists
jsonpath "$.orgs" isCollection

# ============================================================
# 3. CREATE ORGANIZATION
# ============================================================
POST http://localhost:3001/org.v1.OrgService/CreateOrg
Content-Type: application/json
Cookie: better_auth.session_token={{session_cookie}}
{
  "name": "Test Organization"
}

HTTP 200
[Captures]
org_id: jsonpath "$.org.id"
[Asserts]
jsonpath "$.org.name" == "Test Organization"
jsonpath "$.org.id" exists

# ============================================================
# 4. GET ORGANIZATION
# ============================================================
POST http://localhost:3001/org.v1.OrgService/GetOrg
Content-Type: application/json
Cookie: better_auth.session_token={{session_cookie}}
{
  "id": "{{org_id}}"
}

HTTP 200
[Asserts]
jsonpath "$.org.id" == "{{org_id}}"
jsonpath "$.org.name" == "Test Organization"

# ============================================================
# 5. LIST ORGANIZATIONS (after creating)
# ============================================================
POST http://localhost:3001/org.v1.OrgService/ListOrgs
Content-Type: application/json
Cookie: better_auth.session_token={{session_cookie}}
{}

HTTP 200
[Asserts]
jsonpath "$.orgs" exists
jsonpath "$.orgs" isCollection
# Should contain our newly created org

# ============================================================
# 6. UPDATE ORGANIZATION
# ============================================================
POST http://localhost:3001/org.v1.OrgService/UpdateOrg
Content-Type: application/json
Cookie: better_auth.session_token={{session_cookie}}
{
  "id": "{{org_id}}",
  "name": "Updated Test Organization"
}

HTTP 200
[Asserts]
jsonpath "$.org.id" == "{{org_id}}"
jsonpath "$.org.name" == "Updated Test Organization"

# ============================================================
# 7. GET UPDATED ORGANIZATION
# ============================================================
POST http://localhost:3001/org.v1.OrgService/GetOrg
Content-Type: application/json
Cookie: better_auth.session_token={{session_cookie}}
{
  "id": "{{org_id}}"
}

HTTP 200
[Asserts]
jsonpath "$.org.id" == "{{org_id}}"
jsonpath "$.org.name" == "Updated Test Organization"

# ============================================================
# 8. DELETE ORGANIZATION
# ============================================================
POST http://localhost:3001/org.v1.OrgService/DeleteOrg
Content-Type: application/json
Cookie: better_auth.session_token={{session_cookie}}
{
  "id": "{{org_id}}"
}

HTTP 200

# ============================================================
# 9. VERIFY DELETION (should fail or return nothing)
# ============================================================
POST http://localhost:3001/org.v1.OrgService/GetOrg
Content-Type: application/json
Cookie: better_auth.session_token={{session_cookie}}
{
  "id": "{{org_id}}"
}

HTTP 404
