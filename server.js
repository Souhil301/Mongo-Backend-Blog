const express = require('express'),
      connectDB = require('./config/connectDB'),
      { errorHandler, notFound } = require('./middlewares/error'),
      compression = require('compression'),
      rateLimiting = require('express-rate-limit'),
      helmet = require('helmet'),
      hpp = require('hpp'),
      cors = require('cors')

require('dotenv').config();
connectDB();
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',  
    credentials: true, 
    optionsSuccessStatus: 200  
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Headers
app.use(helmet());
app.use(helmet.xssFilter());

// HTTP Protect
app.use(hpp());

// Rate Limiting
app.use(rateLimiting({
    windowMs: 10 * 60 * 1000, // 10 Minutes
    max: 200,
}));


app.use(compression());
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/users', require('./routes/usersRoute'));
app.use('/api/posts', require('./routes/postsRoute'));
app.use('/api/comments', require('./routes/commentsRoute'));
app.use('/api/categories', require('./routes/categoriesRoute'));
app.use('/api/password/reset-password', require('./routes/passwordRoute'));
app.use(notFound);
app.use(errorHandler);

app.listen(2400 || process.env.PORT, () => {
    console.log('Ready To Go In 2400!!');
});
