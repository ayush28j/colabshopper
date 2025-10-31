# WebSocket Real-Time Updates

This directory contains the WebSocket implementation for real-time list updates in the CoShopper backend.

## Overview

The WebSocket server allows clients to connect and receive real-time updates whenever a list is modified through the REST API endpoints.

## Files

- **ws-server.js** - Server-side WebSocket implementation
- **ws-client.js** - Client-side example and documentation

## How It Works

### 1. Connection Flow

1. Client establishes WebSocket connection to `ws://your-host:port/ws`
2. Client sends authentication message with `listId` and optional `token`:
   ```json
   {
     "listId": "65f123abc456def789012345",
     "token": "jwt-token-here"  // Required only for private lists
   }
   ```
3. Server validates access and responds with:
   ```json
   {
     "type": "connected",
     "message": "Successfully connected to list",
     "listId": "65f123abc456def789012345",
     "list": { /* full list object */ }
   }
   ```

### 2. Authentication

- **Public Lists**: No token required
- **Private Lists**: JWT token required in initial message
- Token is validated using the same authentication logic as REST API
- Access is granted if user is owner or collaborator

### 3. Real-Time Updates

Whenever a list is updated via REST API, all connected clients receive updates:

#### Update Types

| Action | Payload | Description |
|--------|---------|-------------|
| `updateDescription` | `description` | List description changed |
| `addCollaborator` | `collaborator` | New collaborator added |
| `updateCollaboratorPermissions` | `collaboratorUserId`, `permissions` | Collaborator permissions changed |
| `removeCollaborator` | `collaboratorUserId` | Collaborator removed |
| `addAdditionalColumn` | `column` | Custom column added |
| `removeAdditionalColumn` | `columnName` | Custom column removed |
| `addListItem` | `item` | New item added to list |
| `updateListItem` | `itemId`, `updateKey`, `value` | Item field updated |
| `deleteListItem` | `itemId` | Item deleted from list |
| `deleteList` | - | List deleted (connection will close) |

#### Update Message Format

```json
{
  "type": "update",
  "timestamp": 1698765432000,
  "action": "addListItem",
  "item": { /* full item object */ }
}
```

### 4. Error Handling

If authentication fails or an error occurs:

```json
{
  "type": "error",
  "message": "Error description"
}
```

The connection will be closed after sending the error message.

## Usage Examples

### Browser JavaScript

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  // Send authentication
  ws.send(JSON.stringify({
    listId: 'your-list-id',
    token: 'your-jwt-token' // Optional for public lists
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'connected') {
    console.log('Connected to list:', data.list);
  } else if (data.type === 'update') {
    console.log('Update received:', data.action);
    // Update your UI based on the action
  }
};
```

### React Example

```javascript
import { useEffect, useState } from 'react';

function useListWebSocket(listId, token) {
  const [list, setList] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8000/ws');
    
    websocket.onopen = () => {
      websocket.send(JSON.stringify({ listId, token }));
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected') {
        setList(data.list);
      } else if (data.type === 'update') {
        handleUpdate(data);
      }
    };
    
    setWs(websocket);
    
    return () => websocket.close();
  }, [listId, token]);

  const handleUpdate = (data) => {
    switch (data.action) {
      case 'addListItem':
        setList(prev => ({
          ...prev,
          items: [...prev.items, data.item]
        }));
        break;
      case 'updateListItem':
        setList(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item._id === data.itemId 
              ? { ...item, [data.updateKey]: data.value }
              : item
          )
        }));
        break;
      // ... handle other actions
    }
  };

  return { list, ws };
}
```

### Node.js Client

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8000/ws');

ws.on('open', () => {
  ws.send(JSON.stringify({
    listId: 'your-list-id',
    token: 'your-jwt-token'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message);
});
```

## API Integration

The WebSocket server is automatically initialized when the Express server starts. It uses the same HTTP server instance.

All list update operations in `controllers/list.controller.js` automatically broadcast updates to connected clients after successful database operations.

## Connection Management

- Each client connection is tracked by `listId`
- Multiple clients can connect to the same list
- Connections are automatically cleaned up when closed
- Inactive connections are removed from the pool

## Testing

You can test the WebSocket connection using browser DevTools or tools like:
- [websocat](https://github.com/vi/websocat) - Command-line WebSocket client
- [wscat](https://github.com/websockets/wscat) - WebSocket cat
- Browser extensions like "WebSocket Test Client"

Example with wscat:
```bash
npm install -g wscat
wscat -c ws://localhost:8000/ws
# Then send: {"listId":"your-list-id","token":"your-token"}
```

## Security Considerations

1. **Authentication**: Private lists require valid JWT tokens
2. **Authorization**: Access is validated against list ownership/collaboration
3. **Input Validation**: All incoming messages are validated
4. **Error Handling**: Errors don't expose sensitive information
5. **Connection Limits**: Consider implementing rate limiting for production

## Production Deployment

For production deployment, consider:

1. **Use WSS (WebSocket Secure)** with HTTPS/TLS
2. **Add connection limits** per client/IP
3. **Implement heartbeat/ping-pong** to detect dead connections
4. **Add reconnection logic** in client
5. **Use a load balancer** that supports WebSocket (e.g., NGINX, HAProxy)
6. **Monitor connection count** and memory usage

### NGINX Configuration Example

```nginx
location /ws {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 86400;
}
```

## Troubleshooting

### Connection Fails
- Verify server is running and WebSocket server is initialized
- Check firewall/network settings
- Ensure WebSocket URL is correct (ws:// not http://)

### Authentication Fails
- Verify JWT token is valid and not expired
- Check that user has access to the list
- Ensure token is sent in the first message

### Updates Not Received
- Verify client successfully connected (received "connected" message)
- Check that updates are triggered via the REST API endpoints
- Look for errors in server logs

## Future Enhancements

Potential improvements for future versions:

1. **Presence indicators** - Show which users are currently viewing a list
2. **Typing indicators** - Show when someone is editing an item
3. **Conflict resolution** - Handle simultaneous edits
4. **Offline support** - Queue updates when disconnected
5. **Partial updates** - Send only changed fields instead of full objects
6. **Message compression** - Use WebSocket per-message deflate extension

