// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads .env file content into process.env

const authRoutes = require('./routes/auth');
// Aapke doosre routes (bills, purchases, etc.) bhi yahan import honge
// const billRoutes = require('./routes/bills'); 

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors()); // Cross-Origin Resource Sharing enable karega
app.use(express.json()); // Request body ko JSON mein parse karega

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Clothing Showroom Billing API is running!');
});

app.use('/api/auth', authRoutes);
// app.use('/api/bills', billRoutes); // Example for other routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});