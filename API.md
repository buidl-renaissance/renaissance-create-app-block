# Renaissance City API Documentation

Base URL: `/api`

## Authentication

Most endpoints require authentication via session cookie (`user_session`). The cookie is set automatically after login/registration.

---

## Auth Endpoints

### Register User
Create a new user account with email.

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string (required) - Letters, numbers, underscores only",
  "name": "string (required) - Display name",
  "email": "string (required) - Valid email address",
  "phone": "string (optional) - Phone number",
  "pendingUserData": {
    "renaissanceId": "string (optional)",
    "accountAddress": "string (optional)",
    "pfpUrl": "string (optional)"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "string",
    "displayName": "string",
    "email": "string",
    "phone": "string | null",
    "accountAddress": "string | null",
    "role": "user | organizer | admin"
  }
}
```

**Errors:**
- `400` - Validation error (missing fields, invalid format)
- `409` - Email or username already exists

---

### Phone Login (Two-Step)
Login with phone number and PIN.

```
POST /api/auth/phone-login
```

**Step 1 - Check user status:**
```json
{
  "phone": "string (required)"
}
```

**Response:**
```json
{
  "requiresPin": true,
  "hasPin": true,
  "userId": "uuid"
}
```

**Step 2 - Verify PIN:**
```json
{
  "phone": "string (required)",
  "pin": "string (required) - 4-digit PIN"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

**Errors:**
- `401` - Invalid PIN (includes attempts remaining)
- `404` - No account found
- `423` - Account locked

---

### Send Verification Code
Send email verification code for login.

```
POST /api/auth/send-code
```

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

**Errors:**
- `404` - No account found with this email

---

### Verify Code
Verify email code and login.

```
POST /api/auth/verify-code
```

**Request Body:**
```json
{
  "email": "string (required)",
  "code": "string (required) - 6-digit code"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

### Set PIN
Set a 4-digit PIN for an account.

```
POST /api/auth/set-pin
```

**Request Body:**
```json
{
  "userId": "string (required)",
  "pin": "string (required) - 4-digit PIN"
}
```

---

### Logout
Log out the current user.

```
POST /api/auth/logout
```

**Response (200):**
```json
{
  "success": true
}
```

---

## User Endpoints

### Get Current User
Get the authenticated user's profile.

```
GET /api/user/me
```

**Query Params (optional):**
- `renaissanceUserId` - Look up by Renaissance ID
- `userId` - Look up by user ID

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "renaissanceId": "string | null",
    "username": "string | null",
    "name": "string | null",
    "displayName": "string | null",
    "pfpUrl": "string | null",
    "profilePicture": "string | null",
    "accountAddress": "string | null",
    "phone": "string | null",
    "role": "user | organizer | admin"
  }
}
```

---

### Update User
Update user profile.

```
PATCH /api/user/update
```

**Request Body:**
```json
{
  "displayName": "string (optional)",
  "profilePicture": "string (optional) - URL"
}
```

---

## App Blocks Endpoints

### List App Blocks
Get all app blocks owned by the current user.

```
GET /api/app-blocks
```

**Auth:** Required

**Response (200):**
```json
{
  "appBlocks": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "iconUrl": "string | null",
      "status": "draft | active | archived",
      "blockType": "string | null",
      "onboardingStage": "questions | followup | document | connectors | complete",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

---

### Create App Block
Create a new app block.

```
POST /api/app-blocks
```

**Auth:** Required

**Request Body:**
```json
{
  "name": "string (required) - Max 100 chars",
  "description": "string (optional)",
  "iconUrl": "string (optional) - URL"
}
```

**Response (201):**
```json
{
  "appBlock": { ... }
}
```

---

### Get App Block
Get details of a specific app block.

```
GET /api/app-blocks/{id}
```

**Auth:** Required (must be owner)

**Response (200):**
```json
{
  "appBlock": {
    "id": "uuid",
    "name": "string",
    "description": "string | null",
    "iconUrl": "string | null",
    "status": "draft | active | archived",
    "gitHubUrl": "string | null",
    "appUrl": "string | null",
    "githubRepoOwner": "string | null",
    "githubRepoName": "string | null",
    "installations": [
      {
        "installation": { ... },
        "connector": { ... }
      }
    ],
    "hasServiceAccount": true
  }
}
```

---

### Update App Block
Update app block details.

```
PUT /api/app-blocks/{id}
```

**Auth:** Required (must be owner)

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "iconUrl": "string (optional)",
  "githubRepoOwner": "string (optional)",
  "githubRepoName": "string (optional)",
  "githubWorkflowFile": "string (optional)",
  "githubBranch": "string (optional)"
}
```

---

### Update Registration URLs
Update GitHub and App URLs for registration.

```
PATCH /api/app-blocks/{id}
```

**Auth:** Required (must be owner)

**Request Body:**
```json
{
  "gitHubUrl": "string (required with appUrl)",
  "appUrl": "string (required with gitHubUrl)",
  "tags": ["string"] (optional)
}
```

---

### Delete App Block
Delete an app block.

```
DELETE /api/app-blocks/{id}
```

**Auth:** Required (must be owner)

---

### Rotate Service Account Key
Generate a new API key for the app block's service account.

```
POST /api/app-blocks/{id}
```

**Request Body:**
```json
{
  "action": "rotate-key"
}
```

**Response (200):**
```json
{
  "appBlock": { ... },
  "apiKey": "string - New API key (only shown once)"
}
```

---

### Update App Block Icon
Upload a new icon for an app block.

```
POST /api/app-blocks/{id}/icon
```

**Auth:** Required (must be owner)

**Request Body (multipart/form-data):**
- `icon` - Image file

---

### Dispatch Ren.AI Workflow
Trigger automated code changes via Ren.AI.

```
POST /api/app-blocks/{id}/dispatch
```

**Auth:** Required (must be owner)

**Request Body:**
```json
{
  "intent": "branding | features | config | full_build | custom (required)",
  "prompt": "string (optional) - Additional instructions",
  "customIntent": "string (required if intent is 'custom')",
  "autoCommit": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Code changes initiated",
  "operationId": "uuid",
  "sessionId": "string"
}
```

---

### Get Operation Status
Get the status of a Ren.AI operation.

```
GET /api/app-blocks/{id}/operation/{operationId}
```

**Auth:** Required (must be owner)

---

## Block Submissions (Public)

### Submit a Block
Submit a project to become an app block. **No authentication required.**

```
POST /api/block-submissions
```

**Request Body:**
```json
{
  "blockName": "string (required) - Max 100 chars",
  "submitterName": "string (required) - Max 100 chars",
  "email": "string (required) - Valid email",
  "projectDescription": "string (required) - Max 5000 chars",
  "projectUrl": "string (required) - Valid URL",
  "iconUrl": "string (optional) - Must be 512x512 pixels"
}
```

**Response (201):**
```json
{
  "success": true,
  "submission": {
    "id": "uuid",
    "blockName": "string",
    "submitterName": "string",
    "email": "string",
    "projectDescription": "string",
    "projectUrl": "string",
    "iconUrl": "string | null",
    "status": "pending",
    "createdAt": "timestamp"
  }
}
```

**Errors:**
- `400` - Validation error
- `409` - Duplicate submission (same email + block name)

---

### List Submissions (Admin)
Get all block submissions.

```
GET /api/block-submissions
```

**Response (200):**
```json
{
  "submissions": [ ... ]
}
```

---

## Connectors Endpoints

### List Connectors
Get all available connectors with scopes and recipes.

```
GET /api/connectors
```

**Response (200):**
```json
{
  "connectors": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "iconUrl": "string | null",
      "isActive": true,
      "scopes": [
        {
          "id": "uuid",
          "name": "string",
          "description": "string | null",
          "requiredRole": "string | null"
        }
      ],
      "recipes": [
        {
          "id": "uuid",
          "name": "string",
          "description": "string | null",
          "scopes": ["string"]
        }
      ]
    }
  ]
}
```

---

### Get Connector
Get details of a specific connector.

```
GET /api/connectors/{id}
```

---

## Registry Endpoints

### Browse Registry
Browse the public app block registry.

```
GET /api/registry/app-blocks
```

**Query Params:**
- `category` - `events | tools | music | games | community | other`
- `query` - Search term
- `tags` - Comma-separated tags
- `visibility` - `public | unlisted` (default: public)
- `installable` - `true` to filter only installable blocks
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response (200):**
```json
{
  "entries": [
    {
      "id": "uuid",
      "slug": "string",
      "displayName": "string",
      "description": "string | null",
      "iconUrl": "string | null",
      "category": "string",
      "visibility": "public | unlisted | private",
      "installable": true,
      "tags": ["string"]
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### Get Registry Entry
Get details of a registry entry by slug.

```
GET /api/registry/app-blocks/{slug}
```

---

## Connector Installations

### Install Connector
Connect a connector to an app block.

```
POST /api/app-blocks/{id}/connectors
```

**Auth:** Required (must be owner)

**Request Body:**
```json
{
  "connectorId": "uuid (required)",
  "scopes": ["string"] (required),
  "authType": "user | service"
}
```

---

### Get Installation
Get details of a connector installation.

```
GET /api/connector-installations/{id}
```

---

### Revoke Installation
Revoke a connector installation.

```
DELETE /api/connector-installations/{id}
```

---

## Pending Blocks (Onboarding)

### Create/Update Draft Block
Create or update a draft app block during onboarding.

```
POST /api/pending-blocks
```

**Auth:** Required

**Request Body:**
```json
{
  "blockName": "string (required)",
  "blockType": "string (required)",
  "summary": {
    "name": "string",
    "tagline": "string",
    "description": "string",
    "targetAudience": "string",
    "coreFeatures": ["string"],
    "nextSteps": ["string"]
  },
  "processedAnswers": []
}
```

---

### Get User's Draft Blocks
Get all draft blocks for the current user.

```
GET /api/pending-blocks
```

**Auth:** Required

---

### Update Draft Progress
Update onboarding progress for a draft block.

```
PATCH /api/pending-blocks
```

**Auth:** Required

**Request Body:**
```json
{
  "appBlockId": "uuid (required)",
  "onboardingStage": "questions | followup | document | connectors | complete",
  "onboardingData": {},
  "name": "string",
  "description": "string"
}
```

---

## Other Endpoints

### Process Answers
Process onboarding questionnaire answers with AI.

```
POST /api/process-answers
```

---

### Answer Question
Submit an answer to a follow-up question.

```
POST /api/questions/{questionId}/answer
```

---

### Skip Question
Skip a follow-up question.

```
POST /api/questions/{questionId}/skip
```

---

### Transcribe Audio
Transcribe audio to text (for voice input).

```
POST /api/transcribe
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict (duplicate)
- `423` - Locked (account locked)
- `500` - Internal Server Error
