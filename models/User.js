const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3, // Example validation for minimum length
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: true,
    },
    // Add any other fields you need, such as roles, etc.
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
