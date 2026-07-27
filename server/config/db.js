const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Ensure indexes defined in schemas are actually created/synced on existing collections
        const Problem = require('../models/Problem');
        const Topic = require('../models/Topic');
        const Goal = require('../models/Goal');

        await Promise.all([
            Problem.syncIndexes(),
            Topic.syncIndexes(),
            Goal.syncIndexes()
        ]);
        console.log('Indexes synced successfully');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;