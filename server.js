const express = require('express');
const rateLimit = require("express-rate-limit");
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const initializePassport = require('./passport-config');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./logger');
const setupHelmet = require('./helmetConfig');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();
const articleRoutes = require('./routes/articleRoutes');
const portalRoutes = require('./routes/portalRoutes');
const talkRoutes = require('./routes/talkRoutes');
const userRoutes = require('./routes/userRoutes');

SECRET = process.env.SECRET_KEY;
NAME = process.env.SESSION_NAME;

require('./database.js');

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,                  
  message: "Too many requests, please try again later."
});

const PORT = 5000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:3001',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(session({
  name: NAME,
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

initializePassport(passport);
setupHelmet(app);
app.use(mongoSanitize());

app.use('/articles', apiLimiter, articleRoutes);
app.use('/portals', apiLimiter, portalRoutes);
app.use('/talk', apiLimiter, talkRoutes);
app.use('/users', apiLimiter, userRoutes);

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  logger.error(`${error.status || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(error.status || 500).send({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});