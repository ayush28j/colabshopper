const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    ownerId: {
        type: Schema.Types.ObjectId
    },
    ownerName: {
        type: String,
    },
    collaborators: {
        type: [{
            _id: false,
            userId: {
                type: Schema.Types.ObjectId
            },
            userName: {
                type: String
            },
            userEmail: {
                type: String
            },
            permissions: {
                type: [String],
                default: ['addItem', 'editItem', 'deleteItem', 'editDescription'],
            },
        }],
        default: [],
    },
    additionalColumns: {
        type: [{
            name: {
                type: String,
            },
            type: {
                type: String,
            }
        }],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

mongoose.model("List", ListSchema);
