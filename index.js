const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("mongoDB connected"));

const authRouter = require('./routes/auth');
const noteRouter = require('./routes/notes');

// Set up rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });

// Apply the rate limiter to all requests
app.use(apiLimiter);

app.use('/api/auth', authRouter);
app.use('/api/notes', noteRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
