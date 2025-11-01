# ColabShopper Backend

A collaborative shopping list application backend that enables users to create, manage, and share shopping lists with real-time updates via WebSocket.

## Features

- **User Authentication**: Register, login, and JWT-based token authentication
- **List Management**: Create public or private shopping lists
- **Collaborative Lists**: Add collaborators with granular permissions
- **Custom Columns**: Add additional custom columns to lists for flexible data organization
- **List Items**: Add, update, and delete items with quantity tracking
- **Who Brings**: Track which users are bringing which items and quantities
- **Real-time Updates**: WebSocket support for instant synchronization across clients
- **Permission System**: Fine-grained access control for list operations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Real-time**: WebSocket (ws library)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or cloud)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd colabshopper-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/colabshopper
JWT_SECRET=your-secret-key-here
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:8000`

## Project Structure

```
colabshopper-backend/
├── auth.js                 # JWT authentication middleware
├── server.js              # Main server file
├── routes.js              # API route definitions
├── models/                # Mongoose models
│   ├── User.js           # User model
│   ├── List.js           # List model
│   └── ListItem.js       # ListItem model
├── controllers/           # Business logic
│   ├── user.controller.js
│   └── list.controller.js
├── ws/                    # WebSocket implementation
│   ├── ws-server.js
│   └── ws-client.js      # Client example
├── package.json
└── .env                   # Environment variables (not in repo)
```

## API Overview

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

- **User Management**
  - `POST /register` - Register a new user
  - `POST /login` - Login and get tokens
  - `POST /token/refresh` - Refresh access token
  - `GET /user` - Get current user info
  - `PUT /user/name` - Update user name
  - `PUT /user/country` - Update user country

- **List Management**
  - `GET /lists` - Get user's owned lists
  - `GET /collaborating-lists` - Get lists where user is a collaborator
  - `POST /find-collaborator-by-email` - Find collaborator name by email
  - `POST /list` - Create a new list
  - `GET /list/:listId` - Get list details and items
  - `DELETE /list/:listId` - Delete a list
  - `PUT /list/:listId/description` - Update list description

- **Collaborators**
  - `POST /list/:listId/collaborators` - Add collaborator
  - `PUT /list/:listId/collaborators/:userId` - Update permissions
  - `DELETE /list/:listId/collaborators/:userId` - Remove collaborator

- **Custom Columns**
  - `POST /list/:listId/additional-columns` - Add custom column
  - `DELETE /list/:listId/additional-columns/:columnName` - Remove column

- **List Items**
  - `POST /list/:listId/item` - Add item to list
  - `PUT /list/:listId/item/:itemId/:updateKey` - Update item property
  - `DELETE /list/:listId/item/:itemId` - Delete item

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## WebSocket Connection

Connect to the WebSocket server for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

// Send authentication after connection
ws.send(JSON.stringify({
  listId: 'your-list-id',
  token: 'your-jwt-token' // Required for private lists
}));

// Listen for updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update received:', data);
};
```

See [ws/ws-client.js](./ws/ws-client.js) for a complete example.

## Permission System

Lists can have different permission levels for collaborators:

- `addItem` - Add new items to the list
- `editItem` - Edit existing items
- `deleteItem` - Remove items from the list
- `editDescription` - Update list description
- `addCollaborator` - Add new collaborators
- `updateCollaboratorPermissions` - Modify collaborator permissions
- `removeCollaborator` - Remove collaborators
- `addAdditionalColumn` - Add custom columns
- `removeAdditionalColumn` - Remove custom columns

## Public vs Private Lists

- **Public Lists**: Anyone can view and edit without authentication
- **Private Lists**: Require authentication and proper permissions

## Data Models

### User
- `name`: String (required)
- `email`: String (required, unique)
- `hash_password`: String (required)
- `country`: String (required)
- `createdAt`: Date
- `updatedAt`: Date

### List
- `name`: String (required)
- `description`: String
- `isPublic`: Boolean (default: true)
- `ownerId`: ObjectId
- `ownerName`: String
- `collaborators`: Array of collaborator objects
- `additionalColumns`: Array of custom column definitions
- `createdAt`: Date
- `updatedAt`: Date

### ListItem
- `listId`: ObjectId
- `name`: String (required)
- `qty`: Number (required)
- `unit`: String (default: "pcs")
- `whoBrings`: Array of objects tracking who is bringing the item
- `addedBy`: ObjectId
- Plus any additional custom columns

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## Testing

Use the provided Postman collection (`postman_collection.json`) to test all API endpoints.

Import the collection into Postman and update the environment variables:
- `base_url`: http://localhost:8000
- `access_token`: Your JWT token after login

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Author

ayush28j

## Support

For issues and questions, please create an issue in the repository.

