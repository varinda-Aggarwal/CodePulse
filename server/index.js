const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const problemRoutes = require('./routes/problemRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.send('CodePulse Server is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});