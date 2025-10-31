# CoShopper API Documentation

Complete API reference for the CoShopper backend service with 20 endpoints.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained from the `/register` or `/login` endpoints and expire after 1 day. Use the `/token/refresh` endpoint to get a new access token.

---

## User Endpoints

### 1. Register User

Create a new user account.

**Endpoint:** `POST /register`

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "country": "USA"
}
```

**Request Fields:**
- `name` (string, required): User's full name
- `email` (string, required): Valid email address
- `password` (string, required): User's password
- `country` (string, required): User's country

**Success Response (201 Created):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or email already exists
```json
{
  "error": "An account with this email already exists"
}
```

---

### 2. Login User

Authenticate and receive access tokens.

**Endpoint:** `POST /login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Success Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid credentials
```json
{
  "error": "Invalid password"
}
```

---

### 3. Refresh Access Token

Get a new access token using a refresh token.

**Endpoint:** `POST /token/refresh`

**Authentication:** Not required (but needs refresh token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or expired refresh token

---

### 4. Get Current User

Retrieve information about the authenticated user.

**Endpoint:** `GET /user`

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "country": "USA",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

---

### 5. Update User Name

Update the authenticated user's name. Also updates the name in all lists, collaborations, and items.

**Endpoint:** `PUT /user/name`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Smith"
}
```

**Request Fields:**
- `name` (string, required): New user name (3-50 characters)

**Success Response (200 OK):**
```json
{
  "message": "Name updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing name or invalid length
```json
{
  "error": "Name must be between 3 and 50 characters"
}
```
- `401 Unauthorized`: Missing or invalid token

**Notes:**
- Updates user name across all lists where user is owner
- Updates user name in all collaborator arrays
- Updates user name in all list items where user added items or is bringing items

---

### 6. Update User Country

Update the authenticated user's country.

**Endpoint:** `PUT /user/country`

**Authentication:** Required

**Request Body:**
```json
{
  "country": "Canada"
}
```

**Request Fields:**
- `country` (string, required): New country name

**Success Response (200 OK):**
```json
{
  "message": "Country updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing country
- `401 Unauthorized`: Missing or invalid token

---

## List Endpoints

### 7. Get User's Lists

Retrieve all lists owned by the authenticated user.

**Endpoint:** `GET /lists`

**Authentication:** Required

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Weekend BBQ Shopping",
    "description": "Items needed for weekend barbecue party",
    "isPublic": false,
    "ownerId": "507f1f77bcf86cd799439012",
    "ownerName": "John Doe",
    "collaborators": [
      {
        "userId": "507f1f77bcf86cd799439013",
        "userName": "Jane Smith",
        "userEmail": "jane@example.com",
        "permissions": ["addItem", "editItem", "deleteItem"]
      }
    ],
    "additionalColumns": [],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

---

### 8. Get Collaborating Lists

Retrieve all lists where the authenticated user is a collaborator.

**Endpoint:** `GET /collaborating-lists`

**Authentication:** Required

**Success Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Office Party Supplies",
    "description": "Items for office party",
    "isPublic": false,
    "ownerId": "507f1f77bcf86cd799439015",
    "ownerName": "Alice Johnson",
    "collaborators": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "permissions": ["addItem", "editItem"]
      }
    ],
    "additionalColumns": [],
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

---

### 9. Create List

Create a new shopping list.

**Endpoint:** `POST /list`

**Authentication:** Optional (required for private lists)

**Request Body:**
```json
{
  "name": "Weekend BBQ Shopping",
  "description": "Items needed for weekend barbecue party",
  "isPublic": false
}
```

**Request Fields:**
- `name` (string, required): List name
- `description` (string, optional): List description
- `isPublic` (boolean, optional): Whether list is public (default: true)

**Success Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Weekend BBQ Shopping",
  "description": "Items needed for weekend barbecue party",
  "isPublic": false,
  "ownerId": "507f1f77bcf86cd799439012",
  "ownerName": "John Doe",
  "collaborators": [],
  "additionalColumns": [],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `400 Bad Request`: Creating private list without authentication

---

### 10. Get List

Retrieve list details with all items.

**Endpoint:** `GET /list/:listId`

**Authentication:** Required for private lists

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Weekend BBQ Shopping",
  "description": "Items needed for weekend barbecue party",
  "isPublic": false,
  "ownerId": "507f1f77bcf86cd799439012",
  "ownerName": "John Doe",
  "collaborators": [
    {
      "userId": "507f1f77bcf86cd799439013",
      "userName": "Jane Smith",
      "userEmail": "jane@example.com",
      "permissions": ["addItem", "editItem", "deleteItem"]
    }
  ],
  "additionalColumns": [
    {
      "name": "Store",
      "type": "text"
    }
  ],
  "items": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "listId": "507f1f77bcf86cd799439011",
      "name": "Hamburger Buns",
      "qty": 20,
      "unit": "pcs",
      "whoBrings": [
        {
          "userId": "507f1f77bcf86cd799439012",
          "userName": "John Doe",
          "qty": "10"
        }
      ],
      "addedBy": "507f1f77bcf86cd799439012",
      "Store": "Walmart"
    }
  ],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required for private list
- `404 Not Found`: List not found

---

### 11. Delete List

Delete a list and all its items (owner only, private lists only).

**Endpoint:** `DELETE /list/:listId`

**Authentication:** Required

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list

**Success Response (200 OK):**
```json
{
  "message": "List deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Cannot delete public list
- `401 Unauthorized`: Only owner can delete
- `404 Not Found`: List not found

---

### 12. Update List Description

Update the description of a list.

**Endpoint:** `PUT /list/:listId/description`

**Authentication:** Required

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list

**Request Body:**
```json
{
  "description": "Updated description for the shopping list"
}
```

**Success Response (200 OK):**
```json
{
  "message": "List description updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Cannot update public list or missing description
- `401 Unauthorized`: Insufficient permissions
- `404 Not Found`: List not found

**WebSocket Broadcast:**
```json
{
  "type": "update",
  "action": "updateDescription",
  "description": "Updated description for the shopping list",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Collaborator Endpoints

### 13. Add Collaborator

Add a user as a collaborator to a list.

**Endpoint:** `POST /list/:listId/collaborators`

**Authentication:** Required

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list

**Request Body:**
```json
{
  "email": "jane.smith@example.com",
  "permissions": ["addItem", "editItem", "deleteItem", "editDescription"]
}
```

**Request Fields:**
- `email` (string, required): Email of the collaborator
- `permissions` (array, required): Array of permission strings

**Available Permissions:**
- `addItem`
- `editItem`
- `deleteItem`
- `editDescription`
- `addCollaborator`
- `updateCollaboratorPermissions`
- `removeCollaborator`
- `addAdditionalColumn`
- `removeAdditionalColumn`

**Success Response (200 OK):**
```json
{
  "message": "Collaborator added successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid email or permissions
- `401 Unauthorized`: Insufficient permissions
- `404 Not Found`: List not found

**Notes:**
- If the email doesn't exist in the system, a new user account is created with a default password

---

### 14. Update Collaborator Permissions

Update the permissions of an existing collaborator.

**Endpoint:** `PUT /list/:listId/collaborators/:collaboratorUserId`

**Authentication:** Required

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list
- `collaboratorUserId` (string): MongoDB ObjectId of the collaborator

**Request Body:**
```json
{
  "permissions": ["addItem", "editItem"]
}
```

**Success Response (200 OK):**
```json
{
  "message": "Collaborator permissions updated successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Insufficient permissions

---

### 15. Remove Collaborator

Remove a collaborator from a list.

**Endpoint:** `DELETE /list/:listId/collaborators/:collaboratorUserId`

**Authentication:** Required

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list
- `collaboratorUserId` (string): MongoDB ObjectId of the collaborator

**Success Response (200 OK):**
```json
{
  "message": "Collaborator removed successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Insufficient permissions

---

## Custom Column Endpoints

### 16. Add Additional Column

Add a custom column to a list for storing additional data.

**Endpoint:** `POST /list/:listId/additional-columns`

**Authentication:** Required

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list

**Request Body:**
```json
{
  "name": "Store",
  "type": "text"
}
```

**Request Fields:**
- `name` (string, required): Column name (alphanumeric and spaces only)
- `type` (string, required): Data type (e.g., "text", "number")

**Success Response (200 OK):**
```json
{
  "message": "Additional column added successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid column name or column already exists
- `401 Unauthorized`: Insufficient permissions

---

### 17. Remove Additional Column

Remove a custom column from a list.

**Endpoint:** `DELETE /list/:listId/additional-columns/:columnName`

**Authentication:** Required

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list
- `columnName` (string): Name of the column to remove

**Success Response (200 OK):**
```json
{
  "message": "Additional column removed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Column doesn't exist
- `401 Unauthorized`: Insufficient permissions

**Notes:**
- Removing a column also removes that data from all list items

---

## List Item Endpoints

### 18. Add List Item

Add a new item to a shopping list.

**Endpoint:** `POST /list/:listId/item`

**Authentication:** Required for private lists

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list

**Request Body (Public List):**
```json
{
  "name": "Hamburger Buns",
  "qty": 20,
  "unit": "pcs",
  "whoBrings": [
    {
      "userName": "John Doe",
      "qty": "10"
    }
  ]
}
```

**Request Body (Private List):**
```json
{
  "name": "Hamburger Buns",
  "qty": 20,
  "unit": "pcs",
  "whoBrings": [
    {
      "userId": "507f1f77bcf86cd799439012",
      "userName": "John Doe",
      "qty": "10"
    }
  ],
  "Store": "Walmart"
}
```

**Request Fields:**
- `name` (string, required): Item name
- `qty` (number, required): Quantity
- `unit` (string, optional): Unit of measurement (default: "pcs")
- `whoBrings` (array, optional): Who is bringing this item
- Additional custom column fields

**Success Response (200 OK):**
```json
{
  "message": "Item added successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or validation error
- `401 Unauthorized`: Insufficient permissions

---

### 19. Update List Item

Update a specific property of a list item.

**Endpoint:** `PUT /list/:listId/item/:itemId/:updateKey`

**Authentication:** Required for private lists

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list
- `itemId` (string): MongoDB ObjectId of the item
- `updateKey` (string): Property to update (e.g., "name", "qty", "unit", "whoBrings", or custom column name)

**Request Body:**
```json
{
  "value": "New Value"
}
```

**Example - Update Quantity:**
```
PUT /list/507f1f77bcf86cd799439011/item/507f1f77bcf86cd799439014/qty
```
```json
{
  "value": 25
}
```

**Example - Update Who Brings:**
```
PUT /list/507f1f77bcf86cd799439011/item/507f1f77bcf86cd799439014/whoBrings
```
```json
{
  "value": [
    {
      "userId": "507f1f77bcf86cd799439012",
      "userName": "John Doe",
      "qty": "15"
    },
    {
      "userId": "507f1f77bcf86cd799439013",
      "userName": "Jane Smith",
      "qty": "10"
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "message": "Item updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid update key or validation error
- `401 Unauthorized`: Insufficient permissions
- `404 Not Found`: Item not found

**Validation Rules:**
- `qty`: Must be a number >= 0 and >= total whoBrings quantity
- `whoBrings`: Total quantity must be <= item quantity
- `name`, `unit`: Must be strings

---

### 20. Delete List Item

Remove an item from a list.

**Endpoint:** `DELETE /list/:listId/item/:itemId`

**Authentication:** Required for private lists

**URL Parameters:**
- `listId` (string): MongoDB ObjectId of the list
- `itemId` (string): MongoDB ObjectId of the item

**Success Response (200 OK):**
```json
{
  "message": "Item deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Insufficient permissions
- `404 Not Found`: Item not found

---

## WebSocket API

### Connection

Connect to the WebSocket server:

```
ws://localhost:8000/ws
```

### Authentication Message

After connecting, send an authentication message:

```json
{
  "listId": "507f1f77bcf86cd799439011",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Fields:**
- `listId` (string, required): MongoDB ObjectId of the list to subscribe to
- `token` (string, optional): JWT token (required for private lists)

### Connection Success Response

```json
{
  "type": "connected",
  "listId": "507f1f77bcf86cd799439011",
  "list": {
    // Full list object with items
  }
}
```

### Update Messages

All list updates are broadcast to connected clients:

```json
{
  "type": "update",
  "action": "addListItem",
  "item": {
    // New item object
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Update Actions:**
- `updateDescription`: List description changed
- `addCollaborator`: New collaborator added
- `updateCollaboratorPermissions`: Collaborator permissions changed
- `removeCollaborator`: Collaborator removed
- `addAdditionalColumn`: Custom column added
- `removeAdditionalColumn`: Custom column removed
- `addListItem`: New item added
- `updateListItem`: Item property updated
- `deleteListItem`: Item deleted
- `deleteList`: List deleted

### Error Messages

```json
{
  "type": "error",
  "message": "Error description"
}
```

### Acknowledgment Messages

```json
{
  "type": "ack"
}
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Description of the error"
}
```

## HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Authentication required or insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting for production use.

## Notes

- All dates are in ISO 8601 format
- MongoDB ObjectIds are 24-character hexadecimal strings
- JWT tokens expire after 1 day (access) and 30 days (refresh)
- WebSocket connections should be properly managed and closed when not needed
- Public lists allow anyone to view and edit without authentication
- Private lists require authentication and proper permissions for all operations

