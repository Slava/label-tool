const proxy = require('http-proxy-middleware');

const mainPort = process.env.PORT || '3000';
const port = process.env.API_PORT || parseInt(mainPort, 10) + 1;
module.exports = function(app) {
  app.use(proxy('/api', { target: `http://localhost:${port}/` }));
  app.use(proxy('/uploads', { target: `http://localhost:${port}/` }));
};
