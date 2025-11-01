/**
 * WebSocket Client Example
 * 
 * This file demonstrates how to connect to the ColabShopper WebSocket server
 * and receive real-time list updates.
 * 
 * Usage in browser or Node.js:
 * - In browser: Use the native WebSocket API
 * - In Node.js: Install 'ws' package (npm install ws)
 */

// Example usage in browser
function connectToList(listId, token = null) {
    // Construct WebSocket URL (adjust host/port as needed)
    const wsUrl = 'ws://localhost:8000/ws';
    
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    
    // Connection opened
    ws.addEventListener('open', (event) => {
        console.log('WebSocket connection established');
        
        // Send authentication message
        const authMessage = {
            listId: listId,
            token: token // Only required for private lists
        };
        
        ws.send(JSON.stringify(authMessage));
    });
    
    // Listen for messages from server
    ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        switch (data.type) {
            case 'connected':
                console.log('Successfully connected to list:', data.listId);
                console.log('List details:', data.list);
                // Initialize your UI with list data
                break;
                
            case 'update':
                console.log('List update received:', data.action);
                handleListUpdate(data);
                break;
                
            case 'error':
                console.error('Error:', data.message);
                break;
                
            case 'ack':
                console.log('Message acknowledged');
                break;
                
            default:
                console.log('Unknown message type:', data.type);
        }
    });
    
    // Handle connection errors
    ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });
    
    // Handle connection close
    ws.addEventListener('close', (event) => {
        console.log('WebSocket connection closed');
    });
    
    return ws;
}

// Handle different types of list updates
function handleListUpdate(data) {
    const { action, timestamp } = data;
    
    switch (action) {
        case 'updateDescription':
            console.log('Description updated:', data.description);
            // Update description in UI
            break;
            
        case 'addCollaborator':
            console.log('Collaborator added:', data.collaborator);
            // Add collaborator to UI
            break;
            
        case 'updateCollaboratorPermissions':
            console.log('Collaborator permissions updated:', data.collaboratorUserId, data.permissions);
            // Update collaborator permissions in UI
            break;
            
        case 'removeCollaborator':
            console.log('Collaborator removed:', data.collaboratorUserId);
            // Remove collaborator from UI
            break;
            
        case 'addAdditionalColumn':
            console.log('Column added:', data.column);
            // Add column to UI
            break;
            
        case 'removeAdditionalColumn':
            console.log('Column removed:', data.columnName);
            // Remove column from UI
            break;
            
        case 'addListItem':
            console.log('Item added:', data.item);
            // Add item to UI
            break;
            
        case 'updateListItem':
            console.log('Item updated:', data.itemId, data.updateKey, data.value);
            // Update item in UI
            break;
            
        case 'deleteListItem':
            console.log('Item deleted:', data.itemId);
            // Remove item from UI
            break;
            
        case 'deleteList':
            console.log('List deleted');
            // Show notification and redirect or close
            break;
            
        default:
            console.log('Unknown action:', action);
    }
}

// Example usage for a public list
// const ws = connectToList('65f123abc456def789012345');

// Example usage for a private list
// const ws = connectToList('65f123abc456def789012345', 'your-jwt-token-here');

// To close connection manually:
// ws.close();

module.exports = { connectToList, handleListUpdate };

