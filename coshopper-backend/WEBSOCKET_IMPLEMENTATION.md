# WebSocket Real-Time Updates Implementation

## ✅ Implementation Complete

The WebSocket functionality has been successfully implemented for real-time list updates in the CoShopper backend.

## 📁 Files Created/Modified

### New Files
1. **ws/ws-server.js** - Core WebSocket server implementation
2. **ws/ws-client.js** - Client-side example code and documentation
3. **ws/README.md** - Comprehensive WebSocket documentation
4. **ws/test-client.html** - Interactive HTML test client

### Modified Files
1. **server.js** - Integrated WebSocket server with Express
2. **controllers/list.controller.js** - Added broadcast calls to all update operations
3. **package.json** - Added ws dependency and npm scripts

## 🚀 Features Implemented

### 1. WebSocket Server
- ✅ Accepts client connections at `/ws` endpoint
- ✅ Handles authentication for private lists using JWT tokens
- ✅ Manages connection pools grouped by listId
- ✅ Broadcasts updates to all connected clients
- ✅ Automatic connection cleanup on disconnect
- ✅ Comprehensive error handling

### 2. Authentication & Authorization
- ✅ Public lists: No authentication required
- ✅ Private lists: JWT token validation required
- ✅ Verifies user is owner or collaborator before allowing connection
- ✅ Returns full list details on successful connection

### 3. Real-Time Updates
All list operations broadcast updates to connected clients:

- ✅ **updateListDescription** - Description changes
- ✅ **addCollaborator** - New collaborator added
- ✅ **updateCollaboratorPermissions** - Permission changes
- ✅ **removeCollaborator** - Collaborator removed
- ✅ **addAdditionalColumn** - Custom column added
- ✅ **removeAdditionalColumn** - Custom column removed
- ✅ **addListItem** - New item added
- ✅ **updateListItem** - Item field updated
- ✅ **deleteListItem** - Item deleted
- ✅ **deleteList** - List deleted (notifies before closing connections)

### 4. Message Format
All updates follow a consistent format:
```json
{
  "type": "update",
  "timestamp": 1698765432000,
  "action": "addListItem",
  "item": { /* relevant data */ }
}
```

## 🔧 How to Use

### 1. Start the Server
```bash
npm start
# or for development with auto-restart
npm run dev
```

The WebSocket server will be available at: `ws://localhost:8000/ws`

### 2. Connect from Client

#### Browser JavaScript
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
  console.log('Received:', data);
  
  if (data.type === 'update') {
    // Handle the update based on data.action
  }
};
```

### 3. Test with HTML Client
Open `ws/test-client.html` in your browser to test the WebSocket connection interactively.

## 📊 Connection Flow

```
1. Client → Server: WebSocket connection request to /ws
2. Server → Client: Connection established
3. Client → Server: { listId, token }
4. Server validates authentication
5a. Success → Server → Client: { type: "connected", list: {...} }
5b. Failure → Server → Client: { type: "error", message: "..." } → Close
6. When list updates occur via API:
   Server → All Connected Clients: { type: "update", action: "...", ... }
```

## 🔐 Security Features

- JWT token validation for private lists
- Authorization check (owner/collaborator)
- Input validation for all messages
- Automatic connection cleanup
- Error messages don't expose sensitive data
- Same authentication logic as REST API

## 📦 Dependencies

- **ws** (v8.18.3) - WebSocket implementation for Node.js

## 🧪 Testing

### Method 1: HTML Test Client
1. Open `ws/test-client.html` in a browser
2. Enter WebSocket URL (ws://localhost:8000/ws)
3. Enter a valid List ID
4. Enter JWT token (if private list)
5. Click "Connect"
6. Make changes via REST API and see real-time updates

### Method 2: Command Line (wscat)
```bash
npm install -g wscat
wscat -c ws://localhost:8000/ws

# Then send:
{"listId":"your-list-id","token":"your-jwt-token"}
```

### Method 3: Browser DevTools
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onopen = () => ws.send(JSON.stringify({listId: 'your-id', token: 'your-token'}));
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## 📝 Example Integration with Frontend

### React Hook Example
```javascript
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
        setList(prev => ({...prev, items: [...prev.items, data.item]}));
        break;
      case 'updateListItem':
        setList(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item._id === data.itemId 
              ? {...item, [data.updateKey]: data.value}
              : item
          )
        }));
        break;
      case 'deleteListItem':
        setList(prev => ({
          ...prev,
          items: prev.items.filter(item => item._id !== data.itemId)
        }));
        break;
      // ... handle other actions
    }
  };

  return { list, ws };
}
```

## 🚀 Production Considerations

### 1. Use WSS (Secure WebSocket)
For production, use WSS with TLS/SSL certificates.

### 2. Load Balancer Configuration
If using NGINX, add WebSocket support:
```nginx
location /ws {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 3. Environment Variables
Ensure these are set:
- `PORT` - Server port (default: 8000)
- `JWT_SECRET` - JWT signing secret
- `MONGO_URI` - MongoDB connection string

### 4. Monitoring
Monitor these metrics in production:
- Active WebSocket connections
- Messages sent/received per second
- Connection errors
- Memory usage

## 🐛 Troubleshooting

### Connection Fails
- ✓ Verify server is running
- ✓ Check WebSocket URL (ws:// not http://)
- ✓ Check firewall/network settings
- ✓ Verify port is accessible

### Authentication Fails
- ✓ Verify JWT token is valid and not expired
- ✓ Check user has access to the list (owner/collaborator)
- ✓ Ensure token is sent in first message

### Updates Not Received
- ✓ Verify client received "connected" message
- ✓ Check updates are triggered via REST API
- ✓ Look for errors in server logs
- ✓ Verify listId matches

## 📚 Additional Resources

- **ws/README.md** - Detailed WebSocket documentation
- **ws/ws-client.js** - Client implementation examples
- **ws/test-client.html** - Interactive test client

## 🎯 Next Steps

1. **Start the server**: `npm start`
2. **Test the connection**: Open `ws/test-client.html`
3. **Integrate with frontend**: Use the React hook example
4. **Make API calls**: See real-time updates in connected clients

## 💡 Features to Consider Adding

- Presence indicators (who's viewing the list)
- Typing indicators
- Optimistic UI updates
- Offline queue
- Reconnection with exponential backoff
- Heartbeat/ping-pong for connection health

---

**Implementation Date**: October 31, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready

