# 🚀 WebSocket Quick Start Guide

## Start the Server

```bash
npm start
```

WebSocket endpoint: `ws://localhost:8000/ws`

## Connect from Client

### JavaScript (Browser or Node.js)

```javascript
// 1. Create connection
const ws = new WebSocket('ws://localhost:8000/ws');

// 2. Send authentication on open
ws.onopen = () => {
  ws.send(JSON.stringify({
    listId: 'your-list-id-here',
    token: 'your-jwt-token-here'  // Optional for public lists
  }));
};

// 3. Handle messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  if (data.type === 'connected') {
    console.log('Connected to list:', data.list);
  } else if (data.type === 'update') {
    console.log('Update:', data.action);
    // Update your UI here
  }
};
```

## Message Types

### Sent by Server

#### 1. Connection Success
```json
{
  "type": "connected",
  "message": "Successfully connected to list",
  "listId": "...",
  "list": { /* full list object */ }
}
```

#### 2. Real-Time Update
```json
{
  "type": "update",
  "timestamp": 1698765432000,
  "action": "addListItem",
  "item": { /* new item data */ }
}
```

#### 3. Error
```json
{
  "type": "error",
  "message": "Error description"
}
```

## Update Actions

| Action | Description | Data Fields |
|--------|-------------|-------------|
| `updateDescription` | Description changed | `description` |
| `addCollaborator` | Collaborator added | `collaborator` |
| `updateCollaboratorPermissions` | Permissions changed | `collaboratorUserId`, `permissions` |
| `removeCollaborator` | Collaborator removed | `collaboratorUserId` |
| `addAdditionalColumn` | Column added | `column` |
| `removeAdditionalColumn` | Column removed | `columnName` |
| `addListItem` | Item added | `item` |
| `updateListItem` | Item updated | `itemId`, `updateKey`, `value` |
| `deleteListItem` | Item deleted | `itemId` |
| `deleteList` | List deleted | - |

## Test Quickly

### Option 1: HTML Test Client
1. Open `ws/test-client.html` in browser
2. Enter list ID and token
3. Click Connect

### Option 2: Browser Console
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onopen = () => ws.send(JSON.stringify({
  listId: 'your-list-id',
  token: 'your-token'  // optional for public lists
}));
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

### Option 3: Command Line (wscat)
```bash
npm install -g wscat
wscat -c ws://localhost:8000/ws

# Then send:
{"listId":"your-list-id","token":"your-token"}
```

## React Example

```javascript
import { useEffect, useState } from 'react';

function useListWebSocket(listId, token) {
  const [list, setList] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ listId, token }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected') {
        setList(data.list);
      } else if (data.type === 'update') {
        // Handle updates
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
          case 'deleteListItem':
            setList(prev => ({
              ...prev,
              items: prev.items.filter(item => item._id !== data.itemId)
            }));
            break;
        }
      }
    };
    
    return () => ws.close();
  }, [listId, token]);

  return list;
}

// Usage
function ListComponent({ listId, token }) {
  const list = useListWebSocket(listId, token);
  
  if (!list) return <div>Connecting...</div>;
  
  return (
    <div>
      <h1>{list.name}</h1>
      {list.items?.map(item => (
        <div key={item._id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### "Connection failed"
- ✓ Server running? `npm start`
- ✓ URL correct? `ws://localhost:8000/ws`
- ✓ Check console for errors

### "Unauthorized" error
- ✓ Valid JWT token?
- ✓ User has access to list?
- ✓ Token sent in first message?

### Not receiving updates
- ✓ Connected successfully?
- ✓ Making changes via REST API?
- ✓ Correct listId?

## Need More Help?

- **Full Documentation**: See `ws/README.md`
- **Implementation Details**: See `WEBSOCKET_IMPLEMENTATION.md`
- **Client Examples**: See `ws/ws-client.js`

---

**Quick Tip**: Open `ws/test-client.html` for an interactive testing interface!

