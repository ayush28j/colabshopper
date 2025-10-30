const express = require('express');
const router = express.Router();
const userController = require('./controllers/user.controller');
const listController = require('./controllers/list.controller');

// User routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/token/refresh', userController.refreshToken);
router.get('/user', userController.authenticate, userController.getUser);

// List routes
router.post('/list', listController.createList);
router.get('/list/:listId', listController.authenticate, listController.getList);
router.delete('/list/:listId', listController.authenticate, listController.deleteList);
router.put('/list/:listId/description', listController.authenticate, listController.updateListDescription);
router.post('/list/:listId/collaborators', listController.authenticate, listController.addCollaborator);
router.put('/list/:listId/collaborators/:collaboratorUserId', listController.authenticate, listController.updateCollaboratorPermissions);
router.delete('/list/:listId/collaborators/:collaboratorUserId', listController.authenticate, listController.removeCollaborator);
router.post('/list/:listId/additional-columns', listController.authenticate, listController.addAdditionalColumn);
router.delete('/list/:listId/additional-columns/:columnName', listController.authenticate, listController.removeAdditionalColumn);
router.post('/list/:listId/item', listController.authenticate, listController.addListItem);
router.put('/list/:listId/item/:itemId/:updateKey', listController.authenticate, listController.updateListItem);
router.delete('/list/:listId/item/:itemId', listController.authenticate, listController.deleteListItem);



module.exports = router;

