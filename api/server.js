const express = require('express');

const projectsRouter = require('./projects-router');

const server = express();

server.use('/api/projects', projectsRouter);

server.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = server;
