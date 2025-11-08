// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
    },
}, { timestamps: true }); // timestamps `createdAt` aur `updatedAt` fields add kar dega

module.exports = mongoose.model('User', UserSchema);