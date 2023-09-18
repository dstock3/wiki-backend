const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./passport-config');  
require('dotenv').config();

const articleRoutes = require('./routes/articleRoutes');
const portalRoutes = require('./routes/portalRoutes');
const talkRoutes = require('./routes/talkRoutes');
const userRoutes = require('./routes/userRoutes');

SECRET = process.env.SECRET_KEY;

require('./database.js');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(morgan('combined'));

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

initializePassport(passport);

app.use('/articles', articleRoutes);
app.use('/portals', portalRoutes);
app.use('/talk', talkRoutes);
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});