const proxy = require('http-proxy-middleware');

const port = process.env.API_PORT;
module.exports = function(app) {
  app.use(proxy('/api', { target: `http://localhost:${port}/` }));
  app.use(proxy('/uploads', { target: `http://localhost:${port}/` }));
};
