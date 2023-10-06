'use strict'
const mongoose = require('mongoose')
async function connectDb(url ) {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = connectDb;
