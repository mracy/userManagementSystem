require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const User = require('./models/User'); // Import the User model

const app = express();
app.use(express.json());
app.use(cors());

const jwtSecret = process.env.JWT_SECRET;
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(error => console.error('Error connecting to MongoDB Atlas:', error));

// Register a new user
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Example: Validate username length (minimum 3 characters)
        if (username.length < 3) {
            return res.status(400).send('Username must be at least 3 characters long.');
        }

        // Example: Validate email format using a regex pattern
        const emailRegex = /.+@.+\..+/;
        if (!emailRegex.test(email)) {
            return res.status(400).send('Please enter a valid email address.');
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new User instance
        const user = new User({ username, email, password: hashedPassword });

        // Save the user to the database
        await user.save();

        // Respond with a success message
        res.status(201).send('User registered successfully.');
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error registering user:', error);

        // Respond with an error message
        res.status(500).send('Error registering user. Please try again later.');
    }
});


// User login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.send({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

// User reset password endpoint
app.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Hash the new password using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Ensure the email is in the same case format as stored in the DB
        const emailLowerCase = email.toLowerCase();


        // Update the user's password in the database
        const result = await User.updateOne({ email: emailLowerCase }, { $set: { password: hashedPassword } });
        console.log('Update result:', result);

        // Check if the password was successfully updated
        if (result.modifiedCount === 1) {
            const updatedUser = await User.findOne({ email: emailLowerCase });
            console.log('Updated user:', updatedUser);
            return res.send('Password reset successfully');
        }

        // If no password was modified, check if the user exists
        const user = await User.findOne({ email: emailLowerCase });
        if (!user) {
            console.log('User not found:', emailLowerCase);
            return res.status(404).send('User not found');
        }

        // If there was an unexpected issue with updating the password
        console.error('Password update failed for:', emailLowerCase, error);

        return res.status(500).send('Password update failed');
    } catch (error) {
        // Handle any errors that occur during password reset
        console.error('Error resetting password:', error);
        return res.status(500).send('Error resetting password');
    }
});


// Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, email: 1 });
        res.send(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    }
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, email } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { username, email }, { new: true });
        if (!updatedUser) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
    }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).send('User not found');
        }
        res.status(200).send('User deleted');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
