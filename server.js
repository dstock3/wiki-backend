const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const articleRoutes = require('./routes/articleRoutes');
const portalRoutes = require('./routes/portalRoutes');
const talkRoutes = require('./routes/talkRoutes');
const userRoutes = require('./routes/userRoutes');
require('./database.js');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(morgan('combined'));
app.use('/articles', articleRoutes);
app.use('/portals', portalRoutes);
app.use('/talk', talkRoutes);
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});