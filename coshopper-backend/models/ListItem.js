const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListItemSchema = new Schema({
    listId: {
        type: Schema.Types.ObjectId
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },
    qty: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        default: "pcs",
    },  
    whoBrings: {
        type: [{
            _id: false,
            userId: {
                type: Schema.Types.ObjectId
            },
            userName: {
                type: String,
            },
            qty: {
                type: String,
            },
        }],
        default: [],
    },
    addedBy: {
        type: Schema.Types.ObjectId
    }
}, { strict: false});

mongoose.model("ListItem", ListItemSchema);
