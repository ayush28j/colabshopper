const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    hash_password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    country: {
        type: String,
        trim: true,
        required: true,
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

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.hash_password);
};

UserSchema.statics.hashPassword = function (password) {
    return bcrypt.hashSync(password, 10);
}

mongoose.model("User", UserSchema);
