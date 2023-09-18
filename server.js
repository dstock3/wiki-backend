const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const articleRoutes = require('./routes/articleRoutes');
require('./database.js');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(morgan('combined'));
app.use('/articles', articleRoutes);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});