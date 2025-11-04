const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

function oid(id) {
    if(typeof id === 'string')
        return new mongoose.Types.ObjectId(id);
    else return id;
}

// Store for managing WebSocket connections by listId
// Structure: { listId: Set([ws1, ws2, ws3, ...]) }
const listConnections = new Map();

/**
 * Verify JWT token and return userId
 */
function verifyToken(token) {
    try {
        if (!process.env.JWT_SECRET || !token) {
            return null;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id && decoded.exp > Date.now() / 1000) {
            return oid(decoded.id);
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Authenticate client for a list
 */
async function authenticateListAccess(listId, token) {
    try {
        const List = mongoose.model('List');
        const list = await List.findById(oid(listId)).lean();
        const ListItem = mongoose.model('ListItem');
        
        if (!list) {
            return { success: false, error: 'List not found' };
        }

        let listItems = await ListItem.find({listId: list._id});
        console.log(listItems.length);
        list.items = listItems;

        // Public lists don't need authentication
        if (list.isPublic) {
            return { success: true, list };
        }

        // Private lists require authentication
        const userId = verifyToken(token);
        if (!userId) {
            return { success: false, error: 'Unauthorized: Invalid or missing token' };
        }

        // Check if user is owner or collaborator
        const isOwner = list.ownerId && list.ownerId.toString() === userId.toString();
        const isCollaborator = list.collaborators.some(
            collaborator => collaborator.userId && collaborator.userId.toString() === userId.toString()
        );

        if (isOwner || isCollaborator) {
            return { success: true, list };
        }

        return { success: false, error: 'Unauthorized: Access denied' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Initialize WebSocket server
 */
function initializeWebSocketServer(server) {
    const wss = new WebSocket.Server({ 
        server,
        path: '/ws'
    });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');
        
        // Track if client has been authenticated and joined a list
        ws.isAuthenticated = false;
        ws.listId = null;

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());
                
                // Handle initial authentication message
                if (!ws.isAuthenticated) {
                    const { listId, token } = data;
                    
                    if (!listId) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'listId is required'
                        }));
                        ws.close();
                        return;
                    }

                    // Authenticate the client
                    const authResult = await authenticateListAccess(listId, token);
                    
                    if (!authResult.success) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: authResult.error
                        }));
                        ws.close();
                        return;
                    }

                    // Successfully authenticated
                    ws.isAuthenticated = true;
                    ws.listId = listId;

                    // Add connection to the list's connection pool
                    if (!listConnections.has(listId)) {
                        listConnections.set(listId, new Set());
                    }
                    listConnections.get(listId).add(ws);

                    // Send success message with list details
                    ws.send(JSON.stringify({
                        type: 'connected',
                        message: 'Successfully connected to list',
                        listId: listId,
                        list: authResult.list
                    }));

                    console.log(`Client connected to list: ${listId}. Total connections for this list: ${listConnections.get(listId).size}`);
                } else {
                    // Handle other message types if needed in the future
                    // For now, just acknowledge receipt
                    ws.send(JSON.stringify({
                        type: 'ack',
                        message: 'Message received'
                    }));
                }
            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid message format'
                }));
            }
        });

        ws.on('close', () => {
            // Remove connection from the list's connection pool
            if (ws.listId && listConnections.has(ws.listId)) {
                listConnections.get(ws.listId).delete(ws);
                
                // Clean up empty sets
                if (listConnections.get(ws.listId).size === 0) {
                    listConnections.delete(ws.listId);
                }
                
                console.log(`Client disconnected from list: ${ws.listId}`);
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    console.log('WebSocket server initialized at /ws');
    return wss;
}

/**
 * Broadcast update to all clients connected to a specific list
 */
function broadcastToList(listId, updateData) {
    const connections = listConnections.get(listId);
    
    if (!connections || connections.size === 0) {
        console.log(`No active connections for list: ${listId}`);
        return;
    }

    const message = JSON.stringify({
        type: 'update',
        timestamp: Date.now(),
        ...updateData
    });

    let sentCount = 0;
    connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
            sentCount++;
        }
    });

    console.log(`Broadcast update to ${sentCount} clients for list: ${listId}`);
}

/**
 * Get the number of active connections for a list
 */
function getConnectionCount(listId) {
    const connections = listConnections.get(listId);
    return connections ? connections.size : 0;
}

module.exports = {
    initializeWebSocketServer,
    broadcastToList,
    getConnectionCount
};

