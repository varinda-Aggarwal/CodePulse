require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const problemRoutes = require('./routes/problemRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const goalRoutes = require('./routes/goalRoutes');
const profileRoutes = require('./routes/profileRoutes');
const passport = require('./config/passport');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/profile', profileRoutes);
app.use(passport.initialize());
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('CodePulse Server is running!');
});

const PORT = process.env.PORT || 5000;

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});