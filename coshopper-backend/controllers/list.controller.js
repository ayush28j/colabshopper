const mongoose = require('mongoose');
const User = mongoose.model('User');
const List = mongoose.model('List');
const ListItem = mongoose.model('ListItem');

function oid(id) {
    if(typeof id === 'string')
        return new mongoose.Types.ObjectId(id);
    else return id;
}

exports.authenticate = async (req, res, next) => {
    try{
        let listId = req.params.listId;
        let list = await List.findById(oid(listId));
        if(!list)
            return res.status(404).json({ error: 'List not found' });
        req.list = list;
        if(list.isPublic)
            return next();
        if(!req.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        if(list.ownerId === req.userId || list.collaborators.some(collaborator => collaborator.userId === req.userId))
            return next();
        return res.status(401).json({ error: 'Unauthorized' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.createList = async (req, res) => {
    try{
        const { name, description, isPublic } = req.body;
        if(!name)
            return res.status(400).json({ error: 'Name is required' });
        let ownerId = null;
        let ownerName = null;
        if(!isPublic){
            isPublic = false;
            if(!req.userId)
                return res.status(400).json({ error: 'Unauthorized' });
            const user = await User.findById(req.userId);
            if(!user)
                return res.status(400).json({ error: 'Unauthorized:User not found' });
            ownerId = user._id.toString();
            ownerName = user.name;
        }
        else
            isPublic = true;
        const list = await new List({ name, description, isPublic, ownerId, ownerName }).save();
        res.status(201).json(list);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getList = async (req, res) => {
    try{
        let list = req.list;
        let listItems = await ListItem.find({listId: list._id});
        if(!list.isPublic){
            let userIds = listItems.map(item => item.whoBrings.map(who => who.userId)).flat();
            let users = await User.find({_id: {$in: userIds}});
            let userMap = new Map(users.map(user => [user._id, user]));
            listItems = listItems.map(item => {
                item.whoBrings = item.whoBrings.map(who => ({...who, userName: userMap.get(who.userId).name}));
                return item;
            });
        }
        list.items = listItems;
        res.status(200).json(list);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.deleteList = async (req, res) => {
    try{
        let list = req.list;
        if(list.isPublic)
            return res.status(400).json({ error: 'Cannot delete public list' });

        if(list.ownerId !== req.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        await List.findByIdAndDelete(list._id);
        await ListItem.deleteMany({listId: list._id});
        return res.status(200).json({ message: 'List deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.updateListDescription = async (req, res) => {
    try{
        let { description} = req.body;
        if(!description)
            return res.status(400).json({ error: 'Description is required' });
        let list = req.list;
        if(list.isPublic)
            return res.status(400).json({ error: 'Cannot update public list' });
        if(list.ownerId !== req.userId && !list.collaborators.some(collaborator => collaborator.userId === req.userId && collaborator.permissions.includes('editDescription')))
            return res.status(401).json({ error: 'Unauthorized' });
        await List.findByIdAndUpdate(list._id, { $set: { description , updatedAt: Date.now() } });
        return res.status(200).json({ message: 'List description updated successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.addCollaborator = async (req, res) => {
    try{
        let { email, permissions } = req.body;
        if(!email || !Array.isArray(permissions))
            return res.status(400).json({ error: 'Email and permissions are required' });
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ error: 'Invalid email address' });
        let list = req.list;
        if(list.isPublic)
            return res.status(400).json({ error: 'Cannot update public list' });
        if(list.ownerId !== req.userId && !list.collaborators.some(collaborator => collaborator.userId === req.userId && collaborator.permissions.includes('addCollaborator')))
            return res.status(401).json({ error: 'Unauthorized' });

        if (list.ownerId != req.userId){
            let collaborator = list.collaborators.find(collaborator => collaborator.userId === req.userId);
            if(permissions.some(permission => !collaborator.permissions.includes(permission)))
                return res.status(400).json({ error: 'You have insufficient permissions to add this collaborator with these permissions' });
        }

        const user = await User.findById(req.userId);
        if(!user)
            return res.status(400).json({ error: 'User not found' });
        const collaborator = await User.findOne({ email });
        if(!collaborator){
            collaborator = await new User({ name: "Collaborator", email: email, country: user.country, hash_password: User.hashPassword("12345678") }).save();
        }

        await List.findByIdAndUpdate(list._id, { $addToSet: { collaborators: { userId: collaborator._id, userName: collaborator.name, permissions: permissions } } });
        return res.status(200).json({ message: 'Collaborator added successfully' });
        

    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


exports.updateCollaboratorPermissions = async (req, res) => {
    try{
        let collaboratorUserId = oid(req.params.collaboratorUserId);
        let { permissions } = req.body;
        if(!collaboratorUserId || !Array.isArray(permissions))
            return res.status(400).json({ error: 'Collaborator User ID and permissions are required' });
        let list = req.list;
        if(list.isPublic)
            return res.status(400).json({ error: 'Cannot update public list' });
        if(list.ownerId !== req.userId && !list.collaborators.some(collaborator => collaborator.userId === req.userId && collaborator.permissions.includes('updateCollaboratorPermissions')))
            return res.status(401).json({ error: 'Unauthorized' });

        if (list.ownerId != req.userId){
            let collaborator = list.collaborators.find(collaborator => collaborator.userId === req.userId);
            if(permissions.some(permission => !collaborator.permissions.includes(permission)))
                return res.status(400).json({ error: 'You have insufficient permissions to add this collaborator with these permissions' });
        }

        await List.findOneAndUpdate({ _id: list._id, "collaborators.userId": collaboratorUserId }, { $set: { "collaborators.$.permissions": permissions } });
        return res.status(200).json({ message: 'Collaborator permissions updated successfully' });
        
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.removeCollaborator = async (req, res) => {
    try{
        let collaboratorUserId = oid(req.params.collaboratorUserId);
        if(!collaboratorUserId)
            return res.status(400).json({ error: 'Collaborator User ID is required' });
        let list = req.list;
        if(list.isPublic)
            return res.status(400).json({ error: 'Cannot update public list' });
        if(list.ownerId !== req.userId && !list.collaborators.some(collaborator => collaborator.userId === req.userId && collaborator.permissions.includes('removeCollaborator')))
            return res.status(401).json({ error: 'Unauthorized' });

        await List.findOneAndUpdate({ _id: list._id, "collaborators.userId": collaboratorUserId }, { $pull: { collaborators: { userId: collaboratorUserId } } });
        return res.status(200).json({ message: 'Collaborator removed successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.addAdditionalColumn = async (req, res) => {
    try{
        let { name, type } = req.body;
        if(!name || !type)
            return res.status(400).json({ error: 'Name and type are required' });
        if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
            return res.status(400).json({ error: 'Column name must not contain special characters except spaces' });
        }
        let list = req.list;
        if(list.isPublic)
            return res.status(400).json({ error: 'Cannot update public list' });
        if(list.ownerId !== req.userId && !list.collaborators.some(collaborator => collaborator.userId === req.userId && collaborator.permissions.includes('addAdditionalColumn')))
            return res.status(401).json({ error: 'Unauthorized' });

        if (list.additionalColumns.some(column => column.name === name))
            return res.status(400).json({ error: 'Column with this name already exists' });

        await List.findOneAndUpdate({ _id: list._id }, { $addToSet: { additionalColumns: { name, type } } });
        return res.status(200).json({ message: 'Additional column added successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.removeAdditionalColumn = async (req, res) => {
    try{
        let name = req.params.columnName;
        let list = req.list;
        if(list.isPublic)
            return res.status(400).json({ error: 'Cannot update public list' });
        if(list.ownerId !== req.userId && !list.collaborators.some(collaborator => collaborator.userId === req.userId && collaborator.permissions.includes('removeAdditionalColumn')))
            return res.status(401).json({ error: 'Unauthorized' });

        if (!list.additionalColumns.some(column => column.name === name))
            return res.status(400).json({ error: 'Column with this name does not exist' });

        await List.findOneAndUpdate({ _id: list._id }, { $pull: { additionalColumns: { name } } });
        await ListItem.updateMany({ listId: list._id }, { $unset: { [name]: 1 } });
        return res.status(200).json({ message: 'Additional column removed successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.addListItem = async (req, res) => {
    try{
        let { name, qty, unit, whoBrings } = req.body;
        if(!name || !qty)
            return res.status(400).json({ error: 'Name and qty are required' });
        if(whoBrings && !Array.isArray(whoBrings))
            return res.status(400).json({ error: 'Who brings must be an array' });
        if(!unit)
            unit = "pcs";
        if(!whoBrings)
            whoBrings = [];

        let list = req.list;
        if(list.isPublic){
            if(whoBrings.some(who => !who.userName || !who.qty))
                return res.status(400).json({ error: 'Who brings must have user name and quantity' });
    
            await new ListItem({ name, qty, unit, whoBrings: whoBrings.map(who => ({ userName: who.userName, qty: who.qty })), listId: list._id }).save();
            return res.status(200).json({ message: 'Item added successfully' });
        }
        if(list.ownerId !== req.userId && !list.collaborators.some(collaborator => collaborator.userId === req.userId && collaborator.permissions.includes('addListItem')))
            return res.status(401).json({ error: 'Unauthorized' });


        if(whoBrings.some(who => !who.userName || !who.qty || !who.userId))
            return res.status(400).json({ error: 'Who brings must have user name, quantity and user ID' });
        if(whoBrings.reduce((acc, who) => acc + who.qty, 0) > qty)
            return res.status(400).json({ error: 'Total quantity of who brings must be less than or equal to the total quantity' });

        let additionalColumns = list.additionalColumns;
        let otherKeys = Object.keys(req.body).filter(key => !['name', 'qty', 'unit', 'whoBrings'].includes(key))
        let additionalColumnKeys = otherKeys.filter(key => additionalColumns.some(column => column.name === key));
        let listItem = {name, qty, unit, whoBrings};
        additionalColumnKeys.forEach(key => {
            listItem[key] = req.body[key];
        });
        await new ListItem(listItem).save();
        return res.status(200).json({ message: 'Item added successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.updateListItem = async (req, res) => {
    try{
        let listItemId = oid(req.params.itemId);
        let updateKey = req.params.updateKey;
        let value = req.body['value'];
        if(!listItemId || !updateKey)
            return res.status(400).json({ error: 'Update key is required' });

        let list = req.list;
        let listItem = await ListItem.findById(listItemId);
        if(!listItem)
            return res.status(400).json({ error: 'Item not found' });

        if(updateKey === 'whoBrings'){
            if(!Array.isArray(value))
                return res.status(400).json({ error: 'Who brings must be an array' });
            if(value.some(who => !who.userName || !who.qty))
                return res.status(400).json({ error: 'Who brings must have user name and quantity' });
            if(value.reduce((acc, who) => acc + who.qty, 0) > listItem.qty)
                return res.status(400).json({ error: 'Total quantity of who brings must be less than or equal to the total quantity' });
        }
        if(updateKey === 'qty'){
            if(typeof value !== 'number')
                return res.status(400).json({ error: 'Quantity must be a number' });
            if(value < 0)
                return res.status(400).json({ error: 'Quantity must be greater than 0' });   
            if(value < listItem.whoBrings.reduce((acc, who) => acc + who.qty, 0))
                return res.status(400).json({ error: 'Quantity must be greater than the total quantity of who brings' });
        }
        if(updateKey === 'name'){
            if(typeof value !== 'string')
                return res.status(400).json({ error: 'Name must be a string' });
        }
        if(updateKey === 'unit'){
            if(typeof value !== 'string')
                return res.status(400).json({ error: 'Unit must be a string' });
        }

        if(list.isPublic){
            if(!['name', 'qty', 'unit', 'whoBrings'].includes(updateKey))
                return res.status(400).json({ error: 'Invalid update key' });


            if(updateKey === 'whoBrings'){
                value = value.map(who => ({ userName: who.userName, qty: who.qty }));
            }

            await ListItem.findByIdAndUpdate(listItemId, { $set: { [updateKey]: value } });
            return res.status(200).json({ message: 'Item updated successfully' });
        }
        if(list.ownerId !== req.userId && !list.collaborators.some(collaborator => collaborator.userId === req.userId && collaborator.permissions.includes('updateListItem')))
            return res.status(401).json({ error: 'Unauthorized' });

        if(!list.additionalColumns.some(column => column.name === updateKey)){
            return res.status(400).json({ error: 'Invalid update key' });
        }

        await ListItem.findByIdAndUpdate(listItemId, { $set: { [updateKey]: value } });
        return res.status(200).json({ message: 'Item updated successfully' });
       
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.deleteListItem = async (req, res) => {
    try{
        let listItemId = oid(req.params.itemId);
        if(!listItemId)
            return res.status(400).json({ error: 'Item ID is required' });
        let list = req.list;
        if(list.isPublic){
            await ListItem.findByIdAndDelete(listItemId);
            return res.status(200).json({ message: 'Item deleted successfully' });
        }
        if(list.ownerId !== req.userId && !list.collaborators.some(collaborator => collaborator.userId === req.userId && collaborator.permissions.includes('deleteListItem')))
            return res.status(401).json({ error: 'Unauthorized' });
        await ListItem.findByIdAndDelete(listItemId);
        return res.status(200).json({ message: 'Item deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}