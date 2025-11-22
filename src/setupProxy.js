const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const backendPort = process.env.BACKEND_PORT || 3001;
  const target = `http://localhost:${backendPort}`;
  
  console.log('[Proxy] Setting up proxy from /socket.io to', target);
  
  // Proxy socket.io with websocket support
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      ws: true,
      logLevel: 'silent',
      onProxyReqWs: (proxyReq, req, socket) => {
        console.log('[Proxy] WebSocket connection established');
      },
      onError: (err, req, res) => {
        console.error('[Proxy] Error:', err.message);
        if (res && res.writeHead) {
          res.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          res.end('Socket proxy error');
        }
      }
    })
  );
  
  // Also proxy API routes
  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      logLevel: 'silent'
    })
  );
};
