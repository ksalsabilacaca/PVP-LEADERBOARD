let clients = [];

const sseHandler = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Add the response stream to clients list
  clients.push(res);
  console.log(`SSE client connected. Total clients: ${clients.length}`);

  // Ping client to keep connection alive
  const pingInterval = setInterval(() => {
    res.write(':\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(pingInterval);
    clients = clients.filter((client) => client !== res);
    console.log(`SSE client disconnected. Total clients: ${clients.length}`);
  });
};

const broadcast = (type, data = {}) => {
  const payload = JSON.stringify({ type, data });
  clients.forEach((client) => {
    client.write(`data: ${payload}\n\n`);
  });
};

module.exports = {
  sseHandler,
  broadcast,
};
