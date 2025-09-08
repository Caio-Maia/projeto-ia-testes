const url = require('url');
require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

morgan.token('url-sanitized', (req) => {
  const parsedUrl = url.parse(req.originalUrl, true);
  
  // Remove o token das queries
  if (parsedUrl.query.token) {
    parsedUrl.query.token = '***';
  }

  // Reconstrói a URL sem o token real
  const sanitizedQuery = new URLSearchParams(parsedUrl.query).toString();
  return parsedUrl.pathname + (sanitizedQuery ? `?${sanitizedQuery}` : '');
});

app.use(morgan(':method :url-sanitized :status :res[content-length] - :response-time ms'));

app.use(express.json());
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});