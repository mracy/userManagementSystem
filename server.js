require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const generateJwtSecret = require('./jwtSecretGenerator'); // Import JWT secret generator

const app = express();
app.use(express.json());
app.use(cors());

// Generate JWT secret
const jwtSecret = process.env.JWT_SECRET;

// Output the generated JWT secret
console.log('Generated JWT secret:', jwtSecret);

// Replace <username>, <password>, and <dbname> with your actual MongoDB Atlas credentials and database name.
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(error => console.error('Error connecting to MongoDB Atlas:', error));

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

// Register a new user
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
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



// Reset user password endpoint
app.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await User.updateOne({ email }, { password: hashedPassword });
        
        if (result.nModified === 1) {
            res.send('Password reset successfully');
        } else {
            const user = await User.findOne({ email });
            if (!user) {
                res.status(404).send('User not found');
            } else {
                res.status(500).send('Password update failed');
            }
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Error resetting password');
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
